import { Default, ErrorCanvas } from '@constants/index'
import {
  isNode,
  shouldUseHighDPI,
  getHighDPICanvasSize,
  getOptimalAntiAliasing
} from '@canvas/Environment'
import { NeaSmart } from '@framework/NeaSmart'
import type { DirtyRegion, SmartMetrics } from '@framework/NeaSmart'
import type {
  DrawConfig,
  LayoutCanvas,
  LayoutConfig,
  LayoutCanvasContext
} from '@interfaces/index'

/**
 * Manages layout creation and drawing operations with high DPI support
 */
export class NeaLayout {
  private config: LayoutConfig
  private shapes: Map<
    string,
    { type: string; options: DrawConfig; operationId: string }
  > = new Map()
  private smart = new NeaSmart()
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
   * @param config - Layout configuration
   * @returns Promise resolving to NeaLayout instance
   */
  static async create(config: LayoutConfig): Promise<NeaLayout> {
    const layout = new NeaLayout(config)
    await layout.initCanvas()
    return layout
  }

  /**
   * Private constructor
   * @param config - Layout configuration
   */
  private constructor(config: LayoutConfig) {
    this.config = config
    this.defaultFill = config.backgroundColor || Default.FILL
    this.defaultStroke = config.strokeColor || Default.STROKE
    this.defaultLineWidth = config.lineWidth || Default.LINE_WIDTH
  }

