import type { DrawConfig } from '@interfaces/index'
import type {
  DrawOperation,
  DirtyRegion,
  PooledCanvas,
  SmartMetrics,
  CanvasState,
  GradientConfig,
  GradientStop,
  PooledCanvasElement
} from '@interfaces/NeaSmart'
import { ToolRegistry } from '@canvas/tools/Registry'
import { ErrorCanvas } from '@constants/ErrorCanvas'
import { Default } from '@constants/Default'
import { isNode } from '@canvas/Environment'
import { QuadTree, type SpatialObject } from '@framework/utils/SpatialIndex'

/** Canvas context type for cross-environment compatibility */
type CanvasContext = CanvasRenderingContext2D | Record<string, unknown>

/** Re-export interfaces for external use */
export type { DirtyRegion, SmartMetrics } from '@interfaces/NeaSmart'

/**
 * Handles canvas drawing operations with batching, spatial optimization, caching, pooling, and dirty region tracking.
 * Used internally by layout management for resource management.
 */
export class NeaSmart {
  private gradientCache = new Map<string, CanvasGradient>()
  private patternCache = new Map<string, CanvasPattern>()
  private drawQueue: DrawOperation[] = []
  private maxQueueSize = Default.QUEUE_MAX_SIZE
  private canvasPool: PooledCanvas[] = []
  private maxPoolSize = Default.POOL_MAX_SIZE
  private poolTimeout = Default.POOL_TIMEOUT
  private dirtyRegions: DirtyRegion[] = []
  private spatialDirtyIndex: QuadTree = new QuadTree(0, 0, 4096, 4096)
  private maxDirtyRegions = Default.DIRTY_REGIONS_MAX
  private metrics: SmartMetrics = {
    operationsBatched: 0,
    cacheHits: 0,
    cacheMisses: 0,
    poolHits: 0,
    poolMisses: 0,
    dirtyRegionRedraws: 0
  }
  private readonly TRANSPARENT = 'transparent'
  private readonly SOURCE_OVER = 'source-over'
  private readonly NONE = 'none'

