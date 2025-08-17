import type { DirtyRegion } from '@framework/NeaSmart'
import type { DrawConfig, LayoutConfig } from '@interfaces/index'
import type { LayoutCanvas, LayoutCanvasContext } from '@interfaces/NeaLayout'
import { Default } from '@constants/Default'
import { ErrorCanvas } from '@constants/ErrorCanvas'
import {
  isNode,
  shouldUseHighDPI,
  getHighDPICanvasSize,
  getOptimalAntiAliasing
} from '@canvas/Environment'
import { NeaSmart } from '@framework/NeaSmart'
import { NeaInteractive } from '@framework/NeaInteractive'
import { Validator } from '@framework/utils/Validator'

/**
 * Manages layout creation and drawing operations with high DPI support
 */
export class NeaLayout {
  private config: LayoutConfig
  private layoutName: string = 'unknown'
  private shapes: Map<
    string,
    { type: string; options: DrawConfig; operationId: string }
  > = new Map()
  private smart = new NeaSmart()
  private interactive = new NeaInteractive()
  private canvas: LayoutCanvas | null = null
  private ctx: LayoutCanvasContext | null = null
  private dpr: number = 1
  private actualWidth: number = 0
  private actualHeight: number = 0
  private logicalWidth: number = 0
  private logicalHeight: number = 0
  private defaultFill: string = Default.FILL
  private defaultStroke: string = Default.STROKE
  private defaultLineWidth: number = Default.LINE_WIDTH

  /**
   * Creates a new NeaLayout instance
   * @param config Layout configuration
   * @param layoutName Name of the layout for error tracking
   * @returns Promise resolving to NeaLayout instance
   * @private Only used internally by NeaCanvas
   */
  static async create(
    config: LayoutConfig,
    layoutName: string = 'unknown'
  ): Promise<NeaLayout> {
    const layout = new NeaLayout(config, layoutName)
    await layout.initCanvas()
    return layout
  }

  /**
   * Initializes a new layout instance with configuration and name
   * @param config Layout configuration containing dimensions and styling
   * @param layoutName Identifier for this layout used in error messages and debugging
   */
  private constructor(config: LayoutConfig, layoutName: string = 'unknown') {
    this.config = config
    this.layoutName = layoutName
    this.defaultFill = config.backgroundColor || Default.FILL
    this.defaultStroke = config.strokeColor || Default.STROKE
    this.defaultLineWidth = config.lineWidth || Default.LINE_WIDTH
  }

