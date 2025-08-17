import type {
  DrawConfig,
  LayoutConfig,
  InteractiveEvent,
  InteractiveShape,
  TouchPoint
} from '@interfaces/index'
import { QuadTree, type SpatialObject } from '@framework/utils/SpatialIndex'
import { Default } from '@constants/Default'
import { ErrorCanvas } from '@constants/ErrorCanvas'
import { isTouchDevice, getMaxTouchPoints } from '@canvas/Environment'

/**
 * Manages mouse interactions with shapes using spatial indexing for hit detection.
 */
export class NeaInteractive {
  private enabled: boolean = false
  private hoverThrottleId: number | null = null
  private currentHoveredShape: string | null = null
  private canvasElement: HTMLCanvasElement | null = null
  private touchEnabled: boolean = false
  private maxTouchPoints: number = Default.MAX_TOUCH_POINTS
  private touchThrottleDelay: number = Default.TOUCH_THROTTLE_DELAY
  private activeTouches: Map<number, TouchPoint> = new Map()
  private touchThrottleId: number | null = null
  private lastTapTime: number = 0
  private lastTapPosition: { x: number; y: number } | null = null
  private holdTimeoutId: number | null = null
  private registeredShapes: Map<string, InteractiveShape> = new Map()
  private layoutConfigs: Map<string, LayoutConfig> = new Map()
  private spatialIndex: QuadTree = new QuadTree(0, 0, 4096, 4096)
  private coordinateTransformer?: (x: number, y: number) => [number, number]
  private boundHandleClick: (event: MouseEvent) => void
  private boundHandleMouseMove: (event: MouseEvent) => void
  private boundHandleTouchStart: (event: TouchEvent) => void
  private boundHandleTouchMove: (event: TouchEvent) => void
  private boundHandleTouchEnd: (event: TouchEvent) => void

  /**
   * Initializes a new interactive system instance.
   */
  constructor() {
    this.boundHandleClick = this.handleClick.bind(this)
    this.boundHandleMouseMove = this.handleMouseMove.bind(this)
    this.boundHandleTouchStart = this.handleTouchStart.bind(this)
    this.boundHandleTouchMove = this.handleTouchMove.bind(this)
    this.boundHandleTouchEnd = this.handleTouchEnd.bind(this)
  }

