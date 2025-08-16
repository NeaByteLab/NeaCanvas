/**
 * Shared drawing utilities for 2D shapes
 * Provides common drawing operations and effect management
 */

import { EffectManager } from '@tools/EffectManager'
import type { DrawConfig } from '@interfaces/index'
import type { Point } from '@tools/2d/MathUtils'

/** Drawing utilities */
export const DrawingUtils = {
  /**
   * Draws a path from points with effects
   * @param ctx - Canvas 2D context
   * @param points - Array of points to connect
   * @param close - Whether to close the path
   * @throws Error if points array is invalid
   */
  drawPath(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    close: boolean = true
  ): void {
    if (points.length < 2) {
      return
    }
    const firstPoint = points[0]
    if (!firstPoint) {
      return
    }
    ctx.beginPath()
    ctx.moveTo(firstPoint.x, firstPoint.y)
    for (let i = 1; i < points.length; i++) {
      const point = points[i]
      if (point) {
        ctx.lineTo(point.x, point.y)
      }
    }
    if (close) {
      ctx.closePath()
    }
  },

  /**
   * Draws a shape with effects using a drawing function
   * @param ctx - Canvas 2D context
   * @param options - Drawing configuration
   * @param drawFunction - Function that draws the path
   * @throws Error if drawing function fails
   */
  drawWithEffects(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig,
    drawFunction: () => void
  ): void {
    ctx.save()
    try {
      EffectManager.applyEffects(ctx, options)
      const fillStyle = EffectManager.getFillStyle(ctx, options)
      drawFunction()
      if (fillStyle && fillStyle !== 'transparent' && fillStyle !== 'none') {
        ctx.fillStyle = fillStyle
        ctx.fill()
      }
      EffectManager.resetEffects(ctx)
      if (options.stroke && options.stroke !== 'transparent') {
        ctx.strokeStyle = options.stroke
        ctx.lineWidth = options.strokeWidth || 1
        ctx.stroke()
      }
    } finally {
      ctx.restore()
    }
  },

  /**
   * Draws a shape with effects using points
   * @param ctx - Canvas 2D context
   * @param options - Drawing configuration
   * @param points - Array of points to draw
   * @param close - Whether to close the path
   * @throws Error if points drawing fails
   */
  drawPointsWithEffects(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig,
    points: Point[],
    close: boolean = true
  ): void {
    this.drawWithEffects(ctx, options, () => {
      this.drawPath(ctx, points, close)
    })
  },

  /**
   * Draws a simple line with effects
   * @param ctx - Canvas 2D context
   * @param options - Drawing configuration
   * @param startX - Start X coordinate
   * @param startY - Start Y coordinate
   * @param endX - End X coordinate
   * @param endY - End Y coordinate
   * @throws Error if line drawing fails or stroke color is missing
   */
  drawLineWithEffects(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig,
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): void {
    if (!options.stroke || options.stroke === 'transparent') {
      throw new Error('Line requires stroke color')
    }
    ctx.save()
    try {
      EffectManager.applyEffects(ctx, options)
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.strokeStyle = options.stroke
      ctx.lineWidth = options.strokeWidth || 1
      ctx.stroke()
    } finally {
      ctx.restore()
    }
  },

  /**
   * Draws a rectangle with effects
   * @param ctx - Canvas 2D context
   * @param options - Drawing configuration
   * @param x - Top-left X coordinate
   * @param y - Top-left Y coordinate
   * @param width - Rectangle width
   * @param height - Rectangle height
   * @throws Error if rectangle drawing fails
   */
  drawRectWithEffects(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    this.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.rect(x, y, width, height)
    })
  },

  /**
   * Draws a circle/arc with effects
   * @param ctx - Canvas 2D context
   * @param options - Drawing configuration
   * @param centerX - Center X coordinate
   * @param centerY - Center Y coordinate
   * @param radius - Radius
   * @param startAngle - Start angle in radians
   * @param endAngle - End angle in radians
   * @throws Error if arc drawing fails
   */
  drawArcWithEffects(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number = 0,
    endAngle: number = 2 * Math.PI
  ): void {
    this.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    })
  },

  /**
   * Validates required properties for a shape
   * @param options - Drawing configuration
   * @param requiredProps - Array of required property names
   * @param shapeName - Name of the shape for error messages
   * @throws Error if required properties are missing
   */
  validateRequiredProps(
    options: DrawConfig,
    requiredProps: (keyof DrawConfig)[],
    shapeName: string
  ): void {
    for (const prop of requiredProps) {
      if (options[prop] === undefined) {
        throw new Error(`${shapeName} requires ${prop}`)
      }
    }
  },

  /**
   * Gets default values for optional properties
   * @param options - Drawing configuration
   * @param defaults - Default values object
   */
  getDefaults<T extends Partial<DrawConfig>>(
    options: DrawConfig,
    defaults: T
  ): T {
    const result = { ...defaults }
    for (const key in defaults) {
      const value = options[key as keyof DrawConfig]
      if (value !== undefined) {
        ;(result as Record<string, unknown>)[key] = value
      }
    }
    return result
  }
}
