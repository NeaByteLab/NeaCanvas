import type { DrawConfig } from '@interfaces/index'
import { ErrorCanvas } from '@constants/ErrorCanvas'
import { Default } from '@constants/Default'

/**
 * Utility class for validating drawing operations, coordinates, dimensions, and related properties.
 * Provides static methods for input validation and error checking.
 * @internal - Framework use only, not exposed to public API
 */
export class Validator {
  /**
   * Validates drawing input values such as coordinates, shape name, and options object.
   * Throws an error if any value is invalid.
   * @param layoutName Name of the layout for error context
   * @param shapeName Name of the shape to validate
   * @param options Drawing configuration options to validate
   * @throws Error if coordinates, shape name, or options object are invalid
   */
  static validateDrawInputs(
    layoutName: string,
    shapeName: string,
    options: DrawConfig
  ): void {
    if (typeof options.x !== 'number' || typeof options.y !== 'number') {
      throw new Error(
        ErrorCanvas.INVALID_COORDINATE_TYPES(
          layoutName,
          shapeName,
          typeof options.x,
          typeof options.y
        )
      )
    }
    if (isNaN(options.x) || isNaN(options.y)) {
      throw new Error(
        ErrorCanvas.COORDINATES_NAN(layoutName, shapeName, options.x, options.y)
      )
    }
    if (!isFinite(options.x) || !isFinite(options.y)) {
      throw new Error(
        ErrorCanvas.COORDINATES_NOT_FINITE(
          layoutName,
          shapeName,
          options.x,
          options.y
        )
      )
    }
    if (
      options.x < -Default.COORDINATE_RANGE ||
      options.x > Default.COORDINATE_RANGE ||
      options.y < -Default.COORDINATE_RANGE ||
      options.y > Default.COORDINATE_RANGE
    ) {
      throw new Error(
        ErrorCanvas.EXTREME_COORDINATES(
          layoutName,
          shapeName,
          options.x,
          options.y
        )
      )
    }
    if (
      !shapeName ||
      typeof shapeName !== 'string' ||
      shapeName.trim().length === 0
    ) {
      throw new Error(ErrorCanvas.INVALID_SHAPE_NAME(layoutName, shapeName))
    }
    if (!options || typeof options !== 'object') {
      throw new Error(
        ErrorCanvas.INVALID_OPTIONS(layoutName, shapeName, typeof options)
      )
    }
  }

  /**
   * Validates color and style properties such as fill, stroke, strokeWidth, and opacity.
   * Throws an error if any property is invalid.
   * @param layoutName Name of the layout for error context
   * @param shapeName Name of the shape for error context
   * @param options Drawing configuration containing color and style properties
   * @throws Error if any color or style property has invalid type or value
   */
  static validateColorProperties(
    layoutName: string,
    shapeName: string,
    options: DrawConfig
  ): void {
    if (options.fill !== undefined && typeof options.fill !== 'string') {
      throw new Error(
        ErrorCanvas.INVALID_FILL_COLOR(
          layoutName,
          shapeName,
          typeof options.fill
        )
      )
    }
    if (options.stroke !== undefined && typeof options.stroke !== 'string') {
      throw new Error(
        ErrorCanvas.INVALID_STROKE_COLOR(
          layoutName,
          shapeName,
          typeof options.stroke
        )
      )
    }
    if (options.strokeWidth !== undefined) {
      if (
        typeof options.strokeWidth !== 'number' ||
        isNaN(options.strokeWidth) ||
        options.strokeWidth < 0 ||
        options.strokeWidth > Default.MAX_STROKE_WIDTH
      ) {
        throw new Error(
          ErrorCanvas.INVALID_STROKE_WIDTH(
            layoutName,
            shapeName,
            options.strokeWidth
          )
        )
      }
    }
    if (options.opacity !== undefined) {
      if (
        typeof options.opacity !== 'number' ||
        isNaN(options.opacity) ||
        options.opacity < 0 ||
        options.opacity > 1
      ) {
        throw new Error(
          ErrorCanvas.INVALID_OPACITY(layoutName, shapeName, options.opacity)
        )
      }
    }
  }