  /**
   * Registers a shape for interactive event handling.
   * @param shapeId - Unique identifier for the shape
   * @param options - Drawing configuration containing event handlers
   * @param layoutName - Name of the layout containing the shape
   */
  set(shapeId: string, options: DrawConfig, layoutName: string): void {
    if (options.onClick || options.onHover || this.hasTouchHandlers(options)) {
      const layoutConfig = this.layoutConfigs.get(layoutName) || {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      }
      const bounds = this.calculateShapeBounds(options)
      const existingShape = this.registeredShapes.get(shapeId)
      if (existingShape) {
        this.spatialIndex.remove({
          id: shapeId,
          x: existingShape.bounds.x,
          y: existingShape.bounds.y,
          width: existingShape.bounds.width,
          height: existingShape.bounds.height
        })
      }
      const spatialObject: SpatialObject = {
        id: shapeId,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height
      }
      this.spatialIndex.insert(spatialObject)
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
   * Sets the canvas element for coordinate calculations.
   * @param canvas - HTML canvas element
   */
  setCanvasElement(canvas: HTMLCanvasElement): void {
    this.canvasElement = canvas
  }

  /**
   * Sets the layout configuration for coordinate mapping.
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
   * Sets the coordinate transformer for device pixel ratio adjustments.
   * @param transformer - Function that transforms screen coordinates to canvas coordinates
   */
  setCoordinateTransformer(
    transformer: (x: number, y: number) => [number, number]
  ): void {
    this.coordinateTransformer = transformer
  }

  /**
   * Activates interactive mode and attaches event listeners.
   */
  enable(): void {
    if (!this.enabled) {
      this.enabled = true
      document.addEventListener('click', this.boundHandleClick)
      document.addEventListener('mousemove', this.boundHandleMouseMove)

      if (this.touchEnabled && isTouchDevice()) {
        document.addEventListener('touchstart', this.boundHandleTouchStart, {
          passive: false
        })
        document.addEventListener('touchmove', this.boundHandleTouchMove, {
          passive: false
        })
        document.addEventListener('touchend', this.boundHandleTouchEnd, {
          passive: false
        })
      }
    }
  }

  /**
   * Enables touch support for mobile devices.
   * @param options Touch configuration options
   */
  enableTouchSupport(
    options: {
      maxTouchPoints?: number
      throttleDelay?: number
    } = {}
  ): void {
    if (!isTouchDevice()) {
      throw new Error(ErrorCanvas.TOUCH_NOT_SUPPORTED())
    }

    this.touchEnabled = true
    this.maxTouchPoints = options.maxTouchPoints || Default.MAX_TOUCH_POINTS
    this.touchThrottleDelay =
      options.throttleDelay || Default.TOUCH_THROTTLE_DELAY

    const deviceMaxTouchPoints = getMaxTouchPoints()
    if (
      deviceMaxTouchPoints > 0 &&
      this.maxTouchPoints > deviceMaxTouchPoints
    ) {
      this.maxTouchPoints = deviceMaxTouchPoints
    }
  }

  /**
   * Checks if the drawing configuration has any touch event handlers.
   * @param options Drawing configuration to check
   * @returns True if touch handlers are present
   */
  private hasTouchHandlers(options: DrawConfig): boolean {
    return !!(
      options.onTouch ||
      options.onTouchStart ||
      options.onTouchMove ||
      options.onTouchEnd ||
      options.onTap ||
      options.onDoubleTap ||
      options.onHold
    )
  }

  /**
   * Processes mouse click events and triggers shape click handlers.
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
   * Processes mouse move events for hover detection with throttling.
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
   * Processes hover events and triggers shape hover handlers.
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
   * Locates a shape at the specified coordinates using spatial indexing.
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
    const candidates = this.spatialIndex.queryPoint(x, y)
    for (const candidate of candidates) {
      const shape = this.registeredShapes.get(candidate.id)
      if (shape && this.pointInBounds(x, y, shape.bounds)) {
        return shape
      }
    }
    return null
  }

  /**
   * Determines if a point is within the specified shape bounds.
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param bounds - Shape boundary rectangle
   * @returns True when point is inside bounds
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
   * Calculates shape boundaries for hit testing.
   * @param options - Drawing configuration containing shape dimensions
   * @returns Boundary rectangle for the shape in canvas coordinates
   */
  private calculateShapeBounds(options: DrawConfig): {
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
    return {
      x,
      y,
      width,
      height
    }
  }

  /**
   * Converts mouse event coordinates to canvas-relative coordinates.
   * @param event - Mouse event
   * @returns Canvas-relative coordinates adjusted for device pixel ratio
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
    const scaledX = canvasX * (this.canvasElement.width / rect.width)
    const scaledY = canvasY * (this.canvasElement.height / rect.height)
    if (this.coordinateTransformer) {
      const [transformedX, transformedY] = this.coordinateTransformer(
        scaledX,
        scaledY
      )
      return { x: transformedX, y: transformedY }
    }
    return { x: scaledX, y: scaledY }
  }

  /**
   * Updates spatial index bounds when canvas dimensions change.
   * @param width - New canvas width
   * @param height - New canvas height
   */
  updateBounds(width: number, height: number): void {
    const existingShapes = Array.from(this.registeredShapes.values())
    this.spatialIndex = new QuadTree(0, 0, width, height)
    for (const shape of existingShapes) {
      const spatialObject: SpatialObject = {
        id: shape.shapeId,
        x: shape.bounds.x,
        y: shape.bounds.y,
        width: shape.bounds.width,
        height: shape.bounds.height
      }
      this.spatialIndex.insert(spatialObject)
    }
  }

  /**
   * Handles touch start events.
   * @param event Touch start event
   */
  private handleTouchStart(event: TouchEvent): void {
    if (!this.enabled || !this.touchEnabled) {
      return
    }
    event.preventDefault()
    if (event.touches.length > this.maxTouchPoints) {
      throw new Error(ErrorCanvas.TOUCH_POINTS_EXCEEDED(this.maxTouchPoints))
    }
    const touches = this.processTouchList(event.touches)
    this.updateActiveTouches(touches)
    if (touches.length === 1) {
      const touch = touches[0]
      if (touch) {
        this.setupHoldDetection(touch)
        const hitShape = this.findShapeAt(touch.x, touch.y)
        if (hitShape && hitShape.options.onTouchStart) {
          this.dispatchTouchEvent('touchstart', hitShape, touch, touches)
        }
      }
    }
  }

  /**
   * Handles touch move events with throttling.
   * @param event Touch move event
   */
  private handleTouchMove(event: TouchEvent): void {
    if (!this.enabled || !this.touchEnabled || this.touchThrottleId !== null) {
      return
    }
    event.preventDefault()
    this.clearHoldDetection()
    this.touchThrottleId = window.setTimeout(() => {
      this.processTouchMoveEvent(event)
      this.touchThrottleId = null
    }, this.touchThrottleDelay)
  }

  /**
   * Handles touch end events and detects taps.
   * @param event Touch end event
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (!this.enabled || !this.touchEnabled) {
      return
    }
    event.preventDefault()
    this.clearHoldDetection()
    const touches = this.processTouchList(event.changedTouches)
    if (touches.length === 1) {
      const touch = touches[0]
      if (touch) {
        const hitShape = this.findShapeAt(touch.x, touch.y)

        if (hitShape) {
          if (hitShape.options.onTouchEnd) {
            this.dispatchTouchEvent('touchend', hitShape, touch, touches)
          }

          this.detectTapEvents(hitShape, touch)
        }
      }
    }
    this.removeFinishedTouches(touches)
  }

  /**
   * Processes touch move events.
   * @param event Touch move event
   */
  private processTouchMoveEvent(event: TouchEvent): void {
    const touches = this.processTouchList(event.touches)
    this.updateActiveTouches(touches)
    for (const touch of touches) {
      const hitShape = this.findShapeAt(touch.x, touch.y)
      if (hitShape && hitShape.options.onTouchMove) {
        this.dispatchTouchEvent('touchmove', hitShape, touch, touches)
      }
    }
  }

  /**
   * Converts TouchList to TouchPoint array with coordinate transformation.
   * @param touchList Native TouchList from event
   * @returns Array of processed TouchPoint objects
   */
  private processTouchList(touchList: TouchList): TouchPoint[] {
    const touches: TouchPoint[] = []
    for (let i = 0; i < touchList.length; i++) {
      const nativeTouch = touchList[i]
      if (nativeTouch && this.canvasElement) {
        const rect = this.canvasElement.getBoundingClientRect()
        const canvasX = nativeTouch.clientX - rect.left
        const canvasY = nativeTouch.clientY - rect.top
        let transformedX = canvasX
        let transformedY = canvasY
        if (this.coordinateTransformer) {
          const [x, y] = this.coordinateTransformer(canvasX, canvasY)
          transformedX = x
          transformedY = y
        }
        touches.push({
          identifier: nativeTouch.identifier,
          x: transformedX,
          y: transformedY,
          pressure: nativeTouch.force || 1,
          radiusX: nativeTouch.radiusX || Default.TOUCH_TAP_RADIUS,
          radiusY: nativeTouch.radiusY || Default.TOUCH_TAP_RADIUS
        })
      }
    }
    return touches
  }

  /**
   * Updates the active touches map.
   * @param touches Current touch points
   */
  private updateActiveTouches(touches: TouchPoint[]): void {
    for (const touch of touches) {
      this.activeTouches.set(touch.identifier, touch)
    }
  }

  /**
   * Removes finished touches from active touches map.
   * @param finishedTouches Touch points that have ended
   */
  private removeFinishedTouches(finishedTouches: TouchPoint[]): void {
    for (const touch of finishedTouches) {
      this.activeTouches.delete(touch.identifier)
    }
  }

  /**
   * Sets up hold detection for a touch point.
   * @param touch Touch point to monitor
   */
  private setupHoldDetection(touch: TouchPoint): void {
    this.clearHoldDetection()
    this.holdTimeoutId = window.setTimeout(() => {
      const hitShape = this.findShapeAt(touch.x, touch.y)
      if (hitShape && hitShape.options.onHold) {
        this.dispatchTouchEvent('hold', hitShape, touch, [touch])
      }
    }, Default.TOUCH_HOLD_DURATION)
  }

  /**
   * Clears hold detection timeout.
   */
  private clearHoldDetection(): void {
    if (this.holdTimeoutId !== null) {
      window.clearTimeout(this.holdTimeoutId)
      this.holdTimeoutId = null
    }
  }

  /**
   * Detects tap and double-tap events.
   * @param hitShape Shape that was touched
   * @param touch Touch point data
   */
  private detectTapEvents(hitShape: InteractiveShape, touch: TouchPoint): void {
    const now = Date.now()
    const isDoubleTap =
      this.lastTapTime > 0 &&
      now - this.lastTapTime < Default.DOUBLE_TAP_DELAY &&
      this.lastTapPosition &&
      Math.abs(this.lastTapPosition.x - touch.x) <
        Default.TOUCH_MOVE_THRESHOLD &&
      Math.abs(this.lastTapPosition.y - touch.y) < Default.TOUCH_MOVE_THRESHOLD
    if (isDoubleTap && hitShape.options.onDoubleTap) {
      this.dispatchTouchEvent('doubletap', hitShape, touch, [touch])
      this.lastTapTime = 0
      this.lastTapPosition = null
    } else {
      if (hitShape.options.onTap) {
        this.dispatchTouchEvent('tap', hitShape, touch, [touch])
      }
      this.lastTapTime = now
      this.lastTapPosition = { x: touch.x, y: touch.y }
    }
  }

  /**
   * Dispatches a touch event to the appropriate handler.
   * @param eventType Type of touch event
   * @param hitShape Shape that was touched
   * @param primaryTouch Primary touch point
   * @param allTouches All active touch points
   */
  private dispatchTouchEvent(
    eventType: string,
    hitShape: InteractiveShape,
    primaryTouch: TouchPoint,
    allTouches: TouchPoint[]
  ): void {
    const interactiveEvent: InteractiveEvent = {
      type: eventType as InteractiveEvent['type'],
      shapeId: hitShape.shapeId,
      layoutName: hitShape.layoutName,
      timestamp: Date.now(),
      x: primaryTouch.x,
      y: primaryTouch.y,
      touches: allTouches,
      touchCount: allTouches.length,
      pressure: primaryTouch.pressure || undefined
    }
    try {
      const handler = this.getTouchHandler(hitShape.options, eventType)
      if (handler) {
        handler(interactiveEvent)
      }
    } catch (error) {
      throw new Error(ErrorCanvas.TOUCH_HANDLER_ERROR(eventType, String(error)))
    }
  }

  /**
   * Gets the appropriate touch handler for an event type.
   * @param options Drawing configuration options
   * @param eventType Touch event type
   * @returns Touch event handler function or null
   */
  private getTouchHandler(
    options: DrawConfig,
    eventType: string
  ): ((event: InteractiveEvent) => void) | null {
    switch (eventType) {
      case 'touchstart':
        return options.onTouchStart || null
      case 'touchmove':
        return options.onTouchMove || null
      case 'touchend':
        return options.onTouchEnd || null
      case 'tap':
        return options.onTap || null
      case 'doubletap':
        return options.onDoubleTap || null
      case 'hold':
        return options.onHold || null
      case 'touch':
        return options.onTouch || null
      default:
        return null
    }
  }
}
