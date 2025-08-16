/**
 * Shared path utilities for 2D shape generation
 * Provides path calculations for all geometric shapes
 */

import { MATH } from '@tools/2d/MathUtils'
import type { Point } from '@tools/2d/MathUtils'

/** Path generation utilities */
export const PathUtils = {
  /**
   * Generates points for regular polygon
   * @param sides - Number of sides (3+)
   * @param radius - Radius from center
   * @param rotation - Rotation in radians
   * @param centerX - Center X coordinate
   * @param centerY - Center Y coordinate
   * @returns Array of polygon points
   * @throws Error if sides is less than 3
   */
  getPolygonPoints(
    sides: number,
    radius: number,
    rotation: number = 0,
    centerX: number = 0,
    centerY: number = 0
  ): Point[] {
    if (sides < 3) {
      throw new Error('Polygon must have at least 3 sides')
    }
    const points: Point[] = []
    const angleStep = MATH.TWO_PI / sides
    if (sides > MATH.POLYGON_THRESHOLD_SMALL) {
      for (let i = 0; i < sides; i++) {
        const angle = i * angleStep + rotation
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        let x = centerX + cos * radius
        let y = centerY + sin * radius
        if (sides > MATH.POLYGON_THRESHOLD_SMALL) {
          const variation = PathUtils.getMathematicalVariation(i, sides, radius)
          x += variation.x
          y += variation.y
        }
        points.push({ x, y })
      }
    } else {
      for (let i = 0; i < sides; i++) {
        const angle = i * angleStep + rotation
        points.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        })
      }
    }
    return points
  },

  /**
   * Generates mathematical variation for polygon points
   * Uses smooth mathematical patterns for natural-looking irregularities
   * @param index - Point index
   * @param sides - Total number of sides
   * @param radius - Base radius
   * @returns Variation offset point
   */
  getMathematicalVariation(
    index: number,
    sides: number,
    radius: number
  ): Point {
    const baseVariation = radius * 0.02
    if (sides <= MATH.POLYGON_THRESHOLD_MEDIUM) {
      const frequency = sides / 10
      const variationX = Math.sin(index * frequency) * baseVariation * 0.5
      const variationY = Math.cos(index * frequency) * baseVariation * 0.5
      return { x: variationX, y: variationY }
    } else if (sides <= MATH.POLYGON_THRESHOLD_LARGE) {
      const frequency1 = sides / 15
      const frequency2 = sides / 25
      const variationX =
        (Math.sin(index * frequency1) + Math.cos(index * frequency2)) *
        baseVariation *
        0.8
      const variationY =
        (Math.cos(index * frequency1) + Math.sin(index * frequency2)) *
        baseVariation *
        0.8
      return { x: variationX, y: variationY }
    } else {
      const frequency = sides / 20
      const jaggedFactor = Math.sin(index * frequency) > 0 ? 1 : -1
      const variationX = jaggedFactor * baseVariation * 1.2
      const variationY = jaggedFactor * baseVariation * 1.2
      return { x: variationX, y: variationY }
    }
  },

  /**
   * Generates points for star polygon
   * @param points - Number of star points
   * @param outerRadius - Outer radius
   * @param innerRadius - Inner radius
   * @param rotation - Rotation in radians
   * @param centerX - Center X coordinate
   * @param centerY - Center Y coordinate
   * @returns Array of star points
   * @throws Error if points is less than 3
   */
  getStarPoints(
    points: number,
    outerRadius: number,
    innerRadius: number,
    rotation: number = 0,
    centerX: number = 0,
    centerY: number = 0
  ): Point[] {
    if (points < 3) {
      throw new Error('Star must have at least 3 points')
    }
    const starPoints: Point[] = []
    const angleStep = MATH.TWO_PI / points
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * angleStep) / 2 + rotation
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      starPoints.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      })
    }
    return starPoints
  },

  /**
   * Generates points for arc/circle
   * @param centerX - Center X coordinate
   * @param centerY - Center Y coordinate
   * @param radius - Radius
   * @param startAngle - Start angle in radians
   * @param endAngle - End angle in radians
   * @param steps - Number of steps for smoothness
   * @returns Array of arc points
   */
  getArcPoints(
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number = 0,
    endAngle: number = MATH.TWO_PI,
    steps: number = 32
  ): Point[] {
    const points: Point[] = []
    const angleStep = (endAngle - startAngle) / steps
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + i * angleStep
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      })
    }
    return points
  },

  /**
   * Generates points for spiral
   * @param centerX - Center X coordinate
   * @param centerY - Center Y coordinate
   * @param turns - Number of turns
   * @param radius - Maximum radius
   * @param steps - Number of steps per turn
   * @returns Array of spiral points
   */
  getSpiralPoints(
    centerX: number,
    centerY: number,
    turns: number,
    radius: number,
    steps: number = 32
  ): Point[] {
    const points: Point[] = []
    const totalSteps = Math.floor(turns * steps)
    for (let i = 0; i <= totalSteps; i++) {
      const t = i / totalSteps
      const angle = t * turns * MATH.TWO_PI
      const currentRadius = t * radius
      points.push({
        x: centerX + Math.cos(angle) * currentRadius,
        y: centerY + Math.sin(angle) * currentRadius
      })
    }
    return points
  },

  /**
   * Generates points for heart shape
   * @param centerX - Center X coordinate
   * @param centerY - Center Y coordinate
   * @param size - Size of heart
   * @param steps - Number of steps for smoothness
   * @returns Array of heart shape points
   */
  getHeartPoints(
    centerX: number,
    centerY: number,
    size: number,
    steps: number = 32
  ): Point[] {
    const points: Point[] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const angle = t * MATH.TWO_PI
      const x = 16 * Math.pow(Math.sin(angle), 3)
      const y =
        13 * Math.cos(angle) -
        5 * Math.cos(2 * angle) -
        2 * Math.cos(3 * angle) -
        Math.cos(4 * angle)
      const scale = size / 20
      points.push({
        x: centerX + x * scale,
        y: centerY - y * scale
      })
    }
    return points
  },

  /**
   * Generates points for rounded rectangle
   * @param x - Top-left X coordinate
   * @param y - Top-left Y coordinate
   * @param width - Rectangle width
   * @param height - Rectangle height
   * @param radius - Corner radius
   * @param steps - Steps per corner (default 8)
   * @returns Array of rounded rectangle points
   */
  getRoundedRectPoints(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    steps: number = 8
  ): Point[] {
    const points: Point[] = []
    const halfSteps = Math.floor(steps / 2)
    for (let i = 0; i <= width - 2 * radius; i++) {
      points.push({ x: x + radius + i, y })
    }
    for (let i = 0; i <= halfSteps; i++) {
      const angle = (i / halfSteps) * MATH.HALF_PI
      points.push({
        x: x + width - radius + Math.cos(angle) * radius,
        y: y + radius - Math.sin(angle) * radius
      })
    }
    for (let i = 0; i <= height - 2 * radius; i++) {
      points.push({ x: x + width, y: y + radius + i })
    }
    for (let i = 0; i <= halfSteps; i++) {
      const angle = (i / halfSteps) * MATH.HALF_PI + MATH.HALF_PI
      points.push({
        x: x + width - radius + Math.cos(angle) * radius,
        y: y + height - radius - Math.sin(angle) * radius
      })
    }
    for (let i = 0; i <= width - 2 * radius; i++) {
      points.push({ x: x + width - radius - i, y: y + height })
    }
    for (let i = 0; i <= halfSteps; i++) {
      const angle = (i / halfSteps) * MATH.HALF_PI + MATH.PI
      points.push({
        x: x + radius - Math.cos(angle) * radius,
        y: y + height - radius - Math.sin(angle) * radius
      })
    }
    for (let i = 0; i <= height - 2 * radius; i++) {
      points.push({ x, y: y + height - radius - i })
    }
    for (let i = 0; i <= halfSteps; i++) {
      const angle = (i / halfSteps) * MATH.HALF_PI + MATH.PI + MATH.HALF_PI
      points.push({
        x: x + radius - Math.cos(angle) * radius,
        y: y + radius - Math.sin(angle) * radius
      })
    }
    return points
  }
}
