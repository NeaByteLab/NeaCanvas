import type { NeaLayout } from '@framework/NeaLayout'
import { ErrorCanvas } from '@constants/index'
import { isBrowser } from '@canvas/Environment'

/**
 * Handles browser rendering by displaying NeaLayout canvases directly
 * No unnecessary canvas creation - just gets and displays existing layouts
 */
export class NeaRender {
  private canvasWidth: number
  private canvasHeight: number
  private canvasBackgroundColor: string | 'transparent'

  /**
   * Creates a new render instance
   * @param canvasWidth - Fixed canvas width from NeaCanvas.init()
   * @param canvasHeight - Fixed canvas height from NeaCanvas.init()
   * @param canvasBackgroundColor - Canvas background color from NeaCanvas.init()
   */
  constructor(
    canvasWidth: number,
    canvasHeight: number,
    canvasBackgroundColor: string = 'transparent'
  ) {
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.canvasBackgroundColor = canvasBackgroundColor
  }

  /**
   * Renders layouts by displaying their canvases directly in browser
   * @param layouts - Map of layouts to render
   * @throws Error if not in browser environment
   * @returns void
   */
  render(layouts: Map<string, NeaLayout>): void {
    if (isBrowser()) {
      layouts.forEach(layout => {
        layout.flush()
        this.createBrowserCompositeCanvas(layout)
      })
      return
    }
    throw new Error(ErrorCanvas.BROWSER_ONLY_RENDERING)
  }

  /**
   * Displays a single layout canvas in the browser
   * @param layout - Layout to display
   * @throws Error if canvas is not initialized
   */
  private createBrowserCompositeCanvas(layout: NeaLayout): void {
    const layoutCanvas = layout.getCanvas()
    if (!layoutCanvas) {
      throw new Error(ErrorCanvas.CANVAS_NOT_INITIALIZED)
    }
    layoutCanvas.style.width = `${this.canvasWidth}px`
    layoutCanvas.style.height = `${this.canvasHeight}px`
    if (this.canvasBackgroundColor !== 'transparent') {
      layoutCanvas.style.backgroundColor = this.canvasBackgroundColor
    }
    document.body.appendChild(layoutCanvas)
  }
}
