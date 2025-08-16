import type { DrawConfig } from '@interfaces/index'
import { DrawingUtils } from '@tools/2d/DrawingUtils'

/**
 * Ellipse drawing tool with universal effects support
 */
export class Ellipse {
  /**
   * Draws an ellipse on the canvas context with effects
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration with effects
   * @throws Error when radiusX or radiusY is not specified or drawing fails
   */
  static draw(ctx: CanvasRenderingContext2D, options: DrawConfig): void {
    const { x, y, radiusX, radiusY } = options
    DrawingUtils.validateRequiredProps(
      options,
      ['x', 'y', 'radiusX', 'radiusY'],
      'Ellipse'
    )
    const safeRadiusX = radiusX!
    const safeRadiusY = radiusY!
    DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.ellipse(x, y, safeRadiusX, safeRadiusY, 0, 0, 2 * Math.PI)
    })
  }
}