  /**
   * Validates that a shape fits within the layout boundaries.
   * Throws an error if the shape extends beyond the layout.
   * @param layoutName Name of the layout for error context
   * @param shapeName Name of the shape for error context
   * @param options Drawing configuration containing position coordinates
   * @param shapeWidth Calculated width of the shape
   * @param shapeHeight Calculated height of the shape
   * @param layoutWidth Width of the layout
   * @param layoutHeight Height of the layout
   * @throws Error if shape extends beyond layout boundaries
   */
  static validateShapeBounds(
    layoutName: string,
    shapeName: string,
    options: DrawConfig,
    shapeWidth: number,
    shapeHeight: number,
    layoutWidth: number,
    layoutHeight: number
  ): void {
    if (
      options.x < 0 ||
      options.y < 0 ||
      options.x + shapeWidth > layoutWidth ||
      options.y + shapeHeight > layoutHeight
    ) {
      throw new Error(
        ErrorCanvas.SHAPE_OUT_OF_BOUNDS(
          layoutName,
          shapeName,
          options.x,
          options.y,
          layoutWidth,
          layoutHeight
        )
      )
    }
  }

  /**
   * Validates font size for text shapes.
   * Throws an error if the font size is invalid or out of range.
   * @param layoutName Name of the layout for error context
   * @param shapeName Name of the shape for error context
   * @param fontSize Font size to validate
   * @throws Error if fontSize is invalid or out of range
   */
  static validateFontSize(
    layoutName: string,
    shapeName: string,
    fontSize: number
  ): void {
    if (
      typeof fontSize !== 'number' ||
      isNaN(fontSize) ||
      fontSize <= 0 ||
      fontSize > Default.MAX_FONT_SIZE
    ) {
      throw new Error(
        ErrorCanvas.INVALID_FONT_SIZE(layoutName, shapeName, fontSize)
      )
    }
  }

  /**
   * Validates the text property for text shapes.
   * Throws an error if the text property is invalid.
   * @param layoutName Name of the layout for error context
   * @param shapeName Name of the shape for error context
   * @param text Text to validate
   * @throws Error if text property is invalid
   */
  static validateText(
    layoutName: string,
    shapeName: string,
    text: unknown
  ): void {
    if (typeof text !== 'string' && text !== undefined) {
      throw new Error(
        ErrorCanvas.INVALID_TEXT(layoutName, shapeName, typeof text)
      )
    }
  }

  /**
   * Validates the lines property for multitext shapes.
   * Throws an error if the lines property is invalid.
   * @param layoutName Name of the layout for error context
   * @param shapeName Name of the shape for error context
   * @param lines Lines array to validate
   * @throws Error if lines property is invalid
   */
  static validateLines(
    layoutName: string,
    shapeName: string,
    lines: unknown
  ): void {
    if (lines && !Array.isArray(lines)) {
      throw new Error(
        ErrorCanvas.INVALID_LINES(layoutName, shapeName, typeof lines)
      )
    }
  }

  /**
   * Validates the radius value for circle shapes.
   * Throws an error if the radius is invalid or out of range.
   * @param layoutName Name of the layout for error context
   * @param radius Radius to validate
   * @throws Error if radius value is invalid or out of range
   */
  static validateRadius(layoutName: string, radius: number): void {
    if (
      typeof radius !== 'number' ||
      isNaN(radius) ||
      radius <= 0 ||
      radius > Default.MAX_RADIUS
    ) {
      throw new Error(ErrorCanvas.INVALID_RADIUS(layoutName, 'circle', radius))
    }
  }

  /**
   * Validates the radiusX value for ellipse shapes.
   * Throws an error if the radiusX is invalid or out of range.
   * @param layoutName Name of the layout for error context
   * @param radiusX RadiusX to validate
   * @throws Error if radiusX value is invalid or out of range
   */
  static validateRadiusX(layoutName: string, radiusX: number): void {
    if (
      typeof radiusX !== 'number' ||
      isNaN(radiusX) ||
      radiusX <= 0 ||
      radiusX > Default.MAX_RADIUS
    ) {
      throw new Error(
        ErrorCanvas.INVALID_RADIUS_X(layoutName, 'ellipse', radiusX)
      )
    }
  }

