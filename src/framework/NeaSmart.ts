import type {
  DrawConfig,
  DrawOperation,
  DirtyRegion,
  PooledCanvas,
  SmartMetrics,
  CanvasState,
  GradientConfig,
  GradientStop,
  PooledCanvasElement
} from '@interfaces/index'
import { ToolRegistry } from '@canvas/tools/Registry'
import { isNode } from '@canvas/Environment'
import { Default } from '@constants/index'

/** Canvas context type for cross-environment compatibility */
type CanvasContext = CanvasRenderingContext2D | Record<string, unknown>

/** Re-export interfaces for external use */
export type { DirtyRegion, SmartMetrics } from '@interfaces/index'

/**
 * Optimization system for NeaLayout
 * Handles batching, caching, canvas pooling, and dirty region tracking
 */
export class NeaSmart {
  private drawQueue: DrawOperation[] = []
  private maxQueueSize = Default.QUEUE_MAX_SIZE
  private gradientCache = new Map<string, unknown>()
  private patternCache = new Map<string, unknown>()
  private shapeCache = new Map<string, unknown>()
  private canvasPool: PooledCanvas[] = []
  private maxPoolSize = Default.POOL_MAX_SIZE
  private poolTimeout = Default.POOL_TIMEOUT
  private dirtyRegions: DirtyRegion[] = []
  private maxDirtyRegions = Default.DIRTY_REGIONS_MAX
  private metrics: SmartMetrics = {
    operationsBatched: 0,
    cacheHits: 0,
    cacheMisses: 0,
    poolHits: 0,
    poolMisses: 0,
    dirtyRegionRedraws: 0
  }
  private maxRetries = Default.MAX_RETRIES
  private retryDelay = Default.RETRY_DELAY
  private failedOperations: Map<
    string,
    { operation: DrawOperation; retryCount: number; lastRetry: number }
  > = new Map()
  private readonly TRANSPARENT = 'transparent'
  private readonly SOURCE_OVER = 'source-over'
  private readonly NONE = 'none'

