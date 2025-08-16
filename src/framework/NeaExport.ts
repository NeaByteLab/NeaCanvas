import type {
  UniversalCanvas,
  NodeCanvas,
  DrawConfig,
  ExportConfig
} from '@interfaces/index'
import type { NeaLayout } from '@framework/NeaLayout'
import { Default, MimeType, ErrorExport } from '@constants/index'
import { isNode } from '@canvas/Environment'

/**
 * Handles export operations for canvas layouts in various formats
 * Supports PNG, JPEG, SVG, and PDF export with quality control
 */
export class NeaExport {
  private canvasWidth: number
  private canvasHeight: number
  private canvasBackgroundColor: string | 'transparent'

  /**
   * Creates a new export instance
   * @param canvasWidth - Fixed canvas width from NeaCanvas.init()
   * @param canvasHeight - Fixed canvas height from NeaCanvas.init()
   * @param canvasBackgroundColor - Canvas background color from NeaCanvas.init()
   * @throws Error if configuration parameters are invalid
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
   * Exports layouts in the specified format
   * @param options - Export configuration
   * @param layouts - Map of layouts to export
   * @returns Promise resolving to exported data as Buffer or Blob
   * @throws Error if no layouts exist, no shapes drawn, or unsupported format
   */
  async export(
    options: ExportConfig,
    layouts: Map<string, NeaLayout>
  ): Promise<Buffer | Blob> {
    if (!layouts || layouts.size === 0) {
      throw new Error(ErrorExport.NO_LAYOUTS_CREATED)
    }
    let hasShapes = false
    for (const layout of layouts.values()) {
      layout.flush()
      if (layout.getShapes().size > 0) {
        hasShapes = true
        break
      }
    }
    if (!hasShapes) {
      throw new Error(ErrorExport.NO_SHAPES_DRAWN)
    }
    switch (options.format) {
      case 'png':
        return this.exportPNG(options, layouts)
      case 'jpeg':
      case 'jpg':
        return this.exportJPEG(options, layouts)
      case 'svg':
        return this.exportSVG(options, layouts)
      case 'pdf':
        return this.exportPDF(options, layouts)
      default:
        throw new Error(ErrorExport.UNSUPPORTED_FORMAT(options.format))
    }
  }

  /**
   * Exports layouts as PNG image
   * @param options - Export configuration with quality
   * @param layouts - Map of layouts to export
   * @returns Promise resolving to PNG data as Buffer or Blob
   * @throws Error if PNG export fails or blob creation fails
   */
  private async exportPNG(
    options: ExportConfig,
    layouts: Map<string, NeaLayout>
  ): Promise<Buffer | Blob> {
    const quality = options.quality || Default.EXPORT_QUALITY
    if (isNode()) {
      const canvas = await this.createCompositeCanvas(layouts)
      return (canvas as NodeCanvas).toBuffer(MimeType.PNG, { quality })
    } else {
      const canvas = await this.createCompositeCanvas(layouts)
      return new Promise(resolve => {
        canvas.toBlob(
          (blob: Blob | null) => {
            if (blob) {
              resolve(blob)
            } else {
              throw new Error(ErrorExport.PNG_BLOB_FAILED)
            }
          },
          MimeType.PNG,
          quality
        )
      })
    }
  }

  /**
   * Exports layouts as JPEG image
   * @param options - Export configuration with quality
   * @param layouts - Map of layouts to export
   * @returns Promise resolving to JPEG data as Buffer or Blob
   * @throws Error if JPEG export fails or blob creation fails
   */
  private async exportJPEG(
    options: ExportConfig,
    layouts: Map<string, NeaLayout>
  ): Promise<Buffer | Blob> {
    const quality = options.quality || Default.EXPORT_QUALITY
    if (isNode()) {
      const canvas = await this.createCompositeCanvas(layouts)
      return (canvas as NodeCanvas).toBuffer(MimeType.JPEG, { quality })
    } else {
      const canvas = await this.createCompositeCanvas(layouts)
      return new Promise(resolve => {
        canvas.toBlob(
          (blob: Blob | null) => {
            if (blob) {
              resolve(blob)
            } else {
              throw new Error(ErrorExport.JPEG_BLOB_FAILED)
            }
          },
          MimeType.JPEG,
          quality
        )
      })
    }
  }

