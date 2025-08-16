import type { DrawConfig } from '@interfaces/index'
import { DrawingUtils } from '@tools/2d/DrawingUtils'
import { PathUtils } from '@tools/2d/PathUtils'

/**
 * Triangle drawing tool with universal effects support
 */
export class Triangle {
  /**
   * Draws a triangle on the canvas context with effects
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration with effects
   * @throws Error when width or height is not specified or drawing fails
   */
  static draw(ctx: CanvasRenderingContext2D, options: DrawConfig): void {
    const { x, y, width, height } = options
    DrawingUtils.validateRequiredProps(
      options,
      ['x', 'y', 'width', 'height'],
      'Triangle'
    )
    const safeWidth = width!
    const safeHeight = height!
    const centerX = x + safeWidth / 2
    const centerY = y + safeHeight / 2
    const radius = Math.min(safeWidth, safeHeight) / 2
    const points = PathUtils.getPolygonPoints(3, radius, 0, centerX, centerY)
    DrawingUtils.drawPointsWithEffects(ctx, options, points, true)
  }
}
