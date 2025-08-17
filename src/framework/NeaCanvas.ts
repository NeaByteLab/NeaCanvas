import { ErrorCanvas } from '@constants/ErrorCanvas'
import { NeaLayout } from '@framework/NeaLayout'
import { NeaRender } from '@framework/NeaRender'
import { NeaExport } from '@framework/NeaExport'
import { ToolRegistry } from '@tools/Registry'
import { Validator } from '@framework/utils/Validator'
import type {
  CanvasConfig,
  LayoutConfig,
  RenderConfig,
  ExportConfig
} from '@interfaces/index'

/**
 * Central interface for managing layouts, rendering, and exporting canvas content.
 */
export class NeaCanvas {
  private layouts: Map<string, NeaLayout> = new Map()
  private config: CanvasConfig
  private renderer: NeaRender
  private exporter: NeaExport
  private isInitialized: boolean = false

  /**
   * Creates a canvas instance and initializes renderer and exporter components.
   * @param config Canvas configuration containing dimensions and styling options
   * @throws Error if configuration is invalid
   */
  private constructor(config: CanvasConfig) {
    this.config = config
    this.exporter = new NeaExport(
      config.width,
      config.height,
      config.backgroundColor || 'transparent'
    )
    this.renderer = new NeaRender(config.backgroundColor || 'transparent')
    this.isInitialized = true
  }

  /**
   * Creates and validates a new canvas instance with the specified configuration.
   * @param config Canvas configuration containing dimensions and styling parameters
   * @returns Fully initialized NeaCanvas instance
   * @throws Error if canvas dimensions exceed maximum size
   */
  static init(config: CanvasConfig): NeaCanvas {
    Validator.validateCanvasSize(config.width, config.height)
    ToolRegistry.initialize()
    return new NeaCanvas(config)
  }

  /**
   * Creates a new layout with the specified name and configuration, then adds it to the canvas.
   * @param name Unique identifier for the layout
   * @param config Layout configuration containing dimensions, position, and styling
   * @returns Promise resolving to the created layout instance
   * @throws Error if canvas is not initialized, layout already exists, or validation fails
   */
  async create(name: string, config: LayoutConfig): Promise<NeaLayout> {
    if (!this.isInitialized) {
      throw new Error(ErrorCanvas.CANVAS_NOT_INITIALIZED)
    }
    if (this.layouts.has(name)) {
      throw new Error(ErrorCanvas.LAYOUT_ALREADY_EXISTS(name))
    }
    Validator.validateLayoutBounds(
      name,
      config,
      this.config.width,
      this.config.height
    )
    Validator.validateLayoutOverlap(name, config, this.layouts)
    const layout = await NeaLayout.create(config, name)
    this.layouts.set(name, layout)
    return layout
  }

  /**
   * Exports all layouts in the specified format.
   * @param options Export configuration
   * @returns Promise resolving to exported data as Buffer or Blob
   * @throws Error if export operation fails
   */
  async export(options: ExportConfig): Promise<Buffer | Blob> {
    return this.exporter.export(options, this.layouts)
  }

  /**
   * Renders all layouts in a browser environment.
   * @param options Render configuration
   * @throws Error if renderer is not properly initialized or browser environment is not available
   */
  render(options: RenderConfig): void {
    this.renderer.render(options, this.layouts)
  }

  /**
   * Returns a copy of all layouts in the canvas.
   * @returns Map of layout names to layout instances
   */
  getLayouts(): Map<string, NeaLayout> {
    return new Map(this.layouts)
  }
}
