import type { NeaLayout } from '@framework/NeaLayout'
import { ErrorCanvas } from '@constants/ErrorCanvas'
import { isBrowser } from '@canvas/Environment'

/**
 * Provides rendering for layouts in a browser environment by displaying their canvases directly.
 * Used internally to show layouts without creating new canvases.
 */
export class NeaRender {
  private canvasWidth: number
  private canvasHeight: number
  private canvasBackgroundColor: string | 'transparent'

  /**
   * Constructs a new render instance for the given canvas dimensions and background color.
   * @param canvasWidth Canvas width in pixels
   * @param canvasHeight Canvas height in pixels
   * @param canvasBackgroundColor Background color for the canvas
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
   * Renders all layouts by displaying their canvases in the browser.
   * @param layouts Map of layouts to render
   * @throws Error if not in browser environment
   */
  render(layouts: Map<string, NeaLayout>): void {
    if (isBrowser()) {
      layouts.forEach(layout => {
        this.createBrowserCompositeCanvas(layout)
      })
      return
    }
    throw new Error(ErrorCanvas.BROWSER_ONLY_RENDERING())
  }

  /**
   * Displays a single layout canvas in the browser.
   * @param layout Layout to display
   * @throws Error if canvas is not initialized
   */
  private createBrowserCompositeCanvas(layout: NeaLayout): void {
    const layoutCanvas = layout.getCanvasForFramework()
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
