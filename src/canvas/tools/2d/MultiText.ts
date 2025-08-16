import type { DrawConfig } from '@interfaces/index'
import { DrawingUtils } from '@tools/2d/DrawingUtils'

/**
 * Multi-line text drawing tool with universal effects support
 */
export class MultiText {
  /**
   * Draws multi-line text on the canvas context with effects
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration with effects
   * @throws Error when text content is not specified or drawing fails
   */
  static draw(ctx: CanvasRenderingContext2D, options: DrawConfig): void {
    const {
      x,
      y,
      text,
      fontSize,
      fontFamily,
      textAlign,
      textBaseline,
      maxWidth,
      lineHeight
    } = options
    DrawingUtils.validateRequiredProps(options, ['x', 'y', 'text'], 'MultiText')
    const safeText = text!
    DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.font = `${fontSize || 16}px ${fontFamily || 'Arial'}`
      ctx.textAlign = textAlign || 'left'
      ctx.textBaseline = textBaseline || 'alphabetic'
      const lines = MultiText.splitTextIntoLines(ctx, safeText, maxWidth || 200)
      const lineSpacing = lineHeight || fontSize || 16
      lines.forEach((line, index) => {
        const lineY = y + index * lineSpacing
        ctx.fillText(line, x, lineY)
      })
    })
  }

  /**
   * Splits text into lines based on max width
   * @param ctx - Canvas 2D rendering context
   * @param text - Text to split
   * @param maxWidth - Maximum width per line
   * @returns Array of text lines
   */
  private static splitTextIntoLines(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) {
      lines.push(currentLine)
    }
    return lines
  }
}
