/**
 * Public configuration interfaces for NeaCanvas users.
 * These are the only interfaces users need to interact with the framework.
 * @public - Exposed to end users via main index.ts
 */

/**
 * Interactive event data structure.
 */
export interface InteractiveEvent {
  /** Event type indicating user interaction */
  type:
    | 'click'
    | 'hover'
    | 'touch'
    | 'touchstart'
    | 'touchmove'
    | 'touchend'
    | 'tap'
    | 'doubletap'
    | 'hold'
  /** Name of the layout containing the shape */
  layoutName: string
  /** Timestamp when the event occurred */
  timestamp: number
  /** Unique identifier of the shape that triggered the event */
  shapeId?: string
  /** X coordinate of the event in canvas space */
  x: number
  /** Y coordinate of the event in canvas space */
  y: number
  /** Touch-specific properties (only present for touch events) */
  touches?: TouchPoint[]
  /** Number of simultaneous touches */
  touchCount?: number
  /** Touch pressure (0-1, if supported by device) */
  pressure?: number | undefined
}

/**
 * Touch point data structure for multi-touch support.
 */
export interface TouchPoint {
  /** Unique identifier for this touch point */
  identifier: number
  /** X coordinate of the touch point */
  x: number
  /** Y coordinate of the touch point */
  y: number
  /** Touch pressure (0-1, if supported) */
  pressure?: number
  /** Touch radius in pixels (if supported) */
  radiusX?: number
  /** Touch radius in pixels (if supported) */
  radiusY?: number
}

/**
 * Interactive shape data structure.
 */
export interface InteractiveShape {
  /** Unique identifier for the shape */
  shapeId: string
  /** Drawing configuration options */
  options: DrawConfig
  /** Name of the layout containing the shape */
  layoutName: string
  /** Shape boundaries in canvas coordinates */
  bounds: { x: number; y: number; width: number; height: number }
  /** Layout configuration settings */
  layoutConfig: { x?: number; y?: number; width: number; height: number }
}

/**
 * Configuration for canvas initialization.
 */
export interface CanvasConfig {
  /** Canvas width in pixels */
  width: number
  /** Canvas height in pixels */
  height: number
  /** Optional background color */
  backgroundColor?: string
}

/**
 * Configuration for layout creation.
 */
export interface LayoutConfig {
  /** Layout width in pixels */
  width: number
  /** Layout height in pixels */
  height: number
  /** Optional X position offset */
  x?: number
  /** Optional Y position offset */
  y?: number
  /** Optional background color */
  backgroundColor?: string
  /** Optional stroke color */
  strokeColor?: string
  /** Optional line width */
  lineWidth?: number
}

/**
 * Configuration for drawing operations.
 */
