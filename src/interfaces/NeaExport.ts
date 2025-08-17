/**
 * Interfaces for NeaExport system
 * Handles export operations, canvas types, and export results
 * @internal Framework use only, not exposed to public API
 */

/** Canvas type union for cross-environment compatibility */
export type UniversalCanvas = HTMLCanvasElement | NodeCanvas
export type UniversalCanvasContext = CanvasRenderingContext2D

/** Node.js canvas type for type safety */
export interface NodeCanvas extends HTMLCanvasElement {
  /**
   * Converts canvas to buffer with specified MIME type and quality
   * @param mimeType MIME type for the output format
   * @param options Quality options for the output
   * @returns Buffer containing the canvas data
   */
  toBuffer(mimeType: string, options?: { quality?: number }): Buffer

  /**
   * Creates a PDF stream from the canvas
   * @returns ReadableStream for PDF data
   */
  createPDFStream(): ReadableStream
}

/** Export result types for different environments */
export type ExportResult = Buffer | Blob

/** Canvas context types for rendering operations */
export type CanvasContext = CanvasRenderingContext2D | Record<string, unknown>

/** Layout composition data for export operations */
export interface LayoutCompositionData {
  /** Canvas element to compose */
  canvas: UniversalCanvas
  /** Layout configuration */
  config: {
    /** X position offset */
    x: number
    /** Y position offset */
    y: number
    /** Layout width */
    width: number
    /** Layout height */
    height: number
    /** Optional background color */
    backgroundColor?: string
  }
  /** Map of shapes in the layout */
  shapes: Map<
    string,
    {
      /** Shape type identifier */
      type: string
      /** Shape drawing options */
      options: Record<string, unknown>
    }
  >
}

/** Export operation metadata for tracking */
export interface ExportOperation {
  /** Export format type */
  format: 'png' | 'jpeg' | 'jpg' | 'svg' | 'pdf'
  /** Export quality setting (0.0 to 1.0) */
  quality?: number
  /** Operation timestamp */
  timestamp: number
  /** Number of layouts exported */
  layoutCount: number
  /** Total number of shapes exported */
  totalShapes: number
}

/** Export operation statistics */
export interface ExportStats {
  /** Total number of export operations */
  totalExports: number
  /** Number of successful exports */
  successfulExports: number
  /** Number of failed exports */
  failedExports: number
  /** Average export time in milliseconds */
  averageExportTime: number
  /** Usage count by format */
  formatUsage: Record<string, number>
}

/** Canvas creation options for export operations */
export interface CanvasCreationOptions {
  /** Canvas width in pixels */
  width: number
  /** Canvas height in pixels */
  height: number
  /** Canvas type for specific export formats */
  type?: '2d' | 'pdf'
  /** Quality setting for canvas creation */
  quality?: 'fast' | 'good' | 'best'
}

/** Export validation result with error details */
export interface ExportValidationResult {
  /** Whether the export configuration is valid */
  isValid: boolean
  /** List of validation errors */
  errors: string[]
  /** List of validation warnings */
  warnings: string[]
  /** Number of layouts to export */
  layoutCount: number
  /** Number of shapes to export */
  shapeCount: number
}

/** SVG generation configuration options */
export interface SVGGenerationOptions {
  /** Include background colors in SVG */
  includeBackgrounds: boolean
  /** Include shape elements in SVG */
  includeShapes: boolean
  /** Reduce SVG path size */
  reducePathSize: boolean
  /** Preserve aspect ratio in SVG */
  preserveAspectRatio: boolean
}

/** PDF generation configuration options */
export interface PDFGenerationOptions {
  /** PDF page size */
  pageSize: 'A4' | 'Letter' | 'Custom'
  /** PDF page orientation */
  orientation: 'portrait' | 'landscape'
  /** Page margins in points */
  margins: {
    /** Top margin */
    top: number
    /** Right margin */
    right: number
    /** Bottom margin */
    bottom: number
    /** Left margin */
    left: number
  }
  /** Enable PDF compression */
  compression: boolean
}

/** Image export configuration options */
export interface ImageExportOptions {
  /** Image quality (0.0 to 1.0) */
  quality: number
  /** Compression level for image export */
  compression: 'none' | 'fast' | 'good' | 'best'
  /** Image format for export */
  format: 'png' | 'jpeg' | 'jpg'
  /** Include metadata in exported image */
  metadata: boolean
}

/** Export progress callback function type */
export type ExportProgressCallback = (
  /** Progress percentage (0.0 to 1.0) */
  progress: number,
  /** Current step description */
  currentStep: string,
  /** Total number of steps */
  totalSteps: number
) => void

/** Export error information and details */
export interface ExportError {
  /** Error code identifier */
  code: string
  /** Error message */
  message: string
  /** Additional error details */
  details?: string
  /** Error timestamp */
  timestamp: number
  /** Export operation that failed */
  operation: ExportOperation
  /** Whether the error is recoverable */
  recoverable: boolean
}

/** Export configuration with additional options */
export interface ExtendedExportConfig {
  /** Export format type */
  format: 'png' | 'jpeg' | 'jpg' | 'svg' | 'pdf'
  /** Export quality setting (0.0 to 1.0) */
  quality?: number
  /** Progress callback function */
  progressCallback?: ExportProgressCallback
  /** Number of retry attempts */
  retryAttempts?: number
  /** Export timeout in milliseconds */
  timeout?: number
  /** Additional metadata for export */
  metadata?: Record<string, unknown>
}

/** Canvas pool for managing export canvas instances */
export interface ExportCanvasPool {
  /** Get a canvas from the pool */
  getCanvas(options: CanvasCreationOptions): Promise<UniversalCanvas>
  /** Return a canvas to the pool */
  returnCanvas(canvas: UniversalCanvas): void
  /** Clear all canvases from the pool */
  clearPool(): void
  /** Get pool usage statistics */
  getPoolStats(): {
    /** Number of available canvases */
    available: number
    /** Number of canvases in use */
    inUse: number
    /** Total number of canvases */
    total: number
  }
}

/** Export result with additional metadata */
export interface ExportResultWithMetadata {
  /** Export data (Buffer or Blob) */
  data: ExportResult
  /** Export format type */
  format: string
  /** Export file size in bytes */
  size: number
  /** Export timestamp */
  timestamp: number
  /** Export metadata information */
  metadata: {
    /** Number of layouts exported */
    layoutCount: number
    /** Number of shapes exported */
    shapeCount: number
    /** Export time in milliseconds */
    exportTime: number
    /** Export quality setting used */
    quality: number
  }
}
