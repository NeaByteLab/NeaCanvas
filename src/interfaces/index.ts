/**
 * Framework interfaces module
 * Exports all interface definitions for canvas operations, drawing, export, and smart features
 */

// Core configuration interfaces
export * from '@interfaces/NeaOptions'

// Performance and smart optimization interfaces
export * from '@interfaces/NeaSmart'

// Export and canvas type interfaces
export * from '@interfaces/NeaExport'

// Layout management interfaces
export * from '@interfaces/NeaLayout'

// Unified canvas types for cross-environment compatibility
export type {
  UniversalCanvas,
  UniversalCanvasContext
} from '@interfaces/NeaExport'
