/**
 * Error messages for canvas framework operations
 * Centralizes all framework-related error messages for consistent user feedback
 * @internal Framework use only, not exposed to public API
 */
export const ErrorCanvas = {
  /** Error when canvas is not initialized before use */
  CANVAS_NOT_INITIALIZED:
    'Canvas must be initialized with NeaCanvas.init() before creating layouts',
  /** Error when layout name already exists */
  LAYOUT_ALREADY_EXISTS: (name: string) =>
    `[Layout: ${name}] Layout with name '${name}' already exists`,
  /** Error when layout extends beyond canvas boundaries */
  LAYOUT_OUT_OF_BOUNDS: (
    layoutName: string,
    x: number,
    y: number,
    width: number,
    height: number,
    canvasWidth: number,
    canvasHeight: number
  ) =>
    `[Layout: ${layoutName}] Layout extends beyond canvas bounds. Canvas size: ${canvasWidth}x${canvasHeight}, Layout extends to: ${x + width}x${y + height}`,
  /** Error when layout position is outside canvas bounds */
  LAYOUT_POSITION_INVALID: (layoutName: string, x: number, y: number) =>
    `[Layout: ${layoutName}] Layout cannot be positioned outside canvas bounds. Position (${x}, ${y}) is invalid`,
  /** Error when new layout overlaps with existing layout */
  LAYOUT_OVERLAP: (name: string, existingName: string) =>
    `[Layout: ${name}] Layout '${name}' overlaps with existing layout '${existingName}'. Resolve overlap before creating new layout.`,
  /** Error when renderer is not properly initialized */
  RENDERER_NOT_INITIALIZED: (layoutName?: string) =>
    layoutName
      ? `[Layout: ${layoutName}] Renderer is not properly initialized`
      : 'Renderer is not properly initialized',
  /** Error when canvas context cannot be obtained from pool */
  CANVAS_CONTEXT_POOL_FAILED: (layoutName?: string) =>
    layoutName
      ? `[Layout: ${layoutName}] Failed to get canvas context from NeaSmart pool`
      : 'Failed to get canvas context from NeaSmart pool',
  /** Error when canvas context is not initialized */
  CANVAS_CONTEXT_NOT_INITIALIZED: (layoutName?: string) =>
    layoutName
      ? `[Layout: ${layoutName}] Canvas context not initialized`
      : 'Canvas context not initialized',
  /** Error when shape position is outside layout boundaries */
  SHAPE_OUT_OF_BOUNDS: (
    layoutName: string,
    shapeName: string,
    x: number,
    y: number,
    layoutWidth: number,
    layoutHeight: number
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Shape position (${x}, ${y}) is outside layout bounds (${layoutWidth}x${layoutHeight})`,
  /** Error when rendering is attempted outside browser environment */
  BROWSER_ONLY_RENDERING: (layoutName?: string) =>
    layoutName
      ? `[Layout: ${layoutName}] Rendering is only available in browser environments`
      : 'Rendering is only available in browser environments',
  /** Error when canvas initialization is not implemented */
  CANVAS_INIT_NOT_IMPLEMENTED: (layoutName?: string) =>
    layoutName
      ? `[Layout: ${layoutName}] Canvas initialization is not implemented`
      : 'Canvas initialization is not implemented',
  /** Error when rendering functionality is not implemented */
  RENDERING_NOT_IMPLEMENTED: (layoutName?: string) =>
    layoutName
      ? `[Layout: ${layoutName}] Rendering is not implemented`
      : 'Rendering is not implemented',
  /** Error when dimensions are invalid */
  INVALID_DIMENSIONS: (
    layoutName: string,
    shapeName: string,
    width: number,
    height: number
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid dimensions: width=${width}, height=${height}`,
  /** Error when coordinates are invalid */
  INVALID_COORDINATES: (
    layoutName: string,
    shapeName: string,
    x: number,
    y: number
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid coordinates: x=${x}, y=${y}`,
  /** Error when required canvas package is not installed */
  CANVAS_PACKAGE_MISSING: (layoutName?: string) =>
    layoutName
      ? `[Layout: ${layoutName}] Canvas package not installed. Please run: npm install canvas`
      : 'Canvas package not installed. Please run: npm install canvas',

  /** Error when coordinate types are invalid */
  INVALID_COORDINATE_TYPES: (
    layoutName: string,
    shapeName: string,
    xType: string,
    yType: string
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid coordinate types: x=${xType}, y=${yType}. Coordinates must be numbers.`,
  /** Error when coordinates are NaN */
  COORDINATES_NAN: (
    layoutName: string,
    shapeName: string,
    x: number,
    y: number
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid coordinates: x=${x}, y=${y}. Coordinates cannot be NaN.`,
  /** Error when coordinates are not finite */
  COORDINATES_NOT_FINITE: (
    layoutName: string,
    shapeName: string,
    x: number,
    y: number
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid coordinates: x=${x}, y=${y}. Coordinates must be finite numbers.`,
  /** Error when coordinates are extreme values */
  EXTREME_COORDINATES: (
    layoutName: string,
    shapeName: string,
    x: number,
    y: number
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Extreme coordinates: x=${x}, y=${y}. Coordinates must be within reasonable range (-1M to 1M).`,
  /** Error when shape name is invalid */
  INVALID_SHAPE_NAME: (layoutName: string, shapeName: string) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid shape name: '${shapeName}'. Shape name must be a non-empty string.`,
  /** Error when options object is invalid */
  INVALID_OPTIONS: (
    layoutName: string,
    shapeName: string,
    optionsType: string
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid options: ${optionsType}. Options must be an object.`,
  /** Error when fontSize is invalid */
  INVALID_FONT_SIZE: (
    layoutName: string,
    shapeName: string,
    fontSize: number
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid fontSize: ${fontSize}. Must be a positive number between 1-1000.`,
  /** Error when text property is invalid */
  INVALID_TEXT: (layoutName: string, shapeName: string, textType: string) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid text: ${textType}. Text must be a string.`,
  /** Error when lines property is invalid */
  INVALID_LINES: (layoutName: string, shapeName: string, linesType: string) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid lines: ${linesType}. Lines must be an array.`,
  /** Error when radiusX is invalid */
  INVALID_RADIUS_X: (layoutName: string, shapeName: string, radiusX: number) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid radiusX: ${radiusX}. Must be a positive number between 1-10000.`,
  /** Error when radiusY is invalid */
  INVALID_RADIUS_Y: (layoutName: string, shapeName: string, radiusY: number) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid radiusY: ${radiusY}. Must be a positive number between 1-10000.`,
  /** Error when radius is invalid */
  INVALID_RADIUS: (layoutName: string, shapeName: string, radius: number) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid radius: ${radius}. Must be a positive number between 1-10000.`,
  /** Error when line endpoint types are invalid */
  INVALID_LINE_ENDPOINT_TYPES: (
    layoutName: string,
    shapeName: string,
    endXType: string,
    endYType: string
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid line endpoints: endX=${endXType}, endY=${endYType}. Must be numbers.`,
  /** Error when line endpoints are not finite */
  INVALID_LINE_ENDPOINTS: (
    layoutName: string,
    shapeName: string,
    endX: number,
    endY: number
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid line endpoints: endX=${endX}, endY=${endY}. Must be finite numbers.`,
  /** Error when line endpoints are extreme values */
  EXTREME_LINE_ENDPOINTS: (
    layoutName: string,
    shapeName: string,
    endX: number,
    endY: number
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Extreme line endpoints: endX=${endX}, endY=${endY}. Must be within reasonable range.`,
  /** Error when dimension types are invalid */
  INVALID_DIMENSION_TYPES: (
    layoutName: string,
    shapeName: string,
    widthType: string,
    heightType: string
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid dimensions: width=${widthType}, height=${heightType}. Must be numbers.`,
  /** Error when dimensions are not finite */
  INVALID_DIMENSIONS_NOT_FINITE: (
    layoutName: string,
    shapeName: string,
    width: number,
    height: number
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid dimensions: width=${width}, height=${height}. Must be finite numbers.`,
  /** Error when dimensions are out of range */
  INVALID_DIMENSIONS_RANGE: (
    layoutName: string,
    shapeName: string,
    width: number,
    height: number
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid dimensions: width=${width}, height=${height}. Must be between 0-16384 (16K max).`,
  /** Error when fill color type is invalid */
  INVALID_FILL_COLOR: (
    layoutName: string,
    shapeName: string,
    fillType: string
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid fill color: ${fillType}. Fill must be a string.`,
  /** Error when stroke color type is invalid */
  INVALID_STROKE_COLOR: (
    layoutName: string,
    shapeName: string,
    strokeType: string
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid stroke color: ${strokeType}. Stroke must be a string.`,
  /** Error when strokeWidth is invalid */
  INVALID_STROKE_WIDTH: (
    layoutName: string,
    shapeName: string,
    strokeWidth: number
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid strokeWidth: ${strokeWidth}. Must be a number between 0-1000.`,
  /** Error when opacity is invalid */
  INVALID_OPACITY: (layoutName: string, shapeName: string, opacity: number) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Invalid opacity: ${opacity}. Must be a number between 0-1.`,

  /** Error when unknown drawing tool is requested */
  UNKNOWN_DRAWING_TOOL: (
    layoutName: string,
    shapeName: string,
    availableTools: string
  ) =>
    `[Layout: ${layoutName}] [Shape: ${shapeName}] Unknown drawing tool: '${shapeName}'. Available tools: ${availableTools}...`,

  /** Error when unknown shape tool is encountered during execution */
  UNKNOWN_SHAPE_TOOL: (shapeName: string) =>
    `[Shape: ${shapeName}] Unknown shape tool: ${shapeName}`,

  /** Error when canvas package is not installed in Node.js */
  NODE_CANVAS_PACKAGE_MISSING:
    'Canvas package not installed. Please run: npm install canvas',

  /** Warning when shape has zero dimensions */
  ZERO_DIMENSIONS_WARNING: (shapeName: string, width: number, height: number) =>
    `Warning: Shape '${shapeName}' has zero dimensions: ${width}x${height}`,

  /** Log message for operation retry */
  OPERATION_RETRY_LOG: (shapeName: string, attemptNumber: number) =>
    `[Shape: ${shapeName}] Retrying operation ${shapeName} (attempt ${attemptNumber})`,

  /** Error log for permanently failed operation */
  OPERATION_PERMANENT_FAILURE: (shapeName: string) =>
    `[Shape: ${shapeName}] Operation permanently failed: ${shapeName}`
} as const