  /**
   * Exports layouts as SVG format
   * @param _options - Export configuration (currently unused)
   * @param layouts - Map of layouts to export
   * @returns Promise resolving to SVG data as Buffer or Blob
   * @throws Error if SVG content creation fails
   */
  private async exportSVG(
    _options: ExportConfig,
    layouts: Map<string, NeaLayout>
  ): Promise<Buffer | Blob> {
    const svgContent = this.createSVGContent(layouts)
    if (isNode()) {
      return Buffer.from(svgContent, 'utf8')
    } else {
      return new Blob([svgContent], { type: MimeType.SVG })
    }
  }

  /**
   * Exports layouts as PDF format
   * @param _options - Export configuration (currently unused)
   * @param layouts - Map of layouts to export
   * @returns Promise resolving to PDF data as Buffer or Blob
   * @throws Error if PDF export fails or browser environment not supported
   */
  private async exportPDF(
    _options: ExportConfig,
    layouts: Map<string, NeaLayout>
  ): Promise<Buffer | Blob> {
    if (isNode()) {
      try {
        const { createCanvas } = await import('canvas')
        const pdfCanvas = createCanvas(
          this.canvasWidth,
          this.canvasHeight,
          'pdf'
        )
        const pdfCtx = pdfCanvas.getContext('2d')
        if (!pdfCtx) {
          throw new Error(ErrorExport.PDF_CANVAS_CONTEXT_FAILED)
        }
        for (const layout of layouts.values()) {
          const layoutCanvas = layout.getCanvas()
          if (!layoutCanvas) {
            throw new Error(ErrorExport.LAYOUT_CANVAS_MISSING_COMPOSITE)
          }
          const config = layout.getConfig()
          pdfCtx.drawImage(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            layoutCanvas as any,
            config.x || Default.LAYOUT_X,
            config.y || Default.LAYOUT_Y
          )
        }
        return pdfCanvas.toBuffer(MimeType.PDF)
      } catch (error) {
        throw new Error(ErrorExport.PDF_EXPORT_FAILED(String(error)))
      }
    } else {
      throw new Error(ErrorExport.PDF_BROWSER_NOT_SUPPORTED)
    }
  }

  /**
   * Creates a composite canvas from all layouts
   * @param layouts - Map of layouts to composite
   * @returns Canvas element with all layouts composited
   * @throws Error if composite canvas creation fails
   */
  private async createCompositeCanvas(
    layouts: Map<string, NeaLayout>
  ): Promise<UniversalCanvas> {
    if (isNode()) {
      return this.createNodeCompositeCanvas(layouts)
    } else {
      return this.createBrowserCompositeCanvas(layouts)
    }
  }

