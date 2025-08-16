import type { DrawConfig } from '@interfaces/index'
import { DrawingUtils } from '@tools/2d/DrawingUtils'

/**
 * Circle drawing tool with universal effects support
 */
export class Circle {
  /**
   * Draws a circle on the canvas context with effects
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration with effects
   * @throws Error when radius is not specified or drawing fails
   */
  static draw(ctx: CanvasRenderingContext2D, options: DrawConfig): void {
    const { x, y, radius } = options
    DrawingUtils.validateRequiredProps(options, ['x', 'y', 'radius'], 'Circle')
    const safeRadius = radius!
    DrawingUtils.drawArcWithEffects(ctx, options, x, y, safeRadius)
  }
}
