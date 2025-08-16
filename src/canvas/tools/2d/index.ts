/**
 * 2D Drawing Tools
 *
 * Basic geometric shapes for canvas operations
 */

/**
 * Shared utilities
 * Mathematical constants, angle calculations, distance utilities, and interpolation functions
 */
export {
  MATH,
  AngleUtils,
  DistanceUtils,
  InterpolationUtils
} from '@tools/2d/MathUtils'
export type { Point } from '@tools/2d/MathUtils'
export { PathUtils } from '@tools/2d/PathUtils'
export { DrawingUtils } from '@tools/2d/DrawingUtils'

/**
 * Basic shapes
 * Core geometric primitives for canvas drawing
 */
export { Circle } from '@tools/2d/Circle'
export { Rectangle } from '@tools/2d/Rectangle'
export { Triangle } from '@tools/2d/Triangle'
export { Ellipse } from '@tools/2d/Ellipse'
export { Line } from '@tools/2d/Line'

/**
 * Text tools
 * Text rendering and multi-line text support
 */
export { Text } from '@tools/2d/Text'
export { MultiText } from '@tools/2d/MultiText'