  /**
   * Validates the radiusY value for ellipse shapes.
   * Throws an error if the radiusY is invalid or out of range.
   * @param layoutName Name of the layout for error context
   * @param radiusY RadiusY to validate
   * @throws Error if radiusY value is invalid or out of range
   */
  static validateRadiusY(layoutName: string, radiusY: number): void {
    if (
      typeof radiusY !== 'number' ||
      isNaN(radiusY) ||
      radiusY <= 0 ||
      radiusY > Default.MAX_RADIUS
    ) {
      throw new Error(
        ErrorCanvas.INVALID_RADIUS_Y(layoutName, 'ellipse', radiusY)
      )
    }
  }

  /**
   * Validates the types of line endpoints.
   * Throws an error if the endpoint types are invalid.
   * @param layoutName Name of the layout for error context
   * @param endX End X coordinate to validate
   * @param endY End Y coordinate to validate
   * @throws Error if endpoint coordinates have invalid types
   */
  static validateLineEndpointTypes(
    layoutName: string,
    endX: unknown,
    endY: unknown
  ): void {
    if (typeof endX !== 'number' || typeof endY !== 'number') {
      throw new Error(
        ErrorCanvas.INVALID_LINE_ENDPOINT_TYPES(
          layoutName,
          'line',
          typeof endX,
          typeof endY
        )
      )
    }
  }

  /**
   * Validates that line endpoints are valid numbers.
   * Throws an error if the endpoint values are not valid numbers.
   * @param layoutName Name of the layout for error context
   * @param endX End X coordinate to validate
   * @param endY End Y coordinate to validate
   * @throws Error if endpoint coordinates are invalid numbers
   */
  static validateLineEndpoints(
    layoutName: string,
    endX: number,
    endY: number
  ): void {
    if (isNaN(endX) || isNaN(endY) || !isFinite(endX) || !isFinite(endY)) {
      throw new Error(
        ErrorCanvas.INVALID_LINE_ENDPOINTS(layoutName, 'line', endX, endY)
      )
    }
  }

  /**
   * Validates that line endpoints are within the allowed coordinate range.
   * Throws an error if the endpoint values are outside the valid range.
   * @param layoutName Name of the layout for error context
   * @param endX End X coordinate to validate
   * @param endY End Y coordinate to validate
   * @throws Error if endpoint coordinates are outside valid range
   */
  static validateLineEndpointRange(
    layoutName: string,
    endX: number,
    endY: number
  ): void {
    if (
      endX < -Default.COORDINATE_RANGE ||
      endX > Default.COORDINATE_RANGE ||
      endY < -Default.COORDINATE_RANGE ||
      endY > Default.COORDINATE_RANGE
    ) {
      throw new Error(
        ErrorCanvas.EXTREME_LINE_ENDPOINTS(layoutName, 'line', endX, endY)
      )
    }
  }

  /**
   * Validates the types of dimensions for rectangle shapes.
   * Throws an error if the width or height types are invalid.
   * @param layoutName Name of the layout for error context
   * @param shapeName Name of the shape for error context
   * @param width Width to validate
   * @param height Height to validate
   * @throws Error if width or height have invalid types
   */
  static validateDimensionTypes(
    layoutName: string,
    shapeName: string,
    width: unknown,
    height: unknown
  ): void {
    if (typeof width !== 'number' || typeof height !== 'number') {
      throw new Error(
        ErrorCanvas.INVALID_DIMENSION_TYPES(
          layoutName,
          shapeName,
          typeof width,
          typeof height
        )
      )
    }
  }

  /**
   * Validates that dimensions are finite numbers.
   * Throws an error if the width or height are not finite numbers.
   * @param layoutName Name of the layout for error context
   * @param shapeName Name of the shape for error context
   * @param width Width to validate
   * @param height Height to validate
   * @throws Error if width or height are not finite numbers
   */
  static validateDimensionsFinite(
    layoutName: string,
    shapeName: string,
    width: number,
    height: number
  ): void {
    if (
      isNaN(width) ||
      isNaN(height) ||
      !isFinite(width) ||
      !isFinite(height)
    ) {
      throw new Error(
        ErrorCanvas.INVALID_DIMENSIONS_NOT_FINITE(
          layoutName,
          shapeName,
          width,
          height
        )
      )
    }
  }