export interface DrawConfig {
  /** X coordinate */
  x: number
  /** Y coordinate */
  y: number
  /** Width (for rectangle, triangle) - must be positive */
  width?: number
  /** Height (for rectangle, triangle) - must be positive */
  height?: number
  /** Radius (for circle) - must be positive */
  radius?: number
  /** Radius X (for ellipse) - must be positive */
  radiusX?: number
  /** Radius Y (for ellipse) - must be positive */
  radiusY?: number
  /** End X coordinate (for line) */
  endX?: number
  /** End Y coordinate (for line) */
  endY?: number
  /** Text content (for text, multitext) */
  text?: string
  /** Lines of text (for multitext) */
  lines?: string[]
  /** Font size in pixels (for text, multitext) - must be positive */
  fontSize?: number
  /** Font family (for text, multitext) */
  fontFamily?: string
  /** Text alignment (for text, multitext) */
  textAlign?: CanvasTextAlign
  /** Text baseline (for text, multitext) */
  textBaseline?: CanvasTextBaseline
  /** Maximum width for text wrapping (for multitext) - must be positive */
  maxWidth?: number
  /** Line height for multi-line text (for multitext) - must be positive */
  lineHeight?: number
  /** Fill color */
  fill?: string
  /** Stroke color */
  stroke?: string
  /** Stroke width - must be non-negative */
  strokeWidth?: number
  /** Shadow effect for all shapes */
  shadow?: {
    /** Horizontal shadow offset */
    offsetX?: number
    /** Vertical shadow offset */
    offsetY?: number
    /** Shadow blur radius */
    blur?: number
    /** Shadow color */
    color?: string
    /** Primary shadow configuration */
    primary?: {
      /** Primary shadow horizontal offset */
      offsetX: number
      /** Primary shadow vertical offset */
      offsetY: number
      /** Primary shadow blur radius */
      blur: number
      /** Primary shadow color */
      color: string
    }
    /** Apply shadow inward instead of outward */
    inner?: boolean
    /** Shadow spread distance */
    spread?: number
  }
  /** Glow effect for all shapes */
  glow?: {
    /** Glow color */
    color?: string
    /** Glow blur radius */
    blur?: number
    /** Glow intensity level */
    intensity?: number
    /** Glow spread distance */
    spread?: number
    /** Glow application type */
    type?: 'outer' | 'inner' | 'both'
    /** Multiple glow layers */
    multiple?: Array<{
      /** Layer glow color */
      color: string
      /** Layer glow blur radius */
      blur: number
      /** Layer glow intensity level */
      intensity: number
    }>
  }
  /** Gradient fill for all shapes */
  gradient?: {
    /** Gradient type */
    type: 'linear' | 'radial'
    /** Color stops with position and color */
    stops: Array<{ offset: number; color: string }>
    /** Starting X coordinate for linear gradient */
    x0?: number
    /** Starting Y coordinate for linear gradient */
    y0?: number
    /** Ending X coordinate for linear gradient */
    x1?: number
    /** Ending Y coordinate for linear gradient */
    y1?: number
    /** Inner radius for radial gradient */
    r0?: number
    /** Outer radius for radial gradient */
    r1?: number
  }
  /** Blend mode for compositing */
  blendMode?: GlobalCompositeOperation
  /** Opacity level (0.0 to 1.0) - must be between 0.0 and 1.0 */
  opacity?: number
  /** Filter effects for all shapes */
  filters?: {
    /** Blur filter amount */
    blur?: number
    /** Brightness adjustment level */
    brightness?: number
    /** Contrast adjustment level */
    contrast?: number
    /** Saturation adjustment level */
    saturate?: number
    /** Hue rotation in degrees */
    hueRotate?: number
    /** Grayscale filter amount */
    grayscale?: number
    /** Sepia filter amount */
    sepia?: number
    /** Invert filter amount */
    invert?: number
    /** Drop shadow filter configuration */
    dropShadow?: {
      /** Drop shadow horizontal offset */
      offsetX: number
      /** Drop shadow vertical offset */
      offsetY: number
      /** Drop shadow blur radius */
      blur: number
      /** Drop shadow color */
      color: string
      /** Drop shadow spread distance */
      spread?: number
    }
  }
  /** Transform effects for all shapes */
  transform?: {
    /** Translation offset */
    translate?: { x: number; y: number }
    /** Rotation in radians */
    rotate?: number
    /** Scale factors for X and Y axes - must be non-zero */
    scale?: { x: number; y: number }
    /** Transform origin point (center of rotation/scale) */
    origin?: { x: number; y: number }
  }
  /** Smoothing effects for rendering quality */
  smoothing?: {
    /** Anti-aliasing quality level */
    antialiasing?: 'none' | 'low' | 'medium' | 'high'
    /** Curve smoothing factor (0.0 to 1.0) - must be between 0.0 and 1.0 */
    curveSmoothing?: number
    /** Sub-pixel rendering mode */
    subPixel?: boolean
    /** Precision level for calculations */
    precision?: 'low' | 'medium' | 'high'
  }
  /** Interactive event handlers */
  onClick?: (event: InteractiveEvent) => void
  onHover?: (event: InteractiveEvent) => void
  /** Touch event handlers */
  onTap?: (event: InteractiveEvent) => void
  onTouch?: (event: InteractiveEvent) => void
  onTouchStart?: (event: InteractiveEvent) => void
  onTouchMove?: (event: InteractiveEvent) => void
  onTouchEnd?: (event: InteractiveEvent) => void
  onDoubleTap?: (event: InteractiveEvent) => void
  onHold?: (event: InteractiveEvent) => void
}

/**
 * Configuration for render operations.
 */
export interface RenderConfig {
  /** Enables interactive features for the rendered content. */
  interactive?: boolean
}

/**
 * Configuration for export operations.
 */
export interface ExportConfig {
  /** Export format type */
  format: 'png' | 'jpeg' | 'jpg' | 'svg' | 'pdf'
  /** Export quality setting (0.0 to 1.0) - must be between 0.0 and 1.0 */
  quality?: number
}
