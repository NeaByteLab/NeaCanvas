/**
 * Error messages for canvas framework operations
 * Centralizes all framework-related error messages for consistent user feedback
 */
export const ErrorCanvas = {
  /** Error when canvas is not initialized before use */
  CANVAS_NOT_INITIALIZED:
    'Canvas must be initialized with NeaCanvas.init() before creating layouts',
  /** Error when layout name already exists */
  LAYOUT_ALREADY_EXISTS: (name: string) =>
    `Layout with name '${name}' already exists`,
  /** Error when layout extends beyond canvas boundaries */
  LAYOUT_OUT_OF_BOUNDS: (
    x: number,
    y: number,
    width: number,
    height: number,
    canvasWidth: number,
    canvasHeight: number
  ) =>
    `Layout extends beyond canvas bounds. Canvas size: ${canvasWidth}x${canvasHeight}, Layout extends to: ${x + width}x${y + height}`,
  /** Error when layout position is outside canvas bounds */
  LAYOUT_POSITION_INVALID: (x: number, y: number) =>
    `Layout cannot be positioned outside canvas bounds. Position (${x}, ${y}) is invalid`,
  /** Error when new layout overlaps with existing layout */
  LAYOUT_OVERLAP: (name: string, existingName: string) =>
    `Layout '${name}' overlaps with existing layout '${existingName}'. Resolve overlap before creating new layout.`,
  /** Error when renderer is not properly initialized */
  RENDERER_NOT_INITIALIZED: 'Renderer is not properly initialized',
  /** Error when canvas context cannot be obtained from pool */
  CANVAS_CONTEXT_POOL_FAILED: 'Failed to get canvas context from NeaSmart pool',
  /** Error when canvas context is not initialized */
  CANVAS_CONTEXT_NOT_INITIALIZED: 'Canvas context not initialized',
  /** Error when shape position is outside layout boundaries */
  SHAPE_OUT_OF_BOUNDS: (
    x: number,
    y: number,
    layoutWidth: number,
    layoutHeight: number
  ) =>
    `Shape position (${x}, ${y}) is outside layout bounds (${layoutWidth}x${layoutHeight})`,
  /** Error when rendering is attempted outside browser environment */
  BROWSER_ONLY_RENDERING: 'Rendering is only available in browser environments',
  /** Error when canvas initialization is not implemented */
  CANVAS_INIT_NOT_IMPLEMENTED: 'Canvas initialization is not implemented',
  /** Error when rendering functionality is not implemented */
  RENDERING_NOT_IMPLEMENTED: 'Rendering is not implemented',
  /** Error when dimensions are invalid */
  INVALID_DIMENSIONS: (width: number, height: number) =>
    `Invalid dimensions: width=${width}, height=${height}`,
  /** Error when coordinates are invalid */
  INVALID_COORDINATES: (x: number, y: number) =>
    `Invalid coordinates: x=${x}, y=${y}`,
  /** Error when required canvas package is not installed */
  CANVAS_PACKAGE_MISSING:
    'Canvas package not installed. Please run: npm install canvas',

  /** Error when coordinate types are invalid */
  INVALID_COORDINATE_TYPES: (xType: string, yType: string) =>
    `Invalid coordinate types: x=${xType}, y=${yType}. Coordinates must be numbers.`,
  /** Error when coordinates are NaN */
  COORDINATES_NAN: (x: number, y: number) =>
    `Invalid coordinates: x=${x}, y=${y}. Coordinates cannot be NaN.`,
  /** Error when coordinates are not finite */
  COORDINATES_NOT_FINITE: (x: number, y: number) =>
    `Invalid coordinates: x=${x}, y=${y}. Coordinates must be finite numbers.`,
  /** Error when coordinates are extreme values */
  EXTREME_COORDINATES: (x: number, y: number) =>
    `Extreme coordinates: x=${x}, y=${y}. Coordinates must be within reasonable range (-1M to 1M).`,
  /** Error when shape name is invalid */
  INVALID_SHAPE_NAME: (shapeName: string) =>
    `Invalid shape name: '${shapeName}'. Shape name must be a non-empty string.`,
  /** Error when options object is invalid */
  INVALID_OPTIONS: (optionsType: string) =>
    `Invalid options: ${optionsType}. Options must be an object.`,
  /** Error when fontSize is invalid */
  INVALID_FONT_SIZE: (fontSize: number) =>
    `Invalid fontSize: ${fontSize}. Must be a positive number between 1-1000.`,
  /** Error when text property is invalid */
  INVALID_TEXT: (textType: string) =>
    `Invalid text: ${textType}. Text must be a string.`,
  /** Error when lines property is invalid */
  INVALID_LINES: (linesType: string) =>
    `Invalid lines: ${linesType}. Lines must be an array.`,
  /** Error when radiusX is invalid */
  INVALID_RADIUS_X: (radiusX: number) =>
    `Invalid radiusX: ${radiusX}. Must be a positive number between 1-10000.`,
  /** Error when radiusY is invalid */
  INVALID_RADIUS_Y: (radiusY: number) =>
    `Invalid radiusY: ${radiusY}. Must be a positive number between 1-10000.`,
  /** Error when radius is invalid */
  INVALID_RADIUS: (radius: number) =>
    `Invalid radius: ${radius}. Must be a positive number between 1-10000.`,
  /** Error when line endpoint types are invalid */
  INVALID_LINE_ENDPOINT_TYPES: (endXType: string, endYType: string) =>
    `Invalid line endpoints: endX=${endXType}, endY=${endYType}. Must be numbers.`,
  /** Error when line endpoints are not finite */
  INVALID_LINE_ENDPOINTS: (endX: number, endY: number) =>
    `Invalid line endpoints: endX=${endX}, endY=${endY}. Must be finite numbers.`,
  /** Error when line endpoints are extreme values */
  EXTREME_LINE_ENDPOINTS: (endX: number, endY: number) =>
    `Extreme line endpoints: endX=${endX}, endY=${endY}. Must be within reasonable range.`,
  /** Error when dimension types are invalid */
  INVALID_DIMENSION_TYPES: (widthType: string, heightType: string) =>
    `Invalid dimensions: width=${widthType}, height=${heightType}. Must be numbers.`,
  /** Error when dimensions are not finite */
  INVALID_DIMENSIONS_NOT_FINITE: (width: number, height: number) =>
    `Invalid dimensions: width=${width}, height=${height}. Must be finite numbers.`,
  /** Error when dimensions are out of range */
  INVALID_DIMENSIONS_RANGE: (width: number, height: number) =>
    `Invalid dimensions: width=${width}, height=${height}. Must be between 0-100000.`,
  /** Error when fill color type is invalid */
  INVALID_FILL_COLOR: (fillType: string) =>
    `Invalid fill color: ${fillType}. Fill must be a string.`,
  /** Error when stroke color type is invalid */
  INVALID_STROKE_COLOR: (strokeType: string) =>
    `Invalid stroke color: ${strokeType}. Stroke must be a string.`,
  /** Error when strokeWidth is invalid */
  INVALID_STROKE_WIDTH: (strokeWidth: number) =>
    `Invalid strokeWidth: ${strokeWidth}. Must be a number between 0-1000.`,
  /** Error when opacity is invalid */
  INVALID_OPACITY: (opacity: number) =>
    `Invalid opacity: ${opacity}. Must be a number between 0-1.`
} as const
