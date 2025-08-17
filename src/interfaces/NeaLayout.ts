/**
 * Interfaces for NeaLayout system
 * Handles layout management, canvas operations, and drawing coordination
 * @internal Framework use only, not exposed to public API
 */

import type { LayoutConfig, DrawConfig } from '@interfaces/index'
import type {
  UniversalCanvas,
  UniversalCanvasContext
} from '@interfaces/NeaExport'
import type { DirtyRegion, SmartMetrics } from '@framework/NeaSmart'

/** Cross-environment canvas types for NeaLayout */
export type LayoutCanvas = UniversalCanvas
export type LayoutCanvasContext = UniversalCanvasContext

/**
 * Node.js canvas type for NeaLayout type safety
 * Extends HTMLCanvasElement with Node.js specific methods
 */
export interface LayoutNodeCanvas extends HTMLCanvasElement {
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

/** High DPI canvas dimensions for device pixel ratio support */
export interface HighDPIDimensions {
  /** Actual canvas width in device pixels */
  canvasWidth: number
  /** Actual canvas height in device pixels */
  canvasHeight: number
  /** Scale factor (device pixel ratio) */
  scale: number
}

/** Layout state information for tracking layout status */
export interface LayoutState {
  /** Whether the layout is initialized and ready */
  isInitialized: boolean
  /** Whether the layout has active drawing operations */
  hasActiveOperations: boolean
  /** Current number of shapes in the layout */
  shapeCount: number
  /** Whether the layout has unsaved changes */
  hasUnsavedChanges: boolean
}

/** Shape data structure for storing shape information */
export interface ShapeData {
  /** Shape type identifier */
  type: string
  /** Drawing configuration options */
  options: DrawConfig
  /** Operation ID from NeaSmart for tracking */
  operationId: string
  /** Timestamp when shape was created */
  timestamp: number
  /** Whether shape is visible */
  visible: boolean
}

/**
 * Layout performance metrics extending SmartMetrics
 * Provides layout-specific performance data in addition to base metrics
 */
export interface LayoutPerformanceMetrics extends SmartMetrics {
  /** Layout-specific performance data */
  layout: {
    /** Time to initialize canvas in milliseconds */
    initTime: number
    /** Time to apply quality settings in milliseconds */
    qualitySettingsTime: number
    /** Number of high DPI operations */
    highDPIOperations: number
    /** Canvas context state changes */
    contextStateChanges: number
  }
}

/** Canvas quality settings for rendering optimization */
export interface CanvasQualitySettings {
  /** Anti-aliasing setting */
  antialias: 'default' | 'none' | 'gray' | 'subpixel'
  /** Pattern quality setting */
  patternQuality: 'fast' | 'good' | 'best' | 'nearest' | 'bilinear'
  /** General quality setting */
  quality: 'fast' | 'good' | 'best' | 'nearest' | 'bilinear'
  /** Image smoothing enabled */
  imageSmoothingEnabled: boolean
  /** Image smoothing quality */
  imageSmoothingQuality: 'low' | 'medium' | 'high'
}

/** Layout validation result with error details */
export interface LayoutValidationResult {
  /** Whether the layout configuration is valid */
  isValid: boolean
  /** List of validation errors */
  errors: string[]
  /** List of validation warnings */
  warnings: string[]
  /** Layout bounds validation */
  bounds: {
    /** Whether layout fits within canvas bounds */
    fitsInCanvas: boolean
    /** Whether layout overlaps with other layouts */
    hasOverlaps: boolean
    /** Whether layout has valid dimensions */
    validDimensions: boolean
  }
  /** Layout configuration being validated */
  config: LayoutConfig
}

/** Drawing operation result with success status and metadata */
export interface DrawingOperationResult {
  /** Whether the operation was successful */
  success: boolean
  /** Shape ID if operation succeeded */
  shapeId?: string
  /** Error message if operation failed */
  error?: string
  /** Operation metadata */
  metadata: {
    /** Operation timestamp */
    timestamp: number
    /** Shape type drawn */
    shapeType: string
    /** Coordinates where shape was drawn */
    coordinates: { x: number; y: number }
    /** Operation duration in milliseconds */
    duration: number
  }
  /** Dirty regions affected by this operation */
  dirtyRegions: DirtyRegion[]
}

/** Layout bounds information for positioning and sizing */
export interface LayoutBounds {
  /** Logical width in CSS pixels */
  logicalWidth: number
  /** Logical height in CSS pixels */
  logicalHeight: number
  /** Actual width in device pixels */
  actualWidth: number
  /** Actual height in device pixels */
  actualHeight: number
  /** Device pixel ratio */
  devicePixelRatio: number
  /** X position offset */
  x: number
  /** Y position offset */
  y: number
}

/** Layout drawing context for canvas operations */
export interface LayoutDrawingContext {
  /** Canvas element */
  canvas: LayoutCanvas
  /** Canvas 2D context */
  context: LayoutCanvasContext
  /** Layout bounds information */
  bounds: LayoutBounds
  /** Current drawing state */
  state: {
    /** Current fill style */
    fillStyle: string
    /** Current stroke style */
    strokeStyle: string
    /** Current line width */
    lineWidth: number
    /** Current opacity */
    globalAlpha: number
    /** Current blend mode */
    globalCompositeOperation: string
  }
}

/** Canvas initialization options for layout setup */
export interface CanvasInitOptions {
  /** Whether to enable high DPI support */
  enableHighDPI: boolean
  /** Whether to apply quality settings */
  applyQualitySettings: boolean
  /** Whether to set default drawing properties */
  setDefaultProperties: boolean
  /** Custom canvas creation function */
  customCanvasCreator?: (width: number, height: number) => Promise<LayoutCanvas>
}

/** Layout event types for event handling */
export type LayoutEventType =
  | 'shapeAdded'
  | 'shapeRemoved'
  | 'shapeModified'
  | 'canvasInitialized'
  | 'qualitySettingsApplied'
  | 'dirtyRegionsUpdated'
  | 'operationsFlushed'

/** Layout event data for event handling */
export interface LayoutEventData {
  /** Event type */
  type: LayoutEventType
  /** Event timestamp */
  timestamp: number
  /** Event payload */
  payload: {
    /** Shape ID if applicable */
    shapeId?: string
    /** Shape type if applicable */
    shapeType?: string
    /** Operation ID if applicable */
    operationId?: string
    /** Additional event data */
    [key: string]: unknown
  }
}

/** Layout statistics for performance monitoring */
export interface LayoutStatistics {
  /** Total shapes created */
  totalShapes: number
  /** Shapes by type */
  shapesByType: Record<string, number>
  /** Average drawing time per shape in milliseconds */
  averageDrawingTime: number
  /** Total drawing operations */
  totalOperations: number
  /** Failed operations count */
  failedOperations: number
  /** High DPI usage statistics */
  highDPIStats: {
    /** Whether high DPI is enabled */
    enabled: boolean
    /** Device pixel ratio used */
    devicePixelRatio: number
    /** Memory usage in bytes */
    memoryUsage: number
  }
}

/** Layout cleanup options for resource management */
export interface LayoutCleanupOptions {
  /** Whether to clear all shapes */
  clearShapes: boolean
  /** Whether to reset canvas context */
  resetContext: boolean
  /** Whether to clear dirty regions */
  clearDirtyRegions: boolean
}
