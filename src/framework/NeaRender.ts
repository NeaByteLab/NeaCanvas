import type { NeaLayout } from '@framework/NeaLayout'
import type { RenderConfig } from '@interfaces/index'
import { ErrorCanvas } from '@constants/ErrorCanvas'
import { isBrowser } from '@canvas/Environment'

/**
 * Provides rendering for layouts in a browser environment
 */
export class NeaRender {
  private canvasWidth: number
  private canvasHeight: number
  private canvasBackgroundColor: string | 'transparent'

  /**
   * Creates a new render instance with specified canvas dimensions and styling
   * @param canvasWidth Canvas width in pixels for display sizing
   * @param canvasHeight Canvas height in pixels for display sizing
   * @param canvasBackgroundColor Background color for the canvas or 'transparent'
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
   * Renders all layouts by displaying their canvases in the browser
   * @param options Render configuration
   * @param layouts Map of layouts to render
   * @throws Error if not in browser environment
   */
  render(options: RenderConfig, layouts: Map<string, NeaLayout>): void {
    if (isBrowser()) {
      layouts.forEach(layout => {
        this.createBrowserCompositeCanvas(layout)
        if (options.interactive) {
          layout.enableInteractive()
        }
      })
      return
    }
    throw new Error(ErrorCanvas.BROWSER_ONLY_RENDERING())
  }

  /**
   * Creates and displays a layout canvas element in the browser DOM
   * @param layout Layout instance containing the canvas to display
   * @throws Error if canvas is not initialized
   */
  private createBrowserCompositeCanvas(layout: NeaLayout): void {
    const layoutCanvas = layout.getCanvasForFramework()
    if (!layoutCanvas) {
      throw new Error(ErrorCanvas.CANVAS_NOT_INITIALIZED)
    }
    layoutCanvas.style.position = 'absolute'
    layoutCanvas.style.left = `${layout.getConfig().x || 0}px`
    layoutCanvas.style.top = `${layout.getConfig().y || 0}px`
    layoutCanvas.style.width = `${this.canvasWidth}px`
    layoutCanvas.style.height = `${this.canvasHeight}px`
    if (this.canvasBackgroundColor !== 'transparent') {
      layoutCanvas.style.backgroundColor = this.canvasBackgroundColor
    }
    document.body.appendChild(layoutCanvas)
  }
}