  /**
   * Validates that dimensions are within the allowed range.
   * Throws an error if the width or height are outside the valid range.
   * @param layoutName Name of the layout for error context
   * @param shapeName Name of the shape for error context
   * @param width Width to validate
   * @param height Height to validate
   * @throws Error if width or height are outside valid range
   */
  static validateDimensionRange(
    layoutName: string,
    shapeName: string,
    width: number,
    height: number
  ): void {
    if (
      width < 0 ||
      height < 0 ||
      width > Default.MAX_DIMENSION ||
      height > Default.MAX_DIMENSION
    ) {
      throw new Error(
        ErrorCanvas.INVALID_DIMENSIONS_RANGE(
          layoutName,
          shapeName,
          width,
          height
        )
      )
    }
  }

  /**
   * Logs a warning if a shape has zero width or height.
   * @param shapeName Name of the shape for warning context
   * @param width Width to check
   * @param height Height to check
   */
  static warnZeroDimensions(
    shapeName: string,
    width: number,
    height: number
  ): void {
    if (width === 0 || height === 0) {
      console.warn(
        ErrorCanvas.ZERO_DIMENSIONS_WARNING(shapeName, width, height)
      )
    }
  }

  /**
   * Validates canvas dimensions against maximum size limits.
   * @param width Canvas width in pixels
   * @param height Canvas height in pixels
   * @throws Error if dimensions are invalid or exceed limits
   */
  static validateCanvasSize(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      throw new Error(
        ErrorCanvas.INVALID_DIMENSIONS('canvas', 'canvas', width, height)
      )
    }
    if (!Number.isFinite(width) || !Number.isFinite(height)) {
      throw new Error(
        ErrorCanvas.INVALID_DIMENSIONS_NOT_FINITE(
          'canvas',
          'canvas',
          width,
          height
        )
      )
    }
    if (width > Default.MAX_DIMENSION || height > Default.MAX_DIMENSION) {
      throw new Error(
        ErrorCanvas.INVALID_DIMENSIONS_RANGE('canvas', 'canvas', width, height)
      )
    }
  }

  /**
   * Validates that a layout fits within the canvas boundaries.
   * @param layoutName Name of the layout being validated
   * @param config Layout configuration to validate
   * @param canvasWidth Canvas width for boundary checking
   * @param canvasHeight Canvas height for boundary checking
   * @throws Error if layout extends beyond canvas bounds
   */
  static validateLayoutBounds(
    layoutName: string,
    config: { x?: number; y?: number; width: number; height: number },
    canvasWidth: number,
    canvasHeight: number
  ): void {
    const { x = 0, y = 0, width, height } = config
    if (x < 0 || y < 0) {
      throw new Error(ErrorCanvas.LAYOUT_POSITION_INVALID(layoutName, x, y))
    }
    if (x + width > canvasWidth || y + height > canvasHeight) {
      throw new Error(
        ErrorCanvas.LAYOUT_OUT_OF_BOUNDS(
          layoutName,
          x,
          y,
          width,
          height,
          canvasWidth,
          canvasHeight
        )
      )
    }
  }

  /**
   * Checks if two layout regions overlap.
   * @param layout1 First layout bounds with x, y, width, height
   * @param layout2 Second layout bounds with x, y, width, height
   * @returns True if layouts overlap, false otherwise
   */
  static layoutsOverlap(
    layout1: { x: number; y: number; width: number; height: number },
    layout2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return !(
      layout1.x + layout1.width <= layout2.x ||
      layout2.x + layout2.width <= layout1.x ||
      layout1.y + layout1.height <= layout2.y ||
      layout2.y + layout2.height <= layout1.y
    )
  }

  /**
   * Validates that a new layout does not overlap with any existing layouts.
   * @param name New layout identifier
   * @param config Layout configuration to validate
   * @param existingLayouts Map of existing layouts to check against
   * @throws Error if layout overlaps with existing layouts
   */
  static validateLayoutOverlap(
    name: string,
    config: { x?: number; y?: number; width: number; height: number },
    existingLayouts: Map<
      string,
      { getConfig(): { x?: number; y?: number; width: number; height: number } }
    >
  ): void {
    const { x = 0, y = 0, width, height } = config
    const newLayout = { x, y, width, height }

    for (const [existingName, existingLayout] of existingLayouts) {
      const existingConfig = existingLayout.getConfig()
      const existing = {
        x: existingConfig.x || 0,
        y: existingConfig.y || 0,
        width: existingConfig.width,
        height: existingConfig.height
      }
      if (this.layoutsOverlap(newLayout, existing)) {
        throw new Error(ErrorCanvas.LAYOUT_OVERLAP(name, existingName))
      }
    }
  }
}
