import type { DrawConfig } from '@interfaces/index'
import { DrawingUtils } from '@tools/2d/DrawingUtils'

/**
 * Text drawing tool with universal effects support
 */
export class Text {
  /**
   * Draws text on the canvas context with effects
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration with effects
   * @throws Error when text content is not specified or drawing fails
   */
  static draw(ctx: CanvasRenderingContext2D, options: DrawConfig): void {
    const { x, y, text, fontSize, fontFamily, textAlign, textBaseline } =
      options
    DrawingUtils.validateRequiredProps(options, ['x', 'y', 'text'], 'Text')
    const safeText = text!
    DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.font = `${fontSize || 16}px ${fontFamily || 'Arial'}`
      ctx.textAlign = textAlign || 'left'
      ctx.textBaseline = textBaseline || 'alphabetic'
      ctx.fillText(safeText, x, y)
    })
  }
}