  /**
   * Initializes the internal canvas for drawing with high DPI support
   * @throws Error if canvas package is not installed in Node.js environment
   */
  private async initCanvas(): Promise<void> {
    this.logicalWidth = this.config.width
    this.logicalHeight = this.config.height
    this.canvas = (await this.smart.getCanvas(
      this.logicalWidth,
      this.logicalHeight
    )) as LayoutCanvas
    this.ctx = this.canvas.getContext('2d') as LayoutCanvasContext
    if (!this.ctx) {
      throw new Error(ErrorCanvas.CANVAS_CONTEXT_POOL_FAILED(this.layoutName))
    }
    if (!isNode() && shouldUseHighDPI()) {
      const dpiSize = getHighDPICanvasSize(
        this.logicalWidth,
        this.logicalHeight
      )
      this.actualWidth = dpiSize.canvasWidth
      this.actualHeight = dpiSize.canvasHeight
      this.dpr = dpiSize.scale
      this.canvas.width = this.actualWidth
      this.canvas.height = this.actualHeight
      this.canvas.style.width = `${this.logicalWidth}px`
      this.canvas.style.height = `${this.logicalHeight}px`
      this.ctx.scale(this.dpr, this.dpr)
    } else {
      this.actualWidth = this.logicalWidth
      this.actualHeight = this.logicalHeight
      this.dpr = 1
    }
    this.applyQualitySettings()
    this.ctx.fillStyle = this.defaultFill
    this.ctx.strokeStyle = this.defaultStroke
    this.ctx.lineWidth = this.defaultLineWidth
    if (this.defaultFill !== Default.FILL) {
      this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight)
    }
  }

  /**
   * Applies anti-aliasing and quality settings to the context
   * @throws Error if canvas context is not initialized
   */
  private applyQualitySettings(): void {
    if (!this.ctx) {
      throw new Error(
        ErrorCanvas.CANVAS_CONTEXT_NOT_INITIALIZED(this.layoutName)
      )
    }
    const quality = getOptimalAntiAliasing()
    if (isNode()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nodeCtx = this.ctx as any
      if (nodeCtx.antialias !== undefined) {
        nodeCtx.antialias = quality.antialias
      }
      if (nodeCtx.patternQuality !== undefined) {
        nodeCtx.patternQuality = quality.patternQuality
      }
      if (nodeCtx.quality !== undefined) {
        nodeCtx.quality = quality.quality
      }
    }
    if (this.ctx.imageSmoothingEnabled !== undefined) {
      this.ctx.imageSmoothingEnabled = quality.imageSmoothingEnabled
    }
    if (this.ctx.imageSmoothingQuality !== undefined) {
      this.ctx.imageSmoothingQuality = quality.imageSmoothingQuality
    }
  }

  /**
   * Draws a shape on the layout
   * @param shapeName Name of the shape to draw
   * @param options Drawing options
   * @returns Shape ID for reference
   * @throws Error if canvas context is not initialized, coordinates are invalid, or shape type is unknown
   */
  draw(shapeName: string, options: DrawConfig): string {
    if (!this.ctx) {
      throw new Error(
        ErrorCanvas.CANVAS_CONTEXT_NOT_INITIALIZED(this.layoutName)
      )
    }
    Validator.validateDrawInputs(this.layoutName, shapeName, options)
    const { width: shapeWidth, height: shapeHeight } =
      this.calculateShapeDimensions(shapeName, options)
    Validator.validateColorProperties(this.layoutName, shapeName, options)
    Validator.validateShapeBounds(
      this.layoutName,
      shapeName,
      options,
      shapeWidth,
      shapeHeight,
      this.logicalWidth,
      this.logicalHeight
    )
    const shapeId = `${shapeName}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const operationId = this.smart.queue(shapeName, options, this.layoutName)
    this.smart.markDirty(options.x, options.y, shapeWidth, shapeHeight)
    this.interactive.set(shapeId, options, this.layoutName)
    this.shapes.set(shapeId, {
      type: shapeName,
      options: { ...options },
      operationId
    })
    return shapeId
  }

  /**
   * Enables interactive features for this layout including click and hover events
   * @internal Only for NeaRender
   */
  enableInteractive(): void {
    const canvas = this.getCanvasForFramework()
    if (canvas) {
      this.interactive.setCanvasElement(canvas as HTMLCanvasElement)
    }
    this.interactive.setLayoutConfig(this.layoutName, this.config)
    this.interactive.enable()
  }

  /**
   * Calculates shape dimensions based on shape type and configuration options.
   * @param shapeName Type of shape to calculate dimensions for
   * @param options Drawing configuration containing shape-specific properties
   * @returns Object containing calculated width and height dimensions
   */
  private calculateShapeDimensions(
    shapeName: string,
    options: DrawConfig
  ): { width: number; height: number } {
    if (shapeName === 'text' || shapeName === 'multitext') {
      return this.calculateTextDimensions(shapeName, options)
    } else if (shapeName === 'ellipse') {
      return this.calculateEllipseDimensions(options)
    } else if (shapeName === 'circle') {
      return this.calculateCircleDimensions(options)
    } else if (shapeName === 'line') {
      return this.calculateLineDimensions(options)
    } else {
      return this.calculateRectangleDimensions(shapeName, options)
    }
  }

  /**
   * Calculates dimensions for text and multitext shapes based on font size and content.
   * @param shapeName Either 'text' or 'multitext' to determine calculation method
   * @param options Drawing configuration containing text properties
   * @returns Object containing calculated width and height for text rendering
   * @throws Error if fontSize is invalid or text/lines properties are malformed
   */
  private calculateTextDimensions(
    shapeName: string,
    options: DrawConfig
  ): { width: number; height: number } {
    const fontSize = options.fontSize || Default.DEFAULT_FONT_SIZE
    Validator.validateFontSize(this.layoutName, shapeName, fontSize)
    if (shapeName === 'text') {
      Validator.validateText(this.layoutName, shapeName, options.text)
      const textLength = options.text?.length || 10
      return {
        width: fontSize * textLength * Default.TEXT_WIDTH_FACTOR,
        height: fontSize * Default.TEXT_HEIGHT_FACTOR
      }
    } else {
      Validator.validateLines(this.layoutName, shapeName, options.lines)
      const textLength = options.lines?.join('').length || 10
      return {
        width: fontSize * textLength * Default.TEXT_WIDTH_FACTOR,
        height:
          fontSize * Default.TEXT_HEIGHT_FACTOR * (options.lines?.length || 1)
      }
    }
  }

  /**
   * Calculates dimensions for ellipse shapes using radiusX and radiusY properties.
   * @param options Drawing configuration containing ellipse radius properties
   * @returns Object containing calculated width and height based on ellipse radii
   * @throws Error if radiusX or radiusY values are invalid or out of range
   */
  private calculateEllipseDimensions(options: DrawConfig): {
    width: number
    height: number
  } {
    const radiusX = options.radiusX || options.radius || 50
    const radiusY = options.radiusY || options.radius || 50
    Validator.validateRadiusX(this.layoutName, radiusX)
    Validator.validateRadiusY(this.layoutName, radiusY)
    return {
      width: radiusX * 2,
      height: radiusY * 2
    }
  }

  /**
   * Calculates dimensions for circle shapes using radius property.
   * @param options Drawing configuration containing circle radius property
   * @returns Object containing calculated width and height based on circle radius
   * @throws Error if radius value is invalid or out of range
   */
  private calculateCircleDimensions(options: DrawConfig): {
    width: number
    height: number
  } {
    const radius = options.radius || 50
    Validator.validateRadius(this.layoutName, radius)
    return {
      width: radius * 2,
      height: radius * 2
    }
  }

  /**
   * Calculates dimensions for line shapes using start and end coordinates.
   * @param options Drawing configuration containing line endpoint properties
   * @returns Object containing calculated width and height based on line endpoints
   * @throws Error if endpoint coordinates are invalid or out of range
   */
  private calculateLineDimensions(options: DrawConfig): {
    width: number
    height: number
  } {
    const endX = options.endX || options.x
    const endY = options.endY || options.y
    Validator.validateLineEndpointTypes(this.layoutName, endX, endY)
    Validator.validateLineEndpoints(
      this.layoutName,
      endX as number,
      endY as number
    )
    Validator.validateLineEndpointRange(
      this.layoutName,
      endX as number,
      endY as number
    )
    return {
      width: Math.abs((endX as number) - options.x),
      height: Math.abs((endY as number) - options.y)
    }
  }

  /**
   * Calculates dimensions for rectangle and other shapes using width and height properties.
   * @param shapeName Name of the shape for logging purposes
   * @param options Drawing configuration containing width and height properties
   * @returns Object containing calculated width and height dimensions
   * @throws Error if width or height values are invalid or out of range
   */
  private calculateRectangleDimensions(
    shapeName: string,
    options: DrawConfig
  ): { width: number; height: number } {
    const width = options.width || 100
    const height = options.height || 100
    Validator.validateDimensionTypes(this.layoutName, shapeName, width, height)
    Validator.validateDimensionsFinite(
      this.layoutName,
      shapeName,
      width,
      height
    )
    Validator.validateDimensionRange(this.layoutName, shapeName, width, height)
    Validator.warnZeroDimensions(shapeName, width, height)
    return { width, height }
  }

  /**
   * Flushes all queued operations to execute them
   * @private Auto-handled by getCanvas() and getShapes()
   */
  private flush(): void {
    if (this.ctx) {
      this.smart.flush(this.ctx)
    }
  }

  /**
   * Gets the internal canvas element
   * @returns Canvas element or null if not initialized
   * @private Internal use only
   */
  private getCanvas(): LayoutCanvas | null {
    this.flush()
    return this.canvas
  }

  /**
   * Gets all shapes in this layout
   * @returns Map of shape IDs to shape data with type, options, and operation ID
   * @private Internal use only
   */
  private getShapes(): Map<
    string,
    { type: string; options: DrawConfig; operationId: string }
  > {
    this.flush()
    return new Map(this.shapes)
  }

  /**
   * Gets the layout configuration
   * @returns Copy of layout configuration object
   */
  getConfig(): LayoutConfig {
    return { ...this.config }
  }

  /**
   * Gets the internal canvas element for framework use
   * @returns Canvas element or null if not initialized
   * @internal Only for NeaExport and NeaRender
   */
  getCanvasForFramework(): LayoutCanvas | null {
    return this.getCanvas()
  }

  /**
   * Gets all shapes for framework use
   * @returns Map of shape IDs to shape data including type, options, and operation ID
   * @internal Only for NeaExport
   */
  getShapesForFramework(): Map<
    string,
    { type: string; options: DrawConfig; operationId: string }
  > {
    return this.getShapes()
  }

  /**
   * Retrieves areas of the canvas that need to be redrawn
   * @returns Array of dirty region objects containing coordinates and dimensions
   * @private Internal optimization, auto-handled
   */
  // @ts-expect-error - Reserved for future development
  private getDirtyRegions(): DirtyRegion[] {
    return this.smart.getDirtyRegions()
  }

  /**
   * Removes all dirty region markers after successful redraw operations
   * @private Auto-handled after redraws
   */
  // @ts-expect-error - Reserved for future development
  private clearDirtyRegions(): void {
    this.smart.clearDirtyRegions()
  }

  /**
   * Returns the canvas element back to the resource pool for memory management
   * @private Auto-handled during cleanup
   */
  private returnCanvasToPool(): void {
    if (this.canvas) {
      this.smart.returnCanvas(
        this.canvas,
        this.logicalWidth,
        this.logicalHeight
      )
      this.canvas = null
      this.ctx = null
    }
  }

  /**
   * Releases all resources including canvas, shapes, and internal managers
   * @private Auto-handled when layout is destroyed
   */
  private cleanup(): void {
    this.returnCanvasToPool()
    this.shapes.clear()
    this.smart.cleanup()
  }

  /**
   * Completely destroys the layout instance and frees all associated resources
   * @private Auto-handled when layout is removed
   */
  // @ts-expect-error - Reserved for future development
  private destroy(): void {
    this.cleanup()
  }

  /**
   * Gets current performance snapshot
   * @returns Current performance metrics with timestamp
   */
  getPerformanceSnapshot(): {
    timestamp: number
    metrics: {
      batching: {
        operationsBatched: number
        efficiency: number
      }
      caching: {
        cacheHits: number
        cacheMisses: number
        hitRate: number
      }
      pooling: {
        poolHits: number
        poolMisses: number
        hitRate: number
      }
      dirtyRegions: {
        count: number
        redraws: number
      }
      failedOperations: {
        count: number
        retryCount: number
      }
    }
    memoryUsage?: number
  } {
    const metrics = this.getDetailedPerformanceMetrics()
    const snapshot = {
      timestamp: Date.now(),
      metrics
    }
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage()
      return {
        ...snapshot,
        memoryUsage: memUsage.heapUsed
      }
    }
    return snapshot
  }

  /**
   * Collects comprehensive performance metrics from all internal systems
   * @returns Object containing batching, caching, pooling, and operation metrics
   */
  private getDetailedPerformanceMetrics(): {
    batching: {
      operationsBatched: number
      efficiency: number
    }
    caching: {
      cacheHits: number
      cacheMisses: number
      hitRate: number
    }
    pooling: {
      poolHits: number
      poolMisses: number
      hitRate: number
    }
    dirtyRegions: {
      count: number
      redraws: number
    }
    failedOperations: {
      count: number
      retryCount: number
    }
  } {
    const metrics = this.smart.getMetrics()
    const failedOps = this.smart.getFailedOperations()
    return {
      batching: {
        operationsBatched: metrics.operationsBatched,
        efficiency: metrics.operationsBatched > 0 ? 100 : 0
      },
      caching: {
        cacheHits: metrics.cacheHits,
        cacheMisses: metrics.cacheMisses,
        hitRate:
          metrics.cacheHits + metrics.cacheMisses > 0
            ? (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) *
              100
            : 0
      },
      pooling: {
        poolHits: metrics.poolHits,
        poolMisses: metrics.poolMisses,
        hitRate:
          metrics.poolHits + metrics.poolMisses > 0
            ? (metrics.poolHits / (metrics.poolHits + metrics.poolMisses)) * 100
            : 0
      },
      dirtyRegions: {
        count: this.smart.getDirtyRegions().length,
        redraws: metrics.dirtyRegionRedraws
      },
      failedOperations: {
        count: failedOps.size,
        retryCount: Array.from(failedOps.values()).reduce(
          (sum, op) => sum + op.retryCount,
          0
        )
      }
    }
  }
}
