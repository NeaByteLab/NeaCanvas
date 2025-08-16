import { ErrorCanvas } from '@constants/index'
import { NeaLayout } from '@framework/NeaLayout'
import { NeaRender } from '@framework/NeaRender'
import { NeaExport } from '@framework/NeaExport'
import { ToolRegistry } from '@tools/Registry'
import type {
  CanvasConfig,
  LayoutConfig,
  ExportConfig
} from '@interfaces/index'

/**
 * Main canvas class that coordinates layouts, rendering, and export operations
 * Manages layout creation, validation, and provides unified access to rendering and export
 */
export class NeaCanvas {
  private layouts: Map<string, NeaLayout> = new Map()
  private config: CanvasConfig
  private renderer: NeaRender
  private exporter: NeaExport
  private isInitialized: boolean = false

  /**
   * Creates a new canvas instance
   * @param config - Canvas configuration parameters
   * @throws Error if configuration is invalid
   */
  private constructor(config: CanvasConfig) {
    this.config = config
    this.exporter = new NeaExport(
      config.width,
      config.height,
      config.backgroundColor || 'transparent'
    )
    this.renderer = new NeaRender(
      config.width,
      config.height,
      config.backgroundColor || 'transparent'
    )
    this.isInitialized = true
  }

  /**
   * Creates a new NeaCanvas instance
   * @param config - Canvas configuration parameters
   * @returns New NeaCanvas instance
   */
  static init(config: CanvasConfig): NeaCanvas {
    ToolRegistry.initialize()
    return new NeaCanvas(config)
  }

  /**
   * Creates a new layout within the canvas
   * @param name - Layout identifier
   * @param config - Layout configuration parameters
   * @returns New layout instance
   * @throws Error if canvas not initialized, layout already exists, or validation fails
   */
  async create(name: string, config: LayoutConfig): Promise<NeaLayout> {
    if (!this.isInitialized) {
      throw new Error(ErrorCanvas.CANVAS_NOT_INITIALIZED)
    }
    if (this.layouts.has(name)) {
      throw new Error(ErrorCanvas.LAYOUT_ALREADY_EXISTS(name))
    }
    this.validateLayoutBounds(config)
    this.validateLayoutOverlap(name, config)
    const layout = await NeaLayout.create(config)
    this.layouts.set(name, layout)
    return layout
  }

  /**
   * Validates that layout stays within canvas boundaries
   * @param config - Layout configuration to validate
   * @throws Error if layout extends beyond canvas bounds
   */
  private validateLayoutBounds(config: LayoutConfig): void {
    const { x = 0, y = 0, width, height } = config
    if (x < 0 || y < 0) {
      throw new Error(ErrorCanvas.LAYOUT_POSITION_INVALID(x, y))
    }
    if (x + width > this.config.width || y + height > this.config.height) {
      throw new Error(
        ErrorCanvas.LAYOUT_OUT_OF_BOUNDS(
          x,
          y,
          width,
          height,
          this.config.width,
          this.config.height
        )
      )
    }
  }

  /**
   * Validates that new layout doesn't overlap with existing layouts
   * @param name - New layout identifier
   * @param config - Layout configuration to validate
   * @throws Error if layout overlaps with existing layouts
   */
  private validateLayoutOverlap(name: string, config: LayoutConfig): void {
    const { x = 0, y = 0, width, height } = config
    const newLayout = { x, y, width, height }
    for (const [existingName, existingLayout] of this.layouts) {
      const existingConfig = existingLayout.getConfig()
      const existing = {
        x: existingConfig.x || 0,
        y: existingConfig.y || 0,
        width: existingConfig.width,
        height: existingConfig.height
      }
      if (this.layoutsOverlap(newLayout, existing)) {
        throw new Error(ErrorCanvas.LAYOUT_OVERLAP(name, existingName))
      }
    }
  }

  /**
   * Checks if two layouts overlap
   * @param layout1 - First layout bounds with x, y, width, height
   * @param layout2 - Second layout bounds with x, y, width, height
   * @returns True if layouts overlap
   */
  private layoutsOverlap(
    layout1: { x: number; y: number; width: number; height: number },
    layout2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return !(
      layout1.x + layout1.width <= layout2.x ||
      layout2.x + layout2.width <= layout1.x ||
      layout1.y + layout1.height <= layout2.y ||
      layout2.y + layout2.height <= layout1.y
    )
  }

  /**
   * Exports layouts in the specified format
   * @param options - Export configuration
   * @returns Promise resolving to exported data as Buffer or Blob
   * @throws Error if export operation fails
   */
  async export(options: ExportConfig): Promise<Buffer | Blob> {
    return this.exporter.export(options, this.layouts)
  }

  /**
   * Renders the canvas in browser environment
   * @throws Error if renderer is not properly initialized
   * @returns void
   */
  render(): void {
    this.renderer.render(this.layouts)
  }

  /**
   * Gets all layouts in the canvas
   * @returns Map of layout names to layout instances
   */
  getLayouts(): Map<string, NeaLayout> {
    return new Map(this.layouts)
  }
}