  /**
   * Initializes the internal canvas for drawing with high DPI support
   * Uses NeaSmart's canvas pool for resource management
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
      throw new Error(ErrorCanvas.CANVAS_CONTEXT_POOL_FAILED)
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
   * Uses NeaSmart's cached resources for consistent rendering
   * @throws Error if canvas context is not initialized
   */
  private applyQualitySettings(): void {
    if (!this.ctx) {
      throw new Error(ErrorCanvas.CANVAS_CONTEXT_NOT_INITIALIZED)
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
   * Draws a shape on the layout using NeaSmart batching
   * @param shapeName - Name of the shape to draw
   * @param options - Drawing options
   * @returns Shape ID for reference
   * @throws Error if canvas context is not initialized, coordinates are invalid, or shape type is unknown
   */
  draw(shapeName: string, options: DrawConfig): string {
    if (!this.ctx) {
      throw new Error(ErrorCanvas.CANVAS_CONTEXT_NOT_INITIALIZED)
    }
    this.validateDrawInputs(shapeName, options)
    const { width: shapeWidth, height: shapeHeight } =
      this.calculateShapeDimensions(shapeName, options)
    this.validateColorProperties(options)
    this.validateShapeBounds(options, shapeWidth, shapeHeight)
    const operationId = this.smart.queue(shapeName, options)
    this.smart.markDirty(options.x, options.y, shapeWidth, shapeHeight)
    const shapeId = `${shapeName}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    this.shapes.set(shapeId, {
      type: shapeName,
      options: { ...options },
      operationId
    })
    return shapeId
  }

  /**
   * Validates drawing inputs including coordinate types, shape name format, and options object
   * @param shapeName - Name of the shape to validate
   * @param options - Drawing configuration options to validate
   * @throws Error if coordinates are invalid, shape name is empty, or options object is malformed
   */
  private validateDrawInputs(shapeName: string, options: DrawConfig): void {
    if (typeof options.x !== 'number' || typeof options.y !== 'number') {
      throw new Error(
        ErrorCanvas.INVALID_COORDINATE_TYPES(typeof options.x, typeof options.y)
      )
    }
    if (isNaN(options.x) || isNaN(options.y)) {
      throw new Error(ErrorCanvas.COORDINATES_NAN(options.x, options.y))
    }
    if (!isFinite(options.x) || !isFinite(options.y)) {
      throw new Error(ErrorCanvas.COORDINATES_NOT_FINITE(options.x, options.y))
    }
    if (
      options.x < -Default.COORDINATE_RANGE ||
      options.x > Default.COORDINATE_RANGE ||
      options.y < -Default.COORDINATE_RANGE ||
      options.y > Default.COORDINATE_RANGE
    ) {
      throw new Error(ErrorCanvas.EXTREME_COORDINATES(options.x, options.y))
    }
    if (
      !shapeName ||
      typeof shapeName !== 'string' ||
      shapeName.trim().length === 0
    ) {
      throw new Error(ErrorCanvas.INVALID_SHAPE_NAME(shapeName))
    }
    if (!options || typeof options !== 'object') {
      throw new Error(ErrorCanvas.INVALID_OPTIONS(typeof options))
    }
  }

  /**
   * Calculates shape dimensions based on shape type and configuration options
   * @param shapeName - Type of shape to calculate dimensions for
   * @param options - Drawing configuration containing shape-specific properties
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
   * Calculates dimensions for text and multitext shapes based on font size and content
   * @param shapeName - Either 'text' or 'multitext' to determine calculation method
   * @param options - Drawing configuration containing text properties
   * @returns Object containing calculated width and height for text rendering
   * @throws Error if fontSize is invalid or text/lines properties are malformed
   */
  private calculateTextDimensions(
    shapeName: string,
    options: DrawConfig
  ): { width: number; height: number } {
    const fontSize = options.fontSize || Default.DEFAULT_FONT_SIZE
    if (
      typeof fontSize !== 'number' ||
      isNaN(fontSize) ||
      fontSize <= 0 ||
      fontSize > Default.MAX_FONT_SIZE
    ) {
      throw new Error(ErrorCanvas.INVALID_FONT_SIZE(fontSize))
    }
    if (shapeName === 'text') {
      if (typeof options.text !== 'string' && options.text !== undefined) {
        throw new Error(ErrorCanvas.INVALID_TEXT(typeof options.text))
      }
      const textLength = options.text?.length || 10
      return {
        width: fontSize * textLength * Default.TEXT_WIDTH_FACTOR,
        height: fontSize * Default.TEXT_HEIGHT_FACTOR
      }
    } else {
      if (options.lines && !Array.isArray(options.lines)) {
        throw new Error(ErrorCanvas.INVALID_LINES(typeof options.lines))
      }
      const textLength = options.lines?.join('').length || 10
      return {
        width: fontSize * textLength * Default.TEXT_WIDTH_FACTOR,
        height:
          fontSize * Default.TEXT_HEIGHT_FACTOR * (options.lines?.length || 1)
      }
    }
  }

  /**
   * Calculates dimensions for ellipse shapes using radiusX and radiusY properties
   * @param options - Drawing configuration containing ellipse radius properties
   * @returns Object containing calculated width and height based on ellipse radii
   * @throws Error if radiusX or radiusY values are invalid or out of range
   */
  private calculateEllipseDimensions(options: DrawConfig): {
    width: number
    height: number
  } {
    const radiusX = options.radiusX || options.radius || 50
    const radiusY = options.radiusY || options.radius || 50

    if (
      typeof radiusX !== 'number' ||
      isNaN(radiusX) ||
      radiusX <= 0 ||
      radiusX > Default.MAX_RADIUS
    ) {
      throw new Error(ErrorCanvas.INVALID_RADIUS_X(radiusX))
    }
    if (
      typeof radiusY !== 'number' ||
      isNaN(radiusY) ||
      radiusY <= 0 ||
      radiusY > Default.MAX_RADIUS
    ) {
      throw new Error(ErrorCanvas.INVALID_RADIUS_Y(radiusY))
    }

    return {
      width: radiusX * 2,
      height: radiusY * 2
    }
  }

  /**
   * Calculates dimensions for circle shapes using radius property
   * @param options - Drawing configuration containing circle radius property
   * @returns Object containing calculated width and height based on circle radius
   * @throws Error if radius value is invalid or out of range
   */
  private calculateCircleDimensions(options: DrawConfig): {
    width: number
    height: number
  } {
    const radius = options.radius || 50
    if (
      typeof radius !== 'number' ||
      isNaN(radius) ||
      radius <= 0 ||
      radius > Default.MAX_RADIUS
    ) {
      throw new Error(ErrorCanvas.INVALID_RADIUS(radius))
    }
    return {
      width: radius * 2,
      height: radius * 2
    }
  }

  /**
   * Calculates dimensions for line shapes using start and end coordinates
   * @param options - Drawing configuration containing line endpoint properties
   * @returns Object containing calculated width and height based on line endpoints
   * @throws Error if endpoint coordinates are invalid or out of range
   */
  private calculateLineDimensions(options: DrawConfig): {
    width: number
    height: number
  } {
    const endX = options.endX || options.x
    const endY = options.endY || options.y
    if (typeof endX !== 'number' || typeof endY !== 'number') {
      throw new Error(
        ErrorCanvas.INVALID_LINE_ENDPOINT_TYPES(typeof endX, typeof endY)
      )
    }
    if (isNaN(endX) || isNaN(endY) || !isFinite(endX) || !isFinite(endY)) {
      throw new Error(ErrorCanvas.INVALID_LINE_ENDPOINTS(endX, endY))
    }
    if (
      endX < -Default.COORDINATE_RANGE ||
      endX > Default.COORDINATE_RANGE ||
      endY < -Default.COORDINATE_RANGE ||
      endY > Default.COORDINATE_RANGE
    ) {
      throw new Error(ErrorCanvas.EXTREME_LINE_ENDPOINTS(endX, endY))
    }
    return {
      width: Math.abs(endX - options.x),
      height: Math.abs(endY - options.y)
    }
  }

  /**
   * Calculates dimensions for rectangle and other shapes using width and height properties
   * @param shapeName - Name of the shape for logging purposes
   * @param options - Drawing configuration containing width and height properties
   * @returns Object containing calculated width and height dimensions
   * @throws Error if width or height values are invalid or out of range
   */
  private calculateRectangleDimensions(
    shapeName: string,
    options: DrawConfig
  ): { width: number; height: number } {
    const width = options.width || 100
    const height = options.height || 100
    if (typeof width !== 'number' || typeof height !== 'number') {
      throw new Error(
        ErrorCanvas.INVALID_DIMENSION_TYPES(typeof width, typeof height)
      )
    }
    if (
      isNaN(width) ||
      isNaN(height) ||
      !isFinite(width) ||
      !isFinite(height)
    ) {
      throw new Error(ErrorCanvas.INVALID_DIMENSIONS_NOT_FINITE(width, height))
    }
    if (
      width < 0 ||
      height < 0 ||
      width > Default.MAX_DIMENSION ||
      height > Default.MAX_DIMENSION
    ) {
      throw new Error(ErrorCanvas.INVALID_DIMENSIONS_RANGE(width, height))
    }
    if (width === 0 || height === 0) {
      console.warn(
        `Warning: Shape '${shapeName}' has zero dimensions: ${width}x${height}`
      )
    }
    return { width, height }
  }

  /**
   * Validates color and style properties including fill, stroke, strokeWidth, and opacity
   * @param options - Drawing configuration containing color and style properties
   * @throws Error if any color or style property has invalid type or value
   */
  private validateColorProperties(options: DrawConfig): void {
    if (options.fill !== undefined && typeof options.fill !== 'string') {
      throw new Error(ErrorCanvas.INVALID_FILL_COLOR(typeof options.fill))
    }
    if (options.stroke !== undefined && typeof options.stroke !== 'string') {
      throw new Error(ErrorCanvas.INVALID_STROKE_COLOR(typeof options.stroke))
    }
    if (options.strokeWidth !== undefined) {
      if (
        typeof options.strokeWidth !== 'number' ||
        isNaN(options.strokeWidth) ||
        options.strokeWidth < 0 ||
        options.strokeWidth > Default.MAX_STROKE_WIDTH
      ) {
        throw new Error(ErrorCanvas.INVALID_STROKE_WIDTH(options.strokeWidth))
      }
    }
    if (options.opacity !== undefined) {
      if (
        typeof options.opacity !== 'number' ||
        isNaN(options.opacity) ||
        options.opacity < 0 ||
        options.opacity > 1
      ) {
        throw new Error(ErrorCanvas.INVALID_OPACITY(options.opacity))
      }
    }
  }

  /**
   * Validates that the entire shape fits within the layout boundaries
   * @param options - Drawing configuration containing position coordinates
   * @param shapeWidth - Calculated width of the shape
   * @param shapeHeight - Calculated height of the shape
   * @throws Error if shape extends beyond layout boundaries
   */
  private validateShapeBounds(
    options: DrawConfig,
    shapeWidth: number,
    shapeHeight: number
  ): void {
    if (
      options.x < 0 ||
      options.y < 0 ||
      options.x + shapeWidth > this.logicalWidth ||
      options.y + shapeHeight > this.logicalHeight
    ) {
      throw new Error(
        ErrorCanvas.SHAPE_OUT_OF_BOUNDS(
          options.x,
          options.y,
          this.logicalWidth,
          this.logicalHeight
        )
      )
    }
  }

  /**
   * Flushes all queued operations to execute them
   * This is where NeaSmart actually draws the shapes
   */
  flush(): void {
    if (this.ctx) {
      this.smart.flush(this.ctx)
    }
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
   * Resets performance metrics for fresh measurement
   * Useful for benchmarking specific operations
   */
  resetPerformanceMetrics(): void {
    this.smart.reset()
  }

  /**
   * Gets the layout configuration
   * @returns Copy of layout configuration object
   */
  getConfig(): LayoutConfig {
    return { ...this.config }
  }

  /**
   * Gets the internal canvas element
   * @returns Canvas element or null if not initialized
   */
  getCanvas(): LayoutCanvas | null {
    return this.canvas
  }

  /**
   * Gets all shapes in this layout
   * @returns Map of shape IDs to shape data with type, options, and operation ID
   */
  getShapes(): Map<
    string,
    { type: string; options: DrawConfig; operationId: string }
  > {
    return new Map(this.shapes)
  }

  /**
   * Gets performance metrics from NeaSmart
   * @returns Performance metrics object with batching and caching statistics
   */
  getPerformanceMetrics(): SmartMetrics {
    return this.smart.getMetrics()
  }

  /**
   * Gets detailed performance breakdown
   * @returns Object with various performance metrics and data
   */
  getDetailedPerformanceMetrics(): {
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

  /**
   * Gets dirty regions for partial redraws
   * @returns Array of dirty regions that need redrawing
   */
  getDirtyRegions(): DirtyRegion[] {
    return this.smart.getDirtyRegions()
  }

  /**
   * Clears dirty regions after redraw
   * Resets the dirty region tracking system
   */
  clearDirtyRegions(): void {
    this.smart.clearDirtyRegions()
  }

  /**
   * Returns canvas to NeaSmart pool for reuse
   * Should be called when layout is no longer needed
   */
  returnCanvasToPool(): void {
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
   * Cleanup method for proper resource management
   * Returns canvas to pool and clears all resources
   */
  cleanup(): void {
    this.returnCanvasToPool()
    this.shapes.clear()
    this.smart.cleanup()
  }
}
