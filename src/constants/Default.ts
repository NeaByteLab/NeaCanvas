/**
 * Default configuration values for canvas operations
 * Provides standard values for shapes, layouts, and export settings
 * @internal Framework use only, not exposed to public API
 */
export const Default = {
  /** Default fill color for shapes - transparent by default */
  FILL: 'transparent',
  /** Default stroke color for shapes - black by default */
  STROKE: '#000000',
  /** Default line width for shape borders in pixels */
  LINE_WIDTH: 1,
  /** Default canvas width in pixels */
  CANVAS_WIDTH: 800,
  /** Default canvas height in pixels */
  CANVAS_HEIGHT: 600,
  /** Default layout width in pixels */
  LAYOUT_WIDTH: 400,
  /** Default layout height in pixels */
  LAYOUT_HEIGHT: 300,
  /** Default layout X position in pixels */
  LAYOUT_X: 0,
  /** Default layout Y position in pixels */
  LAYOUT_Y: 0,
  /** Default export quality for image formats - range 0.0 to 1.0 */
  EXPORT_QUALITY: 0.9,

  // Performance optimization constants
  /** Maximum queue size for batching operations */
  QUEUE_MAX_SIZE: 50,
  /** Maximum canvas pool size for reuse */
  POOL_MAX_SIZE: 10,
  /** Canvas pool timeout in milliseconds */
  POOL_TIMEOUT: 30000,
  /** Maximum dirty regions to track */
  DIRTY_REGIONS_MAX: 20,
  /** Maximum operation retry attempts */
  MAX_RETRIES: 3,
  /** Retry delay in milliseconds */
  RETRY_DELAY: 1000,

  // Validation limits
  /** Maximum font size in pixels */
  MAX_FONT_SIZE: 1000,
  /** Maximum radius value in pixels */
  MAX_RADIUS: 10000,
  /** Maximum dimension (width/height) in pixels */
  MAX_DIMENSION: 16384,
  /** Maximum coordinate range (positive/negative) */
  COORDINATE_RANGE: 1000000,
  /** Maximum stroke width in pixels */
  MAX_STROKE_WIDTH: 1000,

  // Shape ratios and scaling factors
  /** Star inner radius ratio */
  STAR_INNER_RATIO: 0.5,
  /** Text width estimation factor */
  TEXT_WIDTH_FACTOR: 0.6,
  /** Text height line spacing factor */
  TEXT_HEIGHT_FACTOR: 1.2,
  /** Shape scaling factor for small elements */
  SHAPE_SCALE_SMALL: 0.3,
  /** Shape scaling factor for medium elements */
  SHAPE_SCALE_MEDIUM: 0.6,
  /** Shape scaling factor for large elements */
  SHAPE_SCALE_LARGE: 0.8,

  // Drawing precision and steps
  /** High precision curve steps for smooth shapes */
  CURVE_STEPS_HIGH: 128,
  /** Medium precision curve steps */
  CURVE_STEPS_MEDIUM: 64,
  /** Low precision curve steps */
  CURVE_STEPS_LOW: 32,
  /** Default arc steps for rounded corners */
  ARC_STEPS_DEFAULT: 8,
  /** Default font size for text shapes */
  DEFAULT_FONT_SIZE: 16,
  /** Default radius for point shapes */
  POINT_RADIUS: 2,
  /** Default dot spacing for dotted lines */
  DOT_SPACING: 10,
  /** Default square size for checkerboard pattern */
  CHECKERBOARD_SIZE: 20,
  /** Default dot spacing for polka dots pattern */
  POLKA_DOT_SPACING: 25,
  /** Default dot radius for polka dots */
  POLKA_DOT_RADIUS: 5,
  /** Zigzag segment count */
  ZIGZAG_SEGMENTS: 8,

  // Environment and performance thresholds
  /** Maximum device pixel ratio for high DPI */
  MAX_DEVICE_PIXEL_RATIO: 4,
  /** Minimum device pixel ratio for high DPI */
  MIN_HIGH_DPI_RATIO: 2,
  /** Minimum CPU cores for hardware acceleration */
  MIN_HARDWARE_CORES: 4
} as const

/**
 * MIME type constants for export operations
 * Defines content types for different file formats
 */
export const MimeType = {
  /** PNG image format MIME type */
  PNG: 'image/png',
  /** JPEG image format MIME type */
  JPEG: 'image/jpeg',
  /** SVG vector format MIME type */
  SVG: 'image/svg+xml',
  /** PDF document format MIME type */
  PDF: 'application/pdf',
  /** UTF-8 text encoding for text-based formats */
  UTF8: 'utf8'
} as const
