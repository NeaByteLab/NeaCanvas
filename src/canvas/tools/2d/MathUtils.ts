/**
 * Shared mathematical utilities for 2D shape calculations
 * Provides constants and common math functions
 */

/** Mathematical constants - pre-calculated for performance */
export const MATH = {
  PI: Math.PI,
  TWO_PI: 2 * Math.PI,
  HALF_PI: Math.PI / 2,
  QUARTER_PI: Math.PI / 4,
  DEG_TO_RAD: Math.PI / 180,
  RAD_TO_DEG: 180 / Math.PI,
  GOLDEN_RATIO: 1.618033988749895,
  SILVER_RATIO: 1.4142135623730951,
  SQRT_2: Math.SQRT2,
  SQRT_3: Math.sqrt(3),
  SQRT_5: Math.sqrt(5),
  E: Math.E,
  GOLDEN_ANGLE: 3.883222,
  SILVER_ANGLE: 4.442883,
  EPSILON: Number.EPSILON,
  MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
  MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
  POLYGON_THRESHOLD_SMALL: 20,
  POLYGON_THRESHOLD_MEDIUM: 50,
  POLYGON_THRESHOLD_LARGE: 80,
  POLYGON_THRESHOLD_EXTREME: 90
}

/** Point interface for calculations */
export interface Point {
  x: number
  y: number
}

/** Angle utilities */
export const AngleUtils = {
  /**
   * Converts degrees to radians
   * @param degrees - Angle in degrees
   * @returns Angle in radians
   */
  toRadians(degrees: number): number {
    return degrees * MATH.DEG_TO_RAD
  },

  /**
   * Converts radians to degrees
   * @param radians - Angle in radians
   * @returns Angle in degrees
   */
  toDegrees(radians: number): number {
    return radians * MATH.RAD_TO_DEG
  },

  /**
   * Normalizes angle to 0-2π range
   * @param angle - Angle in radians
   * @returns Normalized angle between 0 and 2π
   */
  normalize(angle: number): number {
    return ((angle % MATH.TWO_PI) + MATH.TWO_PI) % MATH.TWO_PI
  },

  /**
   * Gets angle between two points
   * @param p1 - First point
   * @param p2 - Second point
   * @returns Angle in radians from p1 to p2
   */
  betweenPoints(p1: Point, p2: Point): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x)
  }
}

/** Distance utilities */
export const DistanceUtils = {
  /**
   * Calculates distance between two points
   * @param p1 - First point
   * @param p2 - Second point
   * @returns Euclidean distance between points
   */
  betweenPoints(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return Math.sqrt(dx * dx + dy * dy)
  },

  /**
   * Calculates squared distance (faster, no sqrt)
   * @param p1 - First point
   * @param p2 - Second point
   * @returns Squared distance between points
   */
  squaredBetweenPoints(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return dx * dx + dy * dy
  }
}

/** Interpolation utilities */
export const InterpolationUtils = {
  /**
   * Linear interpolation between two values
   * @param start - Starting value
   * @param end - Ending value
   * @param t - Interpolation factor (0-1)
   * @returns Interpolated value
   */
  lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t
  },

  /**
   * Linear interpolation between two points
   * @param p1 - Starting point
   * @param p2 - Ending point
   * @param t - Interpolation factor (0-1)
   * @returns Interpolated point
   */
  lerpPoints(p1: Point, p2: Point, t: number): Point {
    return {
      x: this.lerp(p1.x, p2.x, t),
      y: this.lerp(p1.y, p2.y, t)
    }
  },

  /**
   * Smooth step interpolation (easing)
   * @param t - Interpolation factor (0-1)
   * @returns Smooth interpolated value
   */
  smoothStep(t: number): number {
    return t * t * (3 - 2 * t)
  },

  /**
   * Catmull-Rom spline interpolation for smooth curves
   * @param p0 - Control point before p1
   * @param p1 - First interpolation point
   * @param p2 - Second interpolation point
   * @param p3 - Control point after p2
   * @param t - Interpolation factor (0-1)
   * @returns Interpolated point on the spline
   */
  catmullRom(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
    const t2 = t * t
    const t3 = t2 * t
    const x =
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3)
    const y =
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
    return { x, y }
  }
}

/** Mathematical precision utilities */
export const PrecisionUtils = {
  /**
   * Checks if two numbers are approximately equal
   * @param a - First number
   * @param b - Second number
   * @param tolerance - Tolerance for comparison
   * @returns True if numbers are within tolerance
   */
  approximatelyEqual(
    a: number,
    b: number,
    tolerance: number = MATH.EPSILON
  ): boolean {
    return Math.abs(a - b) <= tolerance
  },

  /**
   * Rounds number to specified decimal places
   * @param value - Number to round
   * @param decimals - Number of decimal places
   * @returns Rounded number
   */
  roundToDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals)
    return Math.round(value * factor) / factor
  },

  /**
   * Clamps value between min and max
   * @param value - Value to clamp
   * @param min - Minimum allowed value
   * @param max - Maximum allowed value
   * @returns Clamped value
   */
  clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  },

  /**
   * Normalizes value from [min, max] to [0, 1]
   * @param value - Value to normalize
   * @param min - Minimum value in range
   * @param max - Maximum value in range
   * @returns Normalized value between 0 and 1
   */
  normalize(value: number, min: number, max: number): number {
    return (value - min) / (max - min)
  },

  /**
   * Remaps value from [oldMin, oldMax] to [newMin, newMax]
   * @param value - Value to remap
   * @param oldMin - Old range minimum
   * @param oldMax - Old range maximum
   * @param newMin - New range minimum
   * @param newMax - New range maximum
   * @returns Remapped value in new range
   */
  remap(
    value: number,
    oldMin: number,
    oldMax: number,
    newMin: number,
    newMax: number
  ): number {
    return newMin + (newMax - newMin) * this.normalize(value, oldMin, oldMax)
  }
}
