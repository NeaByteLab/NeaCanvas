import type { DrawConfig } from '@interfaces/index'
import type { UniversalCanvas } from '@interfaces/NeaExport'

/**
 * Draw operation for batching
 */
export interface DrawOperation {
  /** Shape type to draw */
  shape: string
  /** Drawing options and configuration */
  options: DrawConfig
  /** Timestamp when operation was queued */
  timestamp: number
  /** Unique operation ID */
  id: string
}

/**
 * Dirty region for partial redraws
 */
export interface DirtyRegion {
  /** X coordinate of the region */
  x: number
  /** Y coordinate of the region */
  y: number
  /** Width of the region */
  width: number
  /** Height of the region */
  height: number
}

/**
 * Pooled canvas for reuse
 */
export interface PooledCanvas {
  /** Canvas element */
  canvas: PooledCanvasElement
  /** Canvas width */
  width: number
  /** Canvas height */
  height: number
  /** Last used timestamp */
  lastUsed: number
}

/**
 * Performance metrics for NeaSmart
 */
export interface SmartMetrics {
  /** Number of operations batched */
  operationsBatched: number
  /** Number of cache hits */
  cacheHits: number
  /** Number of cache misses */
  cacheMisses: number
  /** Number of pool hits */
  poolHits: number
  /** Number of pool misses */
  poolMisses: number
  /** Number of dirty region redraws */
  dirtyRegionRedraws: number
}

/**
 * Canvas state for batching operations
 */
export interface CanvasState {
  /** Fill style (color, gradient, or pattern) */
  fill: string | CanvasGradient | CanvasPattern
  /** Stroke style */
  stroke: string
  /** Line width */
  lineWidth: number
  /** Opacity level */
  opacity: number
  /** Blend mode */
  blendMode: string
  /** Shadow effect */
  shadow: string
  /** Glow effect */
  glow: string
}

/**
 * Gradient configuration for fill styles
 */
export interface GradientConfig {
  /** Gradient type */
  type: 'linear' | 'radial'
  /** Color stops */
  stops: GradientStop[]
  /** Linear gradient start X */
  x0?: number
  /** Linear gradient start Y */
  y0?: number
  /** Linear gradient end X */
  x1?: number
  /** Linear gradient end Y */
  y1?: number
  /** Radial gradient center X */
  x?: number
  /** Radial gradient center Y */
  y?: number
  /** Radial gradient inner radius */
  r0?: number
  /** Radial gradient outer radius */
  r1?: number
}

/**
 * Gradient color stop
 */
export interface GradientStop {
  /** Offset position (0.0 to 1.0) */
  offset: number
  /** Color value */
  color: string
}

/**
 * Pattern configuration for caching
 */
export interface PatternConfig {
  /** Pattern source (image, canvas, etc.) */
  source: unknown
  /** Pattern repetition */
  repetition: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat'
}

/**
 * NeaSmart configuration options
 */
export interface SmartConfig {
  /** Maximum queue size before auto-flush - must be positive */
  maxQueueSize?: number
  /** Maximum canvas pool size - must be positive */
  maxPoolSize?: number
  /** Pool timeout in milliseconds - must be positive */
  poolTimeout?: number
  /** Maximum dirty regions to track - must be positive */
  maxDirtyRegions?: number
  /** Maximum gradient cache size - must be positive */
  maxGradientCache?: number
  /** Maximum pattern cache size - must be positive */
  maxPatternCache?: number
}

/**
 * Operation execution result
 */
export interface OperationResult {
  /** Success status */
  success: boolean
  /** Operation ID */
  operationId: string
  /** Error message if failed */
  error?: string
  /** Execution time in milliseconds - must be non-negative */
  executionTime?: number
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Total cache size - must be non-negative */
  totalSize: number
  /** Hit rate percentage - must be between 0.0 and 100.0 */
  hitRate: number
  /** Memory usage estimate in bytes - must be non-negative */
  memoryUsage: number
  /** Cache efficiency score - must be between 0.0 and 100.0 */
  efficiency: number
}

/**
 * Pool statistics
 */
export interface PoolStats {
  /** Current pool size - must be non-negative */
  currentSize: number
  /** Maximum pool size - must be positive */
  maxSize: number
  /** Hit rate percentage - must be between 0.0 and 100.0 */
  hitRate: number
  /** Average canvas reuse count - must be non-negative */
  averageReuse: number
}

/**
 * Batching statistics
 */
export interface BatchingStats {
  /** Current queue size - must be non-negative */
  queueSize: number
  /** Operations processed - must be non-negative */
  processed: number
  /** Average batch size - must be non-negative */
  averageBatchSize: number
  /** Batching efficiency - must be between 0.0 and 100.0 */
  efficiency: number
}

/**
 * Canvas element type for pooling operations
 * Universal canvas type that can be stored in pools
 */
export type PooledCanvasElement = UniversalCanvas

/**
 * Node.js canvas element type for pooling operations
 * Provides canvas dimensions and context access
 */
export interface NodeCanvasElement {
  /** Canvas width */
  width: number
  /** Canvas height */
  height: number
  /** Get 2D context */
  getContext(contextId: '2d'): NodeCanvasContext | null
}

/** Node.js canvas context type for pooling */
export interface NodeCanvasContext {
  /** Clear rectangle method */
  clearRect(x: number, y: number, width: number, height: number): void
}