  /**
   * Creates composite canvas for Node.js environment
   * @param layouts - Map of layouts to composite
   * @returns Node.js canvas with all layouts composited
   * @throws Error if canvas creation fails or context is unavailable
   */
  private async createNodeCompositeCanvas(
    layouts: Map<string, NeaLayout>
  ): Promise<NodeCanvas> {
    try {
      const { createCanvas } = await import('canvas')
      const canvas = createCanvas(this.canvasWidth, this.canvasHeight)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error(ErrorExport.CANVAS_CONTEXT_FAILED)
      }
      if (
        this.canvasBackgroundColor &&
        this.canvasBackgroundColor !== 'transparent'
      ) {
        ctx.fillStyle = this.canvasBackgroundColor
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
      }
      this.drawLayoutsToContext(ctx, layouts)
      return canvas as unknown as NodeCanvas
    } catch (error) {
      throw new Error(ErrorExport.COMPOSITE_CANVAS_FAILED(String(error)))
    }
  }

  /**
   * Creates composite canvas for browser environment
   * @param layouts - Map of layouts to composite
   * @returns HTML canvas with all layouts composited
   * @throws Error if canvas context is unavailable
   */
  private createBrowserCompositeCanvas(
    layouts: Map<string, NeaLayout>
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = this.canvasWidth
    canvas.height = this.canvasHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error(ErrorExport.CANVAS_CONTEXT_FAILED)
    }
    if (
      this.canvasBackgroundColor &&
      this.canvasBackgroundColor !== 'transparent'
    ) {
      ctx.fillStyle = this.canvasBackgroundColor
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
    }
    this.drawLayoutsToContext(ctx, layouts)
    return canvas
  }

  /**
   * Draws all layouts to the given context
   * @param ctx - Canvas 2D context to draw on
   * @param layouts - Map of layouts to draw
   * @throws Error if layout canvas is missing during composition
   */
  private drawLayoutsToContext(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx: any,
    layouts: Map<string, NeaLayout>
  ): void {
    for (const layout of layouts.values()) {
      const layoutCanvas = layout.getCanvas()
      if (!layoutCanvas) {
        throw new Error(ErrorExport.LAYOUT_CANVAS_MISSING_COMPOSITE)
      }
      const config = layout.getConfig()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx.drawImage(layoutCanvas as any, config.x || 0, config.y || 0)
    }
  }

  /**
   * Creates SVG content from layouts
   * @param layouts - Map of layouts to convert
   * @returns SVG string content with all shapes and backgrounds
   * @throws Error if SVG generation fails
   */
  private createSVGContent(layouts: Map<string, NeaLayout>): string {
    const width = this.canvasWidth
    const height = this.canvasHeight
    let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
    for (const layout of layouts.values()) {
      const config = layout.getConfig()
      const shapes = layout.getShapes()
      svgContent += `<g transform="translate(${config.x || Default.LAYOUT_X}, ${config.y || Default.LAYOUT_Y})">`
      if (config.backgroundColor && config.backgroundColor !== 'transparent') {
        svgContent += `<rect x="0" y="0" width="${config.width}" height="${config.height}" fill="${config.backgroundColor}"/>`
      }
      for (const [, shapeData] of shapes) {
        const { type, options } = shapeData
        svgContent += this.shapeToSVG(type, options)
      }
      svgContent += '</g>'
    }
    svgContent += '</svg>'
    return svgContent
  }

  /**
   * Converts a shape to SVG element string
   * @param type - Shape type identifier
   * @param options - Shape drawing configuration
   * @returns SVG element string representation
   * @throws Error if shape conversion fails
   */
  private shapeToSVG(type: string, options: DrawConfig): string {
    const fill =
      options.fill === 'none' ? 'none' : options.fill || 'transparent'
    const stroke = options.stroke || 'black'
    const strokeWidth = options.strokeWidth || 1
    switch (type) {
      case 'rectangle':
        return `<rect x="${options.x}" y="${options.y}" width="${options.width || 0}" height="${options.height || 0}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
      case 'circle':
        return `<circle cx="${options.x}" cy="${options.y}" r="${options.radius || 0}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
      case 'triangle': {
        const x1 = options.x
        const y1 = options.y + (options.height || 0)
        const x2 = options.x + (options.width || 0) / 2
        const y2 = options.y
        const x3 = options.x + (options.width || 0)
        const y3 = options.y + (options.height || 0)
        return `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
      }
      case 'ellipse':
        return `<ellipse cx="${options.x}" cy="${options.y}" rx="${options.radiusX || 0}" ry="${options.radiusY || 0}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
      case 'line':
        return `<line x1="${options.x}" y1="${options.y}" x2="${options.endX || 0}" y2="${options.endY || 0}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
      case 'text':
        return `<text x="${options.x}" y="${options.y}" font-family="${options.fontFamily || 'Arial'}" font-size="${options.fontSize || Default.DEFAULT_FONT_SIZE}" fill="${fill}" text-anchor="middle">${options.text || ''}</text>`
      case 'multitext':
        return `<text x="${options.x}" y="${options.y}" font-family="${options.fontFamily || 'Arial'}" font-size="${options.fontSize || Default.DEFAULT_FONT_SIZE}" fill="${fill}" text-anchor="middle">${options.text || ''}</text>`
      case 'point':
        return `<circle cx="${options.x}" cy="${options.y}" r="${Default.POINT_RADIUS}" fill="${fill}" stroke="none"/>`
      case 'semicircle':
        return `<path d="M ${options.x},${options.y + (options.radius || 0)} A ${options.radius || 0},${options.radius || 0} 0 0,1 ${options.x + (options.radius || 0)},${options.y}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
      case 'oval':
        return `<ellipse cx="${options.x + (options.width || 0) / 2}" cy="${options.y + (options.height || 0) / 2}" rx="${(options.width || 0) / 2}" ry="${(options.height || 0) / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
      case 'pentagon':
      case 'hexagon':
      case 'heptagon':
      case 'octagon':
      case 'nonagon':
      case 'decagon':
      case 'hendecagon':
      case 'dodecagon':
      case 'tridecagon':
      case 'tetradecagon':
      case 'pentadecagon':
      case 'hexadecagon':
      case 'heptadecagon':
      case 'octadecagon':
      case 'enneadecagon':
      case 'icosagon':
        return this.createPolygonSVG(type, options, fill, stroke, strokeWidth)
      case 'polygon21':
      case 'polygon22':
      case 'polygon23':
      case 'polygon24':
      case 'polygon25':
      case 'polygon26':
      case 'polygon27':
      case 'polygon28':
      case 'polygon29':
      case 'polygon31':
      case 'polygon32':
      case 'polygon33':
      case 'polygon34':
      case 'polygon35':
      case 'polygon36':
      case 'polygon37':
      case 'polygon38':
      case 'polygon39':
      case 'polygon41':
      case 'polygon42':
      case 'polygon43':
      case 'polygon44':
      case 'polygon45':
      case 'polygon46':
      case 'polygon47':
      case 'polygon48':
      case 'polygon49':
      case 'polygon51':
      case 'polygon52':
      case 'polygon53':
      case 'polygon54':
      case 'polygon55':
      case 'polygon56':
      case 'polygon57':
      case 'polygon58':
      case 'polygon59':
      case 'polygon61':
      case 'polygon62':
      case 'polygon63':
      case 'polygon64':
      case 'polygon65':
      case 'polygon66':
      case 'polygon67':
      case 'polygon68':
      case 'polygon69':
      case 'polygon71':
      case 'polygon72':
      case 'polygon73':
      case 'polygon74':
      case 'polygon75':
      case 'polygon76':
      case 'polygon77':
      case 'polygon78':
      case 'polygon79':
      case 'polygon81':
      case 'polygon82':
      case 'polygon83':
      case 'polygon84':
      case 'polygon85':
      case 'polygon86':
      case 'polygon87':
      case 'polygon88':
      case 'polygon89':
      case 'polygon91':
      case 'polygon92':
      case 'polygon93':
      case 'polygon94':
      case 'polygon95':
      case 'polygon96':
      case 'polygon97':
      case 'polygon98':
      case 'polygon99':
        return this.createPolygonSVG(type, options, fill, stroke, strokeWidth)
      case 'triacontagon':
      case 'tetracontagon':
      case 'pentacontagon':
      case 'hexacontagon':
      case 'heptacontagon':
      case 'octacontagon':
      case 'enneacontagon':
      case 'hectogon':
        return this.createPolygonSVG(type, options, fill, stroke, strokeWidth)
      case 'pentagram':
      case 'hexagram':
      case 'heptagram':
      case 'octagram':
      case 'nonagram':
      case 'decagram':
      case 'hendecagram':
      case 'dodecagram':
        return this.createStarSVG(type, options, fill, stroke, strokeWidth)
      case 'parabola':
      case 'hyperbola':
      case 'cardioid':
      case 'lemniscate':
      case 'spiral':
        return this.createCurvedSVG(type, options, fill, stroke, strokeWidth)
      case 'annulus':
      case 'sector':
      case 'segment':
      case 'crescent':
      case 'lens':
      case 'lune':
      case 'reuleauxTriangle':
      case 'salinon':
      case 'tomahawk':
      case 'trefoil':
        return this.createSpecializedSVG(
          type,
          options,
          fill,
          stroke,
          strokeWidth
        )
      case 'heart':
      case 'diamond':
      case 'roundedRect':
      case 'cross':
      case 'plus':
      case 'arrow':
      case 'gear':
      case 'infinity':
      case 'parallelogram':
      case 'trapezium':
      case 'kite':
      case 'cloud':
      case 'flower':
        return this.createGeometricSVG(type, options, fill, stroke, strokeWidth)
      case 'dottedLine':
      case 'zigzag':
      case 'checkerboard':
      case 'polkaDots':
        return this.createPatternSVG(type, options, fill, stroke, strokeWidth)
      default:
        return `<rect x="${options.x}" y="${options.y}" width="${options.width || 100}" height="${options.height || 100}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
    }
  }

  /**
   * Creates SVG for polygon shapes with proper point calculation
   * @param type - Polygon type identifier
   * @param options - Drawing configuration
   * @param fill - Fill color
   * @param stroke - Stroke color
   * @param strokeWidth - Stroke width
   * @returns SVG polygon element string
   */
  private createPolygonSVG(
    type: string,
    options: DrawConfig,
    fill: string,
    stroke: string,
    strokeWidth: number
  ): string {
    const sides = this.getPolygonSides(type)
    const centerX = options.x + (options.width || 100) / 2
    const centerY = options.y + (options.height || 100) / 2
    const radius = Math.min(options.width || 100, options.height || 100) / 2
    const points = this.calculatePolygonPoints(centerX, centerY, radius, sides)
    return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
  }

  /**
   * Creates SVG for star shapes
   * @param type - Star type identifier
   * @param options - Drawing configuration
   * @param fill - Fill color
   * @param stroke - Stroke color
   * @param strokeWidth - Stroke width
   * @returns SVG star element string
   */
  private createStarSVG(
    type: string,
    options: DrawConfig,
    fill: string,
    stroke: string,
    strokeWidth: number
  ): string {
    const centerX = options.x + (options.width || 100) / 2
    const centerY = options.y + (options.height || 100) / 2
    const radius = Math.min(options.width || 100, options.height || 100) / 2
    const points = this.calculateStarPoints(centerX, centerY, radius, type)
    return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
  }

  /**
   * Creates SVG for curved shapes
   * @param type - Curved shape type identifier
   * @param options - Drawing configuration
   * @param fill - Fill color
   * @param stroke - Stroke color
   * @param strokeWidth - Stroke width
   * @returns SVG curved shape element string
   */
  private createCurvedSVG(
    type: string,
    options: DrawConfig,
    fill: string,
    stroke: string,
    strokeWidth: number
  ): string {
    const centerX = options.x + (options.width || 100) / 2
    const centerY = options.y + (options.height || 100) / 2
    const radius = Math.min(options.width || 100, options.height || 100) / 2
    switch (type) {
      case 'spiral':
        return `<path d="M ${centerX - radius},${centerY} Q ${centerX},${centerY - radius} ${centerX + radius},${centerY} T ${centerX},${centerY + radius} T ${centerX - radius},${centerY}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
      case 'cardioid':
        return `<path d="M ${centerX},${centerY - radius} Q ${centerX + radius},${centerY} ${centerX},${centerY + radius} Q ${centerX - radius},${centerY} ${centerX},${centerY - radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
      default:
        return `<ellipse cx="${centerX}" cy="${centerY}" rx="${radius}" ry="${radius * 0.6}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
    }
  }

  /**
   * Creates SVG for specialized shapes
   * @param type - Specialized shape type identifier
   * @param options - Drawing configuration
   * @param fill - Fill color
   * @param stroke - Stroke color
   * @param strokeWidth - Stroke width
   * @returns SVG specialized shape element string
   */
  private createSpecializedSVG(
    type: string,
    options: DrawConfig,
    fill: string,
    stroke: string,
    strokeWidth: number
  ): string {
    const centerX = options.x + (options.width || 100) / 2
    const centerY = options.y + (options.height || 100) / 2
    const radius = Math.min(options.width || 100, options.height || 100) / 2
    switch (type) {
      case 'heart':
        return `<path d="M ${centerX},${centerY + radius * 0.3} C ${centerX - radius * 0.5},${centerY - radius * 0.3} ${centerX - radius * 0.5},${centerY - radius * 0.8} ${centerX},${centerY - radius * 0.8} C ${centerX + radius * 0.5},${centerY - radius * 0.8} ${centerX + radius * 0.5},${centerY - radius * 0.3} ${centerX},${centerY + radius * 0.3}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
      case 'diamond': {
        const x1 = centerX,
          y1 = centerY - radius
        const x2 = centerX + radius,
          y2 = centerY
        const x3 = centerX,
          y3 = centerY + radius
        const x4 = centerX - radius,
          y4 = centerY
        return `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
      }
      default:
        return `<ellipse cx="${centerX}" cy="${centerY}" rx="${radius}" ry="${radius * 0.8}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
    }
  }

  /**
   * Creates SVG for geometric shapes
   * @param type - Geometric shape type identifier
   * @param options - Drawing configuration
   * @param fill - Fill color
   * @param stroke - Stroke color
   * @param strokeWidth - Stroke width
   * @returns SVG geometric shape element string
   */
  private createGeometricSVG(
    type: string,
    options: DrawConfig,
    fill: string,
    stroke: string,
    strokeWidth: number
  ): string {
    const centerX = options.x + (options.width || 100) / 2
    const centerY = options.y + (options.height || 100) / 2
    const radius = Math.min(options.width || 100, options.height || 100) / 2
    switch (type) {
      case 'cross': {
        const size = radius * 0.6
        return `<path d="M ${centerX - size},${centerY} L ${centerX + size},${centerY} M ${centerX},${centerY - size} L ${centerX},${centerY + size}" stroke="${stroke}" stroke-width="${strokeWidth * 2}" fill="none"/>`
      }
      case 'plus':
        return `<path d="M ${centerX - radius * 0.3},${centerY} L ${centerX + radius * 0.3},${centerY} M ${centerX},${centerY - radius * 0.3} L ${centerX},${centerY + radius * 0.3}" stroke="${stroke}" stroke-width="${strokeWidth * 2}" fill="none"/>`
      case 'arrow':
        return `<path d="M ${centerX - radius * 0.5},${centerY} L ${centerX + radius * 0.5},${centerY} L ${centerX + radius * 0.3},${centerY - radius * 0.2} M ${centerX + radius * 0.5},${centerY} L ${centerX + radius * 0.3},${centerY + radius * 0.2}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none"/>`
      default:
        return `<rect x="${options.x}" y="${options.y}" width="${options.width || 100}" height="${options.height || 100}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
    }
  }

  /**
   * Creates SVG for pattern shapes
   * @param type - Pattern shape type identifier
   * @param options - Drawing configuration
   * @param fill - Fill color
   * @param stroke - Stroke color
   * @param strokeWidth - Stroke width
   * @returns SVG pattern shape element string
   */
  private createPatternSVG(
    type: string,
    options: DrawConfig,
    fill: string,
    stroke: string,
    strokeWidth: number
  ): string {
    const centerX = options.x + (options.width || 100) / 2
    const centerY = options.y + (options.height || 100) / 2
    const radius = Math.min(options.width || 100, options.height || 100) / 2
    switch (type) {
      case 'dottedLine':
        return `<path d="M ${centerX - radius},${centerY} L ${centerX + radius},${centerY}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="5,5" fill="none"/>`
      case 'zigzag': {
        const points = []
        for (let i = -3; i <= 3; i++) {
          const x = centerX + i * radius * Default.SHAPE_SCALE_SMALL
          const y = centerY + (i % 2 === 0 ? 0 : radius * 0.2)
          points.push(`${x},${y}`)
        }
        return `<polyline points="${points.join(' ')}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none"/>`
      }
      default:
        return `<rect x="${options.x}" y="${options.y}" width="${options.width || 100}" height="${options.height || 100}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
    }
  }

  /**
   * Gets the number of sides for a polygon shape
   * @param type - Polygon type identifier
   * @returns Number of sides for the polygon
   */
  private getPolygonSides(type: string): number {
    const polygonMap: Record<string, number> = {
      pentagon: 5,
      hexagon: 6,
      heptagon: 7,
      octagon: 8,
      nonagon: 9,
      decagon: 10,
      hendecagon: 11,
      dodecagon: 12,
      tridecagon: 13,
      tetradecagon: 14,
      pentadecagon: 15,
      hexadecagon: 16,
      heptadecagon: 17,
      octadecagon: 18,
      enneadecagon: 19,
      icosagon: 20,
      triacontagon: 30,
      tetracontagon: 40,
      pentacontagon: 50,
      hexacontagon: 60,
      heptacontagon: 70,
      octacontagon: 80,
      enneacontagon: 90,
      hectogon: 100
    }
    if (type.startsWith('polygon')) {
      const sides = parseInt(type.replace('polygon', ''))
      return isNaN(sides) ? 6 : sides
    }
    return polygonMap[type] || 6
  }

  /**
   * Calculates polygon points for SVG
   * @param centerX - Center X coordinate
   * @param centerY - Center Y coordinate
   * @param radius - Polygon radius
   * @param sides - Number of polygon sides
   * @returns Space-separated string of polygon points
   */
  private calculatePolygonPoints(
    centerX: number,
    centerY: number,
    radius: number,
    sides: number
  ): string {
    const points: string[] = []
    const angleStep = (2 * Math.PI) / sides
    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      points.push(`${x},${y}`)
    }
    return points.join(' ')
  }

  /**
   * Calculates star points for SVG
   * @param centerX - Center X coordinate
   * @param centerY - Center Y coordinate
   * @param radius - Star radius
   * @param type - Star type identifier
   * @returns Space-separated string of star points
   */
  private calculateStarPoints(
    centerX: number,
    centerY: number,
    radius: number,
    type: string
  ): string {
    const starMap: Record<string, number> = {
      pentagram: 5,
      hexagram: 6,
      heptagram: 7,
      octagram: 8,
      nonagram: 9,
      decagram: 10,
      hendecagram: 11,
      dodecagram: 12
    }
    const points = starMap[type] || 5
    const angleStep = (2 * Math.PI) / points
    const starPoints: string[] = []
    for (let i = 0; i < points * 2; i++) {
      const angle = i * angleStep - Math.PI / 2
      const r = i % 2 === 0 ? radius : radius * Default.STAR_INNER_RATIO
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)
      starPoints.push(`${x},${y}`)
    }
    return starPoints.join(' ')
  }
}
