import type { DrawConfig } from '@interfaces/index'
import { DrawingUtils } from '@tools/2d/DrawingUtils'

/**
 * Rectangle drawing tool with universal effects support
 */
export class Rectangle {
  /**
   * Draws a rectangle on the canvas context with effects
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration with effects
   * @throws Error when width or height is not specified or drawing fails
   */
  static draw(ctx: CanvasRenderingContext2D, options: DrawConfig): void {
    const { x, y, width, height } = options
    DrawingUtils.validateRequiredProps(
      options,
      ['x', 'y', 'width', 'height'],
      'Rectangle'
    )
    const safeWidth = width!
    const safeHeight = height!
    DrawingUtils.drawRectWithEffects(ctx, options, x, y, safeWidth, safeHeight)
  }
}