  /**
   * Queues a draw operation for batching
   * @param shape - Shape type to draw
   * @param options - Drawing options
   * @returns Operation ID for tracking
   * @throws Error if operation queuing fails
   */
  queue(shape: string, options: DrawConfig): string {
    if (!ToolRegistry.has(shape)) {
      throw new Error(
        `Unknown drawing tool: '${shape}'. Available tools: ${ToolRegistry.getAvailableTools().slice(0, 10).join(', ')}...`
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
   * Flushes all queued operations
   * @param ctx - Canvas context to draw on (optional)
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
   * Executes a batch of draw operations with state batching
   * @param ctx - Canvas context
   * @param operations - Operations to execute
   * @throws Error if canvas context operations fail
   */
  private executeBatch(ctx: CanvasContext, operations: DrawOperation[]): void {
    if (operations.length === 0) {
      return
    }
    ;(ctx as CanvasRenderingContext2D).save()
    const groupedOps = this.groupOperationsByState(operations)
    for (const [stateKey, ops] of groupedOps) {
      this.applyCanvasState(ctx, stateKey)
      for (const op of ops) {
        this.executeDrawOperation(ctx, op)
      }
    }
    ;(ctx as CanvasRenderingContext2D).restore()
  }

  /**
   * Groups operations by similar canvas state
   * @param operations - Operations to group
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
   * Generates a state key for grouping operations
   * @param options - Drawing options
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
   * Applies canvas state to context
   * @param ctx - Canvas context
   * @param stateKey - State key to apply
   * @throws Error if state parsing fails
   */
  private applyCanvasState(ctx: CanvasContext, stateKey: string): void {
    const state = JSON.parse(stateKey)
    if (state.fill !== this.TRANSPARENT) {
      ctx.fillStyle = this.getCachedFillStyle(ctx, state.fill)
    }
    if (state.stroke !== this.TRANSPARENT) {
      ctx.strokeStyle = state.stroke
      ctx.lineWidth = state.lineWidth
    }
    if (state.opacity !== 1) {
      ctx.globalAlpha = state.opacity
    }
    if (state.blendMode !== this.SOURCE_OVER) {
      ctx.globalCompositeOperation = state.blendMode
    }
    if (state.shadow !== this.NONE) {
      const shadow = JSON.parse(state.shadow)
      ctx.shadowOffsetX = shadow.offsetX
      ctx.shadowOffsetY = shadow.offsetY
      ctx.shadowBlur = shadow.blur
      ctx.shadowColor = shadow.color
    }
    if (state.glow !== this.NONE) {
      const glow = JSON.parse(state.glow)
      ctx.shadowColor = glow.color
      ctx.shadowBlur = glow.blur
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }
  }

  /**
   * Executes a single draw operation
   * @param ctx - Canvas context
   * @param operation - Operation to execute
   * @throws Error if tool execution fails or tool not found
   */
  private executeDrawOperation(
    ctx: CanvasContext,
    operation: DrawOperation
  ): void {
    import('@tools/Registry')
      .then(({ ToolRegistry }) => {
        const tool = ToolRegistry.get(operation.shape)
        if (tool) {
          try {
            this.applyOperationOptions(ctx, operation.options)
            tool(ctx as CanvasRenderingContext2D, operation.options)
            this.failedOperations.delete(operation.id)
          } catch (error) {
            this.handleOperationFailure(operation, error as Error)
          }
        } else {
          this.handleOperationFailure(
            operation,
            new Error(`Unknown shape tool: ${operation.shape}`)
          )
        }
      })
      .catch(error => {
        this.handleOperationFailure(operation, error as Error)
      })
  }

  /**
   * Applies operation-specific options to the context
   * @param ctx - Canvas context
   * @param options - Drawing options
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
   * Handles operation failures and manages retries
   * @param operation - Failed operation
   * @param error - Error that caused the failure
   */
  private handleOperationFailure(operation: DrawOperation, error: Error): void {
    const existing = this.failedOperations.get(operation.id)
    const retryCount = existing ? existing.retryCount + 1 : 1
    const now = Date.now()
    if (retryCount <= this.maxRetries) {
      this.failedOperations.set(operation.id, {
        operation,
        retryCount,
        lastRetry: now
      })
      setTimeout(() => {
        this.retryOperation(operation.id)
      }, this.retryDelay * retryCount)
    } else {
      this.failedOperations.delete(operation.id)
      this.emitOperationFailed(operation, error)
    }
  }

  /**
   * Retries a failed operation
   * @param operationId - ID of operation to retry
   */
  private retryOperation(operationId: string): void {
    const failed = this.failedOperations.get(operationId)
    if (!failed) {
      return
    }
    const { operation, retryCount } = failed
    this.drawQueue.unshift(operation)
    console.log(
      `Retrying operation ${operation.shape} (attempt ${retryCount + 1})`
    )
    this.failedOperations.delete(operationId)
  }

  /**
   * Emits operation failed event (placeholder for future event system)
   * @param operation - Failed operation
   * @param error - Error that caused the failure
   */
  private emitOperationFailed(operation: DrawOperation, error: Error): void {
    // TODO: Implement event system for user notification
    // For now, just log the permanent failure
    console.error(`Operation permanently failed: ${operation.shape}`, {
      operationId: operation.id,
      shape: operation.shape,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Gets cached fill style (color or gradient)
   * @param ctx - Canvas context
   * @param fillStyle - Fill style to get
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
   * Creates a gradient with caching
   * @param ctx - Canvas context
   * @param gradientConfig - Gradient configuration
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
   * Gets a canvas from the pool or creates a new one
   * @param width - Canvas width
   * @param height - Canvas height
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
   * Returns a canvas to the pool for reuse
   * @param canvas - Canvas to return
   * @param width - Canvas width
   * @param height - Canvas height
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
   * Creates a Node.js canvas
   * @param width - Canvas width
   * @param height - Canvas height
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
      throw new Error(
        'Canvas package not installed. Please run: npm install canvas'
      )
    }
  }

  /**
   * Marks a region as dirty for partial redraws
   * @param x - Region X coordinate
   * @param y - Region Y coordinate
   * @param width - Region width
   * @param height - Region height
   */
  markDirty(x: number, y: number, width: number, height: number): void {
    const region: DirtyRegion = { x, y, width, height }
    const merged = this.mergeDirtyRegions(region)
    if (!merged) {
      this.dirtyRegions.push(region)
      if (this.dirtyRegions.length > this.maxDirtyRegions) {
        this.dirtyRegions.shift()
      }
    }
  }

  /**
   * Merges dirty regions to reduce overlap
   * @param newRegion - New region to merge
   * @returns True if merged, false if added as new
   */
  private mergeDirtyRegions(newRegion: DirtyRegion): boolean {
    for (let i = 0; i < this.dirtyRegions.length; i++) {
      const existing = this.dirtyRegions[i]
      if (existing && this.regionsOverlap(existing, newRegion)) {
        const merged = this.mergeRegions(existing, newRegion)
        if (merged) {
          this.dirtyRegions[i] = merged
          return true
        }
      }
    }
    return false
  }

  /**
   * Checks if two regions overlap
   * @param region1 - First region
   * @param region2 - Second region
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
   * Merges two overlapping regions
   * @param region1 - First region
   * @param region2 - Second region
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
   * Gets all dirty regions for partial redraw
   * @returns Array of dirty regions
   */
  getDirtyRegions(): DirtyRegion[] {
    return [...this.dirtyRegions]
  }

  /**
   * Clears all dirty regions after redraw
   */
  clearDirtyRegions(): void {
    this.dirtyRegions = []
    this.metrics.dirtyRegionRedraws++
  }

  /**
   * Gets performance metrics
   * @returns Performance metrics object with batching, caching, and pooling statistics
   */
  getMetrics(): typeof this.metrics {
    return { ...this.metrics }
  }

  /**
   * Gets failed operations that are pending retry
   * @returns Map of failed operations with retry count and timestamp information
   */
  getFailedOperations(): Map<
    string,
    { operation: DrawOperation; retryCount: number; lastRetry: number }
  > {
    return new Map(this.failedOperations)
  }

  /**
   * Manually retry a specific failed operation
   * @param operationId - ID of operation to retry
   * @returns True if retry was scheduled, false if operation not found
   */
  retryFailedOperation(operationId: string): boolean {
    const failed = this.failedOperations.get(operationId)
    if (!failed) {
      return false
    }
    this.retryOperation(operationId)
    return true
  }

  /**
   * Clears all failed operations (useful for testing)
   * Resets the retry system state
   */
  clearFailedOperations(): void {
    this.failedOperations.clear()
  }

  /**
   * Cleans up old cached items and pooled canvases
   * Removes expired items based on timeout settings
   */
  cleanup(): void {
    const now = Date.now()
    this.cleanupCache()
    this.canvasPool = this.canvasPool.filter(
      item => now - item.lastUsed < this.poolTimeout
    )
  }

  /**
   * Cleans up old cached items
   * Reduces cache sizes to prevent memory bloat
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

  /**
   * Resets all systems (useful for testing)
   * Clears all queues, caches, pools, and resets metrics to zero
   */
  reset(): void {
    this.drawQueue = []
    this.gradientCache.clear()
    this.patternCache.clear()
    this.shapeCache.clear()
    this.canvasPool = []
    this.dirtyRegions = []
    this.metrics = {
      operationsBatched: 0,
      cacheHits: 0,
      cacheMisses: 0,
      poolHits: 0,
      poolMisses: 0,
      dirtyRegionRedraws: 0
    }
  }
}
