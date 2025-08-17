/**
 * Error messages for export operations
 * Centralizes all export-related error messages for consistent user feedback
 * @internal Framework use only, not exposed to public API
 */
export const ErrorExport = {
  /** Error when PNG blob creation fails */
  PNG_BLOB_FAILED: 'Failed to create PNG blob',
  /** Error when JPEG blob creation fails */
  JPEG_BLOB_FAILED: 'Failed to create JPEG blob',
  /** Error when canvas context cannot be obtained */
  CANVAS_CONTEXT_FAILED: 'Failed to get canvas context',
  /** Error when layout canvas is missing during composition */
  LAYOUT_CANVAS_MISSING_COMPOSITE:
    'Layout canvas is missing - cannot composite',
  /** Error when layout canvas is missing during SVG generation */
  LAYOUT_CANVAS_MISSING_SVG: 'Layout canvas is missing - cannot generate SVG',
  /** Error when SVG content generation fails */
  SVG_GENERATION_FAILED: 'Failed to generate SVG content from layout canvas',
  /** Error when PDF export is attempted in browser environment */
  PDF_BROWSER_NOT_SUPPORTED:
    'PDF export not supported in browser environment. Use Node.js environment or export as PNG/JPEG/SVG instead.',
  /** Error when no layouts exist for export */
  NO_LAYOUTS_CREATED:
    'Cannot export: No layouts created. Use canvas.create() first',
  /** Error when no shapes exist for export */
  NO_SHAPES_DRAWN: 'Cannot export: No shapes drawn. Use layout.draw() first',
  /** Function that generates error for unsupported export format */
  UNSUPPORTED_FORMAT: (format: string) => `Unsupported format: ${format}`,
  /** Error when PDF canvas context cannot be obtained */
  PDF_CANVAS_CONTEXT_FAILED: 'Failed to get PDF canvas context',
  /** Function that generates error for PDF export failures */
  PDF_EXPORT_FAILED: (error: string) => `PDF export failed: ${error}`,
  /** Function that generates error for composite canvas creation failures */
  COMPOSITE_CANVAS_FAILED: (error: string) =>
    `Failed to create composite canvas: ${error}`
} as const
