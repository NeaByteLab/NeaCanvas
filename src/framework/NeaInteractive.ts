import type {
  DrawConfig,
  LayoutConfig,
  InteractiveEvent,
  InteractiveShape
} from '@interfaces/index'

/**
 * Interactive system for handling mouse events on shapes
 */
export class NeaInteractive {
  private enabled: boolean = false
  private hoverThrottleId: number | null = null
  private currentHoveredShape: string | null = null
  private canvasElement: HTMLCanvasElement | null = null
  private registeredShapes: Map<string, InteractiveShape> = new Map()
  private layoutConfigs: Map<string, LayoutConfig> = new Map()
  private boundHandleClick: (event: MouseEvent) => void
  private boundHandleMouseMove: (event: MouseEvent) => void

  /**
   * Creates a new interactive system instance
   */
  constructor() {
    this.boundHandleClick = this.handleClick.bind(this)
    this.boundHandleMouseMove = this.handleMouseMove.bind(this)
  }

  /**
   * Register shape for interactive handling
   * @param shapeId - Unique identifier for the shape
   * @param options - Drawing configuration containing event handlers
   * @param layoutName - Name of the layout containing the shape
   */
  set(shapeId: string, options: DrawConfig, layoutName: string): void {
    if (options.onClick || options.onHover) {
      const layoutConfig = this.layoutConfigs.get(layoutName) || {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      }
      const bounds = this.calculateShapeBounds(options, layoutConfig)
      this.registeredShapes.set(shapeId, {
        shapeId,
        options,
        layoutName,
        bounds,
        layoutConfig
      })
    }
  }

  /**
   * Set canvas element for coordinate transformation
   * @param canvas - HTML canvas element
   */
  setCanvasElement(canvas: HTMLCanvasElement): void {
    this.canvasElement = canvas
  }

  /**
   * Set layout configuration for coordinate mapping
   * @param layoutName - Name of the layout
   * @param config - Layout configuration with position and dimensions
   */
  setLayoutConfig(
    layoutName: string,
    config: { x?: number; y?: number; width: number; height: number }
  ): void {
    this.layoutConfigs.set(layoutName, config)
  }

  /**
   * Enable interactive mode and attach event listeners
   */
  enable(): void {
    if (!this.enabled) {
      this.enabled = true
      document.addEventListener('click', this.boundHandleClick)
      document.addEventListener('mousemove', this.boundHandleMouseMove)
    }
  }

  /**
   * Check if interactive mode is enabled
   * @returns True if interactive mode is active
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Handle mouse click events
   * @param event - Mouse click event
   */
  private handleClick(event: MouseEvent): void {
    if (!this.enabled) {
      return
    }
    const canvasPoint = this.getCanvasCoordinates(event)
    const hitShape = this.findShapeAt(canvasPoint.x, canvasPoint.y)
    if (hitShape && hitShape.options.onClick) {
      const interactiveEvent: InteractiveEvent = {
        type: 'click',
        shapeId: hitShape.shapeId,
        layoutName: hitShape.layoutName,
        timestamp: Date.now(),
        x: canvasPoint.x,
        y: canvasPoint.y
      }
      try {
        hitShape.options.onClick(interactiveEvent)
      } catch (error) {
        // TODO: Handle error
        console.error(
          `Error in onClick handler for shape ${hitShape.shapeId}:`,
          error
        )
      }
    }
  }

  /**
   * Handle mouse move events for hover detection (throttled)
   * @param event - Mouse move event
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.enabled || this.hoverThrottleId !== null) {
      return
    }
    this.hoverThrottleId = window.setTimeout(() => {
      this.processHoverEvent(event)
      this.hoverThrottleId = null
    }, 16)
  }

  /**
   * Process hover event (called by throttled handler)
   * @param event - Mouse move event
   */
  private processHoverEvent(event: MouseEvent): void {
    const canvasPoint = this.getCanvasCoordinates(event)
    const hitShape = this.findShapeAt(canvasPoint.x, canvasPoint.y)
    const newHoveredShapeId = hitShape?.shapeId || null
    if (this.currentHoveredShape !== newHoveredShapeId) {
      this.currentHoveredShape = newHoveredShapeId
      if (hitShape && hitShape.options.onHover) {
        const interactiveEvent: InteractiveEvent = {
          type: 'hover',
          layoutName: hitShape.layoutName,
          timestamp: Date.now(),
          x: canvasPoint.x,
          y: canvasPoint.y,
          shapeId: hitShape.shapeId
        }
        try {
          hitShape.options.onHover(interactiveEvent)
        } catch (error) {
          // TODO: Handle error
          console.error(
            `Error in onHover handler for shape ${hitShape.shapeId}:`,
            error
          )
        }
      }
    }
  }

  /**
   * Find shape at given coordinates
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns Shape data if found, null otherwise
   */
  private findShapeAt(
    x: number,
    y: number
  ): {
    shapeId: string
    options: DrawConfig
    layoutName: string
    bounds: { x: number; y: number; width: number; height: number }
    layoutConfig: { x?: number; y?: number; width: number; height: number }
  } | null {
    for (const shape of this.registeredShapes.values()) {
      if (this.pointInBounds(x, y, shape.bounds)) {
        return shape
      }
    }
    return null
  }

  /**
   * Check if point is within shape bounds
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param bounds - Shape boundary rectangle
   * @returns True if point is inside bounds
   */
  private pointInBounds(
    x: number,
    y: number,
    bounds: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    )
  }

  /**
   * Calculate shape bounds for hit testing with layout offset
   * @param options - Drawing configuration containing shape dimensions
   * @param layoutConfig - Layout configuration for position offset
   * @returns Boundary rectangle for the shape in canvas coordinates
   */
  private calculateShapeBounds(
    options: DrawConfig,
    layoutConfig: { x?: number; y?: number; width: number; height: number }
  ): {
    x: number
    y: number
    width: number
    height: number
  } {
    const {
      width: optWidth,
      height: optHeight,
      radius,
      radiusX,
      radiusY,
      x,
      y
    } = options
    let width = 100
    let height = 100
    if (optWidth !== undefined) {
      width = optWidth
    }
    if (optHeight !== undefined) {
      height = optHeight
    }
    if (radius !== undefined) {
      width = height = radius * 2
    }
    if (radiusX !== undefined && radiusY !== undefined) {
      width = radiusX * 2
      height = radiusY * 2
    }
    const layoutOffsetX = layoutConfig.x || 0
    const layoutOffsetY = layoutConfig.y || 0
    return {
      x: x + layoutOffsetX,
      y: y + layoutOffsetY,
      width,
      height
    }
  }

  /**
   * Get canvas-relative coordinates from mouse event
   * @param event - Mouse event
   * @returns Canvas-relative coordinates
   */
  private getCanvasCoordinates(event: MouseEvent): {
    x: number
    y: number
  } {
    if (!this.canvasElement) {
      return { x: event.clientX, y: event.clientY }
    }
    const rect = this.canvasElement.getBoundingClientRect()
    const canvasX = event.clientX - rect.left
    const canvasY = event.clientY - rect.top
    return { x: canvasX, y: canvasY }
  }
}
