import { ErrorCanvas } from '@constants/ErrorCanvas'
import { NeaLayout } from '@framework/NeaLayout'
import { NeaRender } from '@framework/NeaRender'
import { NeaExport } from '@framework/NeaExport'
import { ToolRegistry } from '@tools/Registry'
import { Validator } from '@framework/utils/Validator'
import type {
  CanvasConfig,
  LayoutConfig,
  ExportConfig
} from '@interfaces/index'

/**
 * Central interface for managing layouts, rendering, and exporting canvas content.
 * Handles layout creation, validation, and provides access to rendering and export features.
 */
export class NeaCanvas {
  private layouts: Map<string, NeaLayout> = new Map()
  private config: CanvasConfig
  private renderer: NeaRender
  private exporter: NeaExport
  private isInitialized: boolean = false

  /**
   * Constructs a new NeaCanvas instance with the provided configuration.
   * @param config Canvas configuration parameters
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
   * Initializes a new NeaCanvas instance.
   * @param config Canvas configuration parameters
   * @returns Instance of NeaCanvas
   * @throws Error if canvas dimensions exceed maximum size
   */
  static init(config: CanvasConfig): NeaCanvas {
    Validator.validateCanvasSize(config.width, config.height)
    ToolRegistry.initialize()
    return new NeaCanvas(config)
  }

  /**
   * Creates a new layout and adds it to the canvas.
   * @param name Layout identifier
   * @param config Layout configuration parameters
   * @returns The created layout instance
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
   * @throws Error if renderer is not properly initialized
   */
  render(): void {
    this.renderer.render(this.layouts)
  }

  /**
   * Returns a copy of all layouts in the canvas.
   * @returns Map of layout names to layout instances
   */
  getLayouts(): Map<string, NeaLayout> {
    return new Map(this.layouts)
  }
}
