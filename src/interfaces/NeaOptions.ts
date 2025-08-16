/**
 * Configuration for canvas initialization
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
 * Configuration for layout creation
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
 * Configuration for drawing operations
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
    offsetX?: number
    offsetY?: number
    blur?: number
    color?: string
    primary?: {
      offsetX: number
      offsetY: number
      blur: number
      color: string
    }
    inner?: boolean
    spread?: number
  }
  /** Glow effect for all shapes */
  glow?: {
    color?: string
    blur?: number
    intensity?: number
    spread?: number
    type?: 'outer' | 'inner' | 'both'
    multiple?: Array<{
      color: string
      blur: number
      intensity: number
    }>
  }
  /** Gradient fill for all shapes */
  gradient?: {
    type: 'linear' | 'radial'
    stops: Array<{ offset: number; color: string }>
    x0?: number
    y0?: number
    x1?: number
    y1?: number
    r0?: number
    r1?: number
  }
  /** Blend mode for compositing */
  blendMode?: GlobalCompositeOperation
  /** Opacity level (0.0 to 1.0) - must be between 0.0 and 1.0 */
  opacity?: number
  /** Filter effects for all shapes */
  filters?: {
    blur?: number
    brightness?: number
    contrast?: number
    saturate?: number
    hueRotate?: number
    grayscale?: number
    sepia?: number
    invert?: number
    dropShadow?: {
      offsetX: number
      offsetY: number
      blur: number
      color: string
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
  /** Mathematical smoothing effects for rendering quality */
  smoothing?: {
    /** Anti-aliasing quality */
    antialiasing?: 'none' | 'low' | 'medium' | 'high'
    /** Curve smoothing factor (0.0 to 1.0) - must be between 0.0 and 1.0 */
    curveSmoothing?: number
    /** Sub-pixel rendering */
    subPixel?: boolean
    /** Mathematical precision level */
    precision?: 'low' | 'medium' | 'high'
  }
}

/**
 * Configuration for export operations
 */
export interface ExportConfig {
  /** Export format type */
  format: 'png' | 'jpeg' | 'jpg' | 'svg' | 'pdf'
  /** Export quality setting (0.0 to 1.0) - must be between 0.0 and 1.0 */
  quality?: number
}