  /**
   * Queues a draw operation for batching.
   * @param shape Shape type to draw
   * @param options Drawing options
   * @param layoutName Name of the layout for error tracking
   * @returns Operation ID for tracking
   * @throws Error if operation queuing fails
   */
  queue(
    shape: string,
    options: DrawConfig,
    layoutName: string = 'unknown'
  ): string {
    if (!ToolRegistry.has(shape)) {
      throw new Error(
        ErrorCanvas.UNKNOWN_DRAWING_TOOL(
          layoutName,
          shape,
          ToolRegistry.getAvailableTools().slice(0, 10).join(', ')
        )
      )
    }
    const operation: DrawOperation = {
      shape,
      options,
      timestamp: Date.now(),
      id: `${shape}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    }
    this.drawQueue.push(operation)
    this.metrics.operationsBatched++
    if (this.drawQueue.length >= this.maxQueueSize) {
      this.flush()
    }
    return operation.id
  }

  /**
   * Flushes all queued draw operations, optionally to a provided canvas context.
   * @param ctx Canvas context to draw on (optional)
   */
  flush(ctx?: CanvasContext): void {
    if (this.drawQueue.length === 0) {
      return
    }
    if (ctx) {
      this.executeBatch(ctx, this.drawQueue)
    }
    this.drawQueue = []
  }

  /**
   * Executes a batch of draw operations with multi-level grouping.
   * @param ctx Canvas context
   * @param operations Operations to execute
   * @throws Error if canvas context operations fail
   */
  private executeBatch(ctx: CanvasContext, operations: DrawOperation[]): void {
    if (operations.length === 0) {
      return
    }
    ;(ctx as CanvasRenderingContext2D).save()
    const optimizedGroups = this.createOptimizedBatches(operations)
    for (const batch of optimizedGroups) {
      this.executeBatchGroup(ctx, batch)
    }
    ;(ctx as CanvasRenderingContext2D).restore()
  }

  /**
   * Creates optimized batches using multi-level grouping strategy.
   * @param operations Operations to optimize
   * @returns Array of optimized operation batches
   */
  private createOptimizedBatches(
    operations: DrawOperation[]
  ): DrawOperation[][] {
    const shapeTypeGroups = this.groupOperationsByShapeType(operations)
    const optimizedBatches: DrawOperation[][] = []
    for (const [, shapeOps] of shapeTypeGroups) {
      const stateGroups = this.groupOperationsByState(shapeOps)
      for (const [, stateOps] of stateGroups) {
        const spatialBatches = this.applySpatialGrouping(stateOps)
        optimizedBatches.push(...spatialBatches)
      }
    }
    return optimizedBatches
  }

  /**
   * Groups operations by shape type for rendering pipeline.
   * @param operations Operations to group
   * @returns Map of shape types to operations
   */
  private groupOperationsByShapeType(
    operations: DrawOperation[]
  ): Map<string, DrawOperation[]> {
    const groups = new Map<string, DrawOperation[]>()
    if (operations.length === 0) {
      return groups
    }
    for (const op of operations) {
      if (!op || !op.shape) {
        continue
      }
      const shapeType = op.shape
      if (!groups.has(shapeType)) {
        groups.set(shapeType, [])
      }
      groups.get(shapeType)!.push(op)
    }
    return groups
  }

  /**
   * Applies spatial grouping to operations for cache locality.
   * @param operations Operations to group spatially
   * @returns Array of spatially grouped operation batches
   */
  private applySpatialGrouping(operations: DrawOperation[]): DrawOperation[][] {
    if (operations.length <= 10) {
      return [operations]
    }
    const sortedOps = operations.sort((a, b) => {
      const aY = a.options.y || 0
      const bY = b.options.y || 0
      if (Math.abs(aY - bY) > 50) {
        return aY - bY
      }
      const aX = a.options.x || 0
      const bX = b.options.x || 0
      return aX - bX
    })
    const batches: DrawOperation[][] = []
    const batchSize = 25
    for (let i = 0; i < sortedOps.length; i += batchSize) {
      batches.push(sortedOps.slice(i, i + batchSize))
    }
    return batches
  }

  /**
   * Executes a single optimized batch group.
   * @param ctx Canvas context
   * @param operations Operations in the batch
   */
  private executeBatchGroup(
    ctx: CanvasContext,
    operations: DrawOperation[]
  ): void {
    if (operations.length === 0) {
      return
    }
    const firstOp = operations[0]
    if (firstOp) {
      const stateKey = this.getStateKey(firstOp.options)
      this.applyCanvasState(ctx, stateKey)
      for (const op of operations) {
        this.executeDrawOperation(ctx, op)
      }
    }
  }

  /**
   * Groups draw operations by similar canvas state for batching.
   * @param operations Operations to group
   * @returns Map of state keys to operations
   */
  private groupOperationsByState(
    operations: DrawOperation[]
  ): Map<string, DrawOperation[]> {
    const groups = new Map<string, DrawOperation[]>()
    for (const op of operations) {
      const stateKey = this.getStateKey(op.options)
      if (!groups.has(stateKey)) {
        groups.set(stateKey, [])
      }
      groups.get(stateKey)!.push(op)
    }
    return groups
  }

  /**
   * Generates a state key for grouping operations.
   * @param options Drawing options
   * @returns State key string
   */
  private getStateKey(options: DrawConfig): string {
    const state: CanvasState = {
      fill: options.fill || this.TRANSPARENT,
      stroke: options.stroke || this.TRANSPARENT,
      lineWidth: options.strokeWidth || 1,
      opacity: options.opacity !== undefined ? options.opacity : 1,
      blendMode: options.blendMode || this.SOURCE_OVER,
      shadow: options.shadow ? JSON.stringify(options.shadow) : this.NONE,
      glow: options.glow ? JSON.stringify(options.glow) : this.NONE
    }
    return JSON.stringify(state)
  }

  /**
   * Applies a canvas state to the context.
   * @param ctx Canvas context
   * @param stateKey State key to apply
   * @throws Error if state parsing fails
   */
  private applyCanvasState(ctx: CanvasContext, stateKey: string): void {
    const state = this.parseCanvasState(stateKey)
    this.applyFillAndStroke(ctx, state)
    this.applyOpacityAndBlending(ctx, state)
    this.applyShadowEffects(ctx, state)
  }

  /**
   * Parses canvas state from JSON string.
   * @param stateKey State key to parse
   * @returns Parsed state
   * @throws Error if JSON parsing fails
   */
  private parseCanvasState(stateKey: string): CanvasState {
    try {
      return JSON.parse(stateKey)
    } catch {
      throw new Error(ErrorCanvas.INVALID_CANVAS_STATE(stateKey))
    }
  }

  /**
   * Applies fill and stroke properties to context.
   * @param ctx Canvas context
   * @param state Canvas state
   */
  private applyFillAndStroke(ctx: CanvasContext, state: CanvasState): void {
    if (state.fill !== this.TRANSPARENT) {
      ctx.fillStyle = this.getCachedFillStyle(
        ctx,
        state.fill as string | { gradient: GradientConfig }
      )
    }
    if (state.stroke !== this.TRANSPARENT) {
      ctx.strokeStyle = state.stroke
      ctx.lineWidth = state.lineWidth
    }
  }

  /**
   * Applies opacity and blending properties to context.
   * @param ctx Canvas context
   * @param state Canvas state
   */
  private applyOpacityAndBlending(
    ctx: CanvasContext,
    state: CanvasState
  ): void {
    if (state.opacity !== 1) {
      ctx.globalAlpha = state.opacity
    }
    if (state.blendMode !== this.SOURCE_OVER) {
      ctx.globalCompositeOperation = state.blendMode
    }
  }

  /**
   * Applies shadow and glow effects to context.
   * @param ctx Canvas context
   * @param state Canvas state
   */
  private applyShadowEffects(ctx: CanvasContext, state: CanvasState): void {
    if (state.shadow !== this.NONE) {
      this.applyShadowEffect(ctx, state.shadow)
    }
    if (state.glow !== this.NONE) {
      this.applyGlowEffect(ctx, state.glow)
    }
  }

  /**
   * Applies shadow effect to context.
   * @param ctx Canvas context
   * @param shadowData Shadow data string
   * @throws Error if shadow JSON parsing fails
   */
  private applyShadowEffect(ctx: CanvasContext, shadowData: string): void {
    try {
      const shadow = JSON.parse(shadowData)
      if (shadow && typeof shadow === 'object') {
        ctx.shadowOffsetX = shadow.offsetX || 0
        ctx.shadowOffsetY = shadow.offsetY || 0
        ctx.shadowBlur = shadow.blur || 0
        ctx.shadowColor = shadow.color || 'transparent'
      }
    } catch {
      throw new Error(ErrorCanvas.INVALID_SHADOW_STATE(shadowData))
    }
  }

  /**
   * Applies glow effect to context.
   * @param ctx Canvas context
   * @param glowData Glow data string
   * @throws Error if glow JSON parsing fails
   */
  private applyGlowEffect(ctx: CanvasContext, glowData: string): void {
    try {
      const glow = JSON.parse(glowData)
      if (glow && typeof glow === 'object') {
        ctx.shadowColor = glow.color || 'transparent'
        ctx.shadowBlur = glow.blur || 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
    } catch {
      throw new Error(ErrorCanvas.INVALID_GLOW_STATE(glowData))
    }
  }

  /**
   * Executes a single draw operation using the appropriate tool.
   * @param ctx Canvas context
   * @param operation Operation to execute
   * @throws Error if tool execution fails or tool not found
   */
  private executeDrawOperation(
    ctx: CanvasContext,
    operation: DrawOperation
  ): void {
    try {
      const tool = ToolRegistry.get(operation.shape)
      if (tool) {
        this.applyOperationOptions(ctx, operation.options)
        tool(ctx as CanvasRenderingContext2D, operation.options)
      } else {
        throw new Error(ErrorCanvas.UNKNOWN_SHAPE_TOOL(operation.shape))
      }
    } catch (error) {
      throw new Error(ErrorCanvas.OPERATION_FAILURE(operation.shape), {
        cause: error
      })
    }
  }

  /**
   * Applies operation-specific drawing options to the context.
   * @param ctx Canvas context
   * @param options Drawing options
   */
  private applyOperationOptions(ctx: CanvasContext, options: DrawConfig): void {
    if (options.fill && options.fill !== this.TRANSPARENT) {
      ctx.fillStyle = this.getCachedFillStyle(ctx, options.fill)
    }
    if (options.stroke && options.stroke !== this.TRANSPARENT) {
      ctx.strokeStyle = options.stroke
      ctx.lineWidth = options.strokeWidth || 1
    }
    if (options.opacity !== undefined && options.opacity !== 1) {
      ctx.globalAlpha = options.opacity
    }
    if (options.blendMode && options.blendMode !== this.SOURCE_OVER) {
      ctx.globalCompositeOperation = options.blendMode
    }
    if (options.shadow) {
      ctx.shadowOffsetX = options.shadow.offsetX
      ctx.shadowOffsetY = options.shadow.offsetY
      ctx.shadowBlur = options.shadow.blur
      ctx.shadowColor = options.shadow.color
    }
    if (options.glow) {
      ctx.shadowColor = options.glow.color
      ctx.shadowBlur = options.glow.blur
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }
  }

  /**
   * Gets a cached fill style (color or gradient) for the context.
   * @param ctx Canvas context
   * @param fillStyle Fill style to get
   * @returns Cached or new fill style
   * @throws Error if gradient creation fails
   */
  getCachedFillStyle(
    ctx: CanvasContext,
    fillStyle: string | { gradient: GradientConfig }
  ): string | CanvasGradient {
    if (typeof fillStyle === 'string') {
      return fillStyle
    }
    if (fillStyle && fillStyle.gradient) {
      const key = JSON.stringify(fillStyle.gradient)
      if (this.gradientCache.has(key)) {
        this.metrics.cacheHits++
        return this.gradientCache.get(key) as CanvasGradient
      }
      this.metrics.cacheMisses++
      const gradient = this.createGradient(ctx, fillStyle.gradient)
      this.gradientCache.set(key, gradient)
      return gradient
    }
    return 'transparent'
  }

  /**
   * Creates a gradient for the context.
   * @param ctx Canvas context
   * @param gradientConfig Gradient configuration
   * @returns Canvas gradient
   * @throws Error if gradient creation fails
   */
  private createGradient(
    ctx: CanvasContext,
    gradientConfig: GradientConfig
  ): CanvasGradient {
    if (gradientConfig.type === 'linear') {
      const gradient = (ctx as CanvasRenderingContext2D).createLinearGradient(
        gradientConfig.x0 || 0,
        gradientConfig.y0 || 0,
        gradientConfig.x1 || 100,
        gradientConfig.y1 || 100
      )
      gradientConfig.stops.forEach((stop: GradientStop) => {
        gradient.addColorStop(stop.offset, stop.color)
      })
      return gradient
    } else {
      const gradient = (ctx as CanvasRenderingContext2D).createRadialGradient(
        gradientConfig.x || 0,
        gradientConfig.y || 0,
        gradientConfig.r0 || 0,
        gradientConfig.x || 0,
        gradientConfig.y || 0,
        gradientConfig.r1 || 100
      )
      gradientConfig.stops.forEach((stop: GradientStop) => {
        gradient.addColorStop(stop.offset, stop.color)
      })
      return gradient
    }
  }

  /**
   * Gets a canvas from the pool or creates a new one.
   * @param width Canvas width
   * @param height Canvas height
   * @returns Promise resolving to canvas element
   * @throws Error if Node.js canvas creation fails
   */
  async getCanvas(width: number, height: number): Promise<PooledCanvasElement> {
    const poolIndex = this.canvasPool.findIndex(
      item => item.width === width && item.height === height
    )
    if (poolIndex !== -1) {
      const pooled = this.canvasPool.splice(poolIndex, 1)[0]
      if (pooled) {
        pooled.lastUsed = Date.now()
        this.metrics.poolHits++
        return pooled.canvas
      }
    }
    this.metrics.poolMisses++
    if (isNode()) {
      return await this.createNodeCanvas(width, height)
    } else {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      return canvas
    }
  }

  /**
   * Returns a canvas to the pool for reuse.
   * @param canvas Canvas to return
   * @param width Canvas width
   * @param height Canvas height
   */
  returnCanvas(
    canvas: PooledCanvasElement,
    width: number,
    height: number
  ): void {
    if (this.canvasPool.length >= this.maxPoolSize) {
      this.canvasPool.shift()
    }
    if (isNode()) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, width, height)
      }
    } else {
      const tempWidth = canvas.width
      canvas.width = tempWidth
    }
    this.canvasPool.push({
      canvas,
      width,
      height,
      lastUsed: Date.now()
    })
  }

  /**
   * Creates a Node.js canvas for pooling.
   * @param width Canvas width
   * @param height Canvas height
   * @returns Node.js canvas
   * @throws Error if canvas package is not installed
   */
  private async createNodeCanvas(
    width: number,
    height: number
  ): Promise<PooledCanvasElement> {
    try {
      const { createCanvas } = await import('canvas')
      return createCanvas(width, height) as unknown as PooledCanvasElement
    } catch {
      throw new Error(ErrorCanvas.NODE_CANVAS_PACKAGE_MISSING)
    }
  }

  /**
   * Marks a region as dirty for partial redraws using spatial indexing.
   * @param x Region X coordinate
   * @param y Region Y coordinate
   * @param width Region width
   * @param height Region height
   */
  markDirty(x: number, y: number, width: number, height: number): void {
    const region: DirtyRegion = { x, y, width, height }
    const regionId = `dirty_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const overlapping = this.spatialDirtyIndex.query(x, y, width, height)
    if (overlapping.length > 0) {
      const merged = this.mergeWithSpatialRegions(region, overlapping, regionId)
      if (merged) {
        return
      }
    }
    this.dirtyRegions.push(region)
    this.spatialDirtyIndex.insert({
      id: regionId,
      x,
      y,
      width,
      height
    })
    if (this.dirtyRegions.length > this.maxDirtyRegions) {
      this.cleanupOldestDirtyRegion()
    }
  }

  /**
   * Merges a new region with spatially overlapping regions.
   * @param newRegion New region to merge
   * @param overlapping Spatially overlapping regions from index
   * @param regionId ID for the new region
   * @returns True if region was merged, false if should be added as new
   */
  private mergeWithSpatialRegions(
    newRegion: DirtyRegion,
    overlapping: SpatialObject[],
    regionId: string
  ): boolean {
    const bestCandidate = this.findBestMergeCandidate(newRegion, overlapping)
    if (!bestCandidate) {
      return false
    }
    return this.performSpatialMerge(bestCandidate, newRegion, regionId)
  }

  /**
   * Finds the best merge candidate from overlapping regions.
   * @param newRegion New region to merge
   * @param overlapping Spatially overlapping regions
   * @returns Best merge candidate or null
   */
  private findBestMergeCandidate(
    newRegion: DirtyRegion,
    overlapping: SpatialObject[]
  ): { region: DirtyRegion; index: number; spatialId: string } | null {
    let bestCandidate: {
      region: DirtyRegion
      index: number
      spatialId: string
    } | null = null
    let smallestMergedArea = Infinity
    for (const spatialObj of overlapping) {
      const candidate = this.evaluateMergeCandidate(spatialObj, newRegion)
      if (candidate && candidate.mergedArea < smallestMergedArea) {
        smallestMergedArea = candidate.mergedArea
        bestCandidate = {
          region: candidate.region,
          index: candidate.index,
          spatialId: spatialObj.id
        }
      }
    }
    return bestCandidate
  }

  /**
   * Evaluates a single merge candidate.
   * @param spatialObj Spatial object to evaluate
   * @param newRegion New region to merge with
   * @returns Evaluation result or null
   */
  private evaluateMergeCandidate(
    spatialObj: SpatialObject,
    newRegion: DirtyRegion
  ): { region: DirtyRegion; index: number; mergedArea: number } | null {
    const regionIndex = this.dirtyRegions.findIndex(
      r =>
        r.x === spatialObj.x &&
        r.y === spatialObj.y &&
        r.width === spatialObj.width &&
        r.height === spatialObj.height
    )
    if (regionIndex === -1) {
      return null
    }
    const existingRegion = this.dirtyRegions[regionIndex]
    if (!existingRegion || !this.regionsOverlap(existingRegion, newRegion)) {
      return null
    }
    const merged = this.mergeRegions(existingRegion, newRegion)
    if (!merged) {
      return null
    }
    return {
      region: existingRegion,
      index: regionIndex,
      mergedArea: merged.width * merged.height
    }
  }

  /**
   * Performs the actual spatial merge operation.
   * @param candidate Best merge candidate
   * @param newRegion New region to merge
   * @param regionId ID for the merged region
   * @returns True if merge was successful
   */
  private performSpatialMerge(
    candidate: { region: DirtyRegion; index: number; spatialId: string },
    newRegion: DirtyRegion,
    regionId: string
  ): boolean {
    const merged = this.mergeRegions(candidate.region, newRegion)
    if (!merged) {
      return false
    }
    this.spatialDirtyIndex.remove({
      id: candidate.spatialId,
      x: candidate.region.x,
      y: candidate.region.y,
      width: candidate.region.width,
      height: candidate.region.height
    })
    this.dirtyRegions[candidate.index] = merged
    this.spatialDirtyIndex.insert({
      id: regionId,
      x: merged.x,
      y: merged.y,
      width: merged.width,
      height: merged.height
    })
    return true
  }

  /**
   * Updates the spatial index bounds for dirty regions when canvas is resized.
   * @param width New canvas width
   * @param height New canvas height
   */
  updateSpatialBounds(width: number, height: number): void {
    const existingRegions = [...this.dirtyRegions]
    this.spatialDirtyIndex = new QuadTree(0, 0, width, height)
    for (let i = 0; i < existingRegions.length; i++) {
      const region = existingRegions[i]
      if (region) {
        const regionId = `dirty_${Date.now()}_${i}`
        this.spatialDirtyIndex.insert({
          id: regionId,
          x: region.x,
          y: region.y,
          width: region.width,
          height: region.height
        })
      }
    }
  }

  /**
   * Removes the oldest dirty region from both array and spatial index.
   */
  private cleanupOldestDirtyRegion(): void {
    const oldestRegion = this.dirtyRegions.shift()
    if (oldestRegion) {
      const candidates = this.spatialDirtyIndex.query(
        oldestRegion.x,
        oldestRegion.y,
        oldestRegion.width,
        oldestRegion.height
      )
      for (const candidate of candidates) {
        if (
          candidate.x === oldestRegion.x &&
          candidate.y === oldestRegion.y &&
          candidate.width === oldestRegion.width &&
          candidate.height === oldestRegion.height
        ) {
          this.spatialDirtyIndex.remove(candidate)
          break
        }
      }
    }
  }

  /**
   * Checks if two regions overlap.
   * @param region1 First region
   * @param region2 Second region
   * @returns True if regions overlap
   */
  private regionsOverlap(region1: DirtyRegion, region2: DirtyRegion): boolean {
    return !(
      region1.x + region1.width < region2.x ||
      region2.x + region2.width < region1.x ||
      region1.y + region1.height < region2.y ||
      region2.y + region2.height < region1.y
    )
  }

  /**
   * Merges two overlapping regions into a single region.
   * @param region1 First region
   * @param region2 Second region
   * @returns Merged region or undefined if merge fails
   * @throws Error if region calculation fails
   */
  private mergeRegions(
    region1: DirtyRegion,
    region2: DirtyRegion
  ): DirtyRegion | undefined {
    try {
      const x = Math.min(region1.x, region2.x)
      const y = Math.min(region1.y, region2.y)
      const width =
        Math.max(region1.x + region1.width, region2.x + region2.width) - x
      const height =
        Math.max(region1.y + region1.height, region2.y + region2.height) - y
      return { x, y, width, height }
    } catch {
      return undefined
    }
  }

  /**
   * Gets all dirty regions for partial redraw.
   * @returns Array of dirty regions
   */
  getDirtyRegions(): DirtyRegion[] {
    return [...this.dirtyRegions]
  }

  /**
   * Clears all dirty regions after redraw.
   */
  clearDirtyRegions(): void {
    this.dirtyRegions = []
    this.spatialDirtyIndex.clear()
    this.metrics.dirtyRegionRedraws++
  }

  /**
   * Gets metrics for batching, caching, and pooling.
   * @returns Metrics object
   */
  getMetrics(): typeof this.metrics {
    return { ...this.metrics }
  }

  /**
   * Cleans up old cached items and pooled canvases based on timeout settings.
   */
  cleanup(): void {
    const now = Date.now()
    this.cleanupCache()
    this.canvasPool = this.canvasPool.filter(
      item => now - item.lastUsed < this.poolTimeout
    )
  }

  /**
   * Cleans up old cached items to prevent memory bloat.
   */
  private cleanupCache(): void {
    if (this.gradientCache.size > 100) {
      const entries = Array.from(this.gradientCache.entries())
      this.gradientCache.clear()
      entries.slice(-50).forEach(([key, value]) => {
        this.gradientCache.set(key, value)
      })
    }
    if (this.patternCache.size > 50) {
      const entries = Array.from(this.patternCache.entries())
      this.patternCache.clear()
      entries.slice(-25).forEach(([key, value]) => {
        this.patternCache.set(key, value)
      })
    }
  }
}
