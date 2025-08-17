import type { NeaLayout } from '@framework/NeaLayout'
import type { RenderConfig } from '@interfaces/index'
import { ErrorCanvas } from '@constants/ErrorCanvas'
import { isBrowser } from '@canvas/Environment'

/**
 * Manages the display of layout canvases in web browsers.
 * Creates and positions canvas elements in the DOM.
 */
export class NeaRender {
  /** Background color for rendered canvas elements */
  private canvasBackgroundColor: string | 'transparent'

  /**
   * Initializes a new render instance.
   * @param canvasBackgroundColor Background color for canvas elements, defaults to transparent
   */
  constructor(canvasBackgroundColor: string = 'transparent') {
    this.canvasBackgroundColor = canvasBackgroundColor
  }

  /**
   * Displays all layouts by rendering their canvases in the browser.
   * @param options Configuration for rendering behavior
   * @param layouts Collection of layouts to display
   * @throws Error when not running in a browser environment
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
   * Creates and positions a layout canvas element in the browser DOM.
   * @param layout Layout containing the canvas to display
   * @throws Error when the canvas has not been initialized
   */
  private createBrowserCompositeCanvas(layout: NeaLayout): void {
    const layoutCanvas = layout.getCanvasForFramework()
    if (!layoutCanvas) {
      throw new Error(ErrorCanvas.CANVAS_NOT_INITIALIZED)
    }
    const layoutConfig = layout.getConfig()
    layoutCanvas.style.zIndex = '1'
    layoutCanvas.style.display = 'block'
    layoutCanvas.style.position = 'relative'
    layoutCanvas.style.visibility = 'visible'
    layoutCanvas.style.pointerEvents = 'auto'
    layoutCanvas.style.left = `${layoutConfig.x || 0}px`
    layoutCanvas.style.top = `${layoutConfig.y || 0}px`
    layoutCanvas.style.width = `${layoutConfig.width}px`
    layoutCanvas.style.height = `${layoutConfig.height}px`
    layoutCanvas.setAttribute('data-layout', 'layout')
    if (this.canvasBackgroundColor !== 'transparent') {
      layoutCanvas.style.backgroundColor = this.canvasBackgroundColor
    }
    document.body.appendChild(layoutCanvas)
  }
}
