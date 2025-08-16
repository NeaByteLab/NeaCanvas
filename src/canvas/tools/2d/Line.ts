import type { DrawConfig } from '@interfaces/index'
import { DrawingUtils } from '@tools/2d/DrawingUtils'

/**
 * Line drawing tool with universal effects support
 */
export class Line {
  /**
   * Draws a line on the canvas context with effects
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration with effects
   * @throws Error when endX or endY is not specified or drawing fails
   */
  static draw(ctx: CanvasRenderingContext2D, options: DrawConfig): void {
    const { x, y, endX, endY } = options
    DrawingUtils.validateRequiredProps(
      options,
      ['x', 'y', 'endX', 'endY'],
      'Line'
    )
    const safeEndX = endX!
    const safeEndY = endY!
    DrawingUtils.drawLineWithEffects(ctx, options, x, y, safeEndX, safeEndY)
  }
}
