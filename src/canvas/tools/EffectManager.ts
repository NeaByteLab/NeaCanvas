import type { DrawConfig } from '@interfaces/index'
import { FilterManager } from '@tools/FilterManager'

/**
 * Extended canvas context interface for custom properties
 */
interface ExtendedCanvasContext extends CanvasRenderingContext2D {
  curveSmoothingFactor?: number
  subPixelRendering?: boolean
  mathPrecision?: number
}

/**
 * Manages universal effects for drawing tools
 * Provides shadow, glow, gradient, blend mode, and opacity effects
 */
export class EffectManager {
  /**
   * Applies all effects to the canvas context before drawing
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration with effects
   */
  static applyEffects(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    if (options.smoothing !== undefined) {
      this.applyMathematicalSmoothing(ctx, options.smoothing)
    }
    if (options.shadow) {
      this.applyShadow(ctx, options.shadow)
    }
    if (options.glow) {
      this.applyGlow(ctx, options.glow)
    }
    if (options.filters) {
      this.applyFilters(ctx, options.filters, options)
    }
    if (options.transform) {
      this.applyTransform(ctx, options.transform, options)
    }
    if (options.blendMode) {
      ctx.globalCompositeOperation = options.blendMode
    }
    if (options.opacity !== undefined) {
      ctx.globalAlpha = options.opacity
    }
  }

  /**
   * Creates a gradient based on configuration
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration with gradient
   * @returns CanvasGradient for linear or radial gradients, or null if no gradient specified
   */
  static createGradient(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): CanvasGradient | null {
    if (!options.gradient) {
      return null
    }
    const { gradient, x, y, width, height } = options
    if (gradient.type === 'linear') {
      const x0 = gradient.x0 ?? x
      const y0 = gradient.y0 ?? y
      const x1 = gradient.x1 ?? x + (width ?? 0)
      const y1 = gradient.y1 ?? y + (height ?? 0)
      return ctx.createLinearGradient(x0, y0, x1, y1)
    } else {
      const r0 = gradient.r0 ?? 0
      const r1 = gradient.r1 ?? Math.max(width ?? 0, height ?? 0) / 2
      return ctx.createRadialGradient(x, y, r0, x, y, r1)
    }
  }

  /**
   * Resets all effects to default values
   * @param ctx - Canvas 2D rendering context
   */
  static resetEffects(ctx: CanvasRenderingContext2D): void {
    ctx.shadowColor = 'transparent'
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1.0
  }

  /**
   * Gets the appropriate fill style (color or gradient)
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   * @returns Fill style string or gradient
   */
  static getFillStyle(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): string | CanvasGradient {
    if (options.gradient) {
      const gradient = this.createGradient(ctx, options)
      if (gradient) {
        options.gradient.stops.forEach(stop =>
          gradient.addColorStop(stop.offset, stop.color)
        )
        return gradient
      }
    }
    return options.fill !== undefined ? options.fill : 'transparent'
  }

  /**
   * Applies shadow effects with multiple layers and inner shadows
   * @param ctx - Canvas 2D rendering context
   * @param shadow - Shadow configuration
   */
  private static applyShadow(
    ctx: CanvasRenderingContext2D,
    shadow: NonNullable<DrawConfig['shadow']>
  ): void {
    if (
      shadow.offsetX !== undefined &&
      shadow.offsetY !== undefined &&
      shadow.blur !== undefined &&
      shadow.color !== undefined
    ) {
      ctx.shadowOffsetX = shadow.offsetX
      ctx.shadowOffsetY = shadow.offsetY
      ctx.shadowBlur = shadow.blur
      ctx.shadowColor = shadow.color
      return
    }
    if (shadow.primary) {
      ctx.shadowOffsetX = shadow.primary.offsetX
      ctx.shadowOffsetY = shadow.primary.offsetY
      ctx.shadowBlur = shadow.primary.blur
      ctx.shadowColor = shadow.primary.color
    }
  }

  /**
   * Applies glow effects with multiple colors and intensity control
   * @param ctx - Canvas 2D rendering context
   * @param glow - Glow configuration
   */
  private static applyGlow(
    ctx: CanvasRenderingContext2D,
    glow: NonNullable<DrawConfig['glow']>
  ): void {
    if (glow.color !== undefined && glow.blur !== undefined) {
      ctx.shadowColor = glow.color
      ctx.shadowBlur = glow.blur
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      return
    }
    if (glow.multiple && glow.multiple.length > 0) {
      const firstGlow = glow.multiple[0]
      if (firstGlow) {
        ctx.shadowColor = firstGlow.color
        ctx.shadowBlur = firstGlow.blur * (firstGlow.intensity || 1.0)
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      if (glow.multiple.length > 1) {
        console.warn(
          'Multiple glow colors require multiple drawing passes - using first glow only'
        )
      }
      return
    }
    if (glow.color !== undefined && glow.blur !== undefined) {
      const intensity = glow.intensity !== undefined ? glow.intensity : 1.0
      ctx.shadowColor = glow.color
      ctx.shadowBlur = glow.blur * intensity
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }
  }

  /**
   * Applies filter effects using FilterManager
   * @param ctx - Canvas 2D rendering context
   * @param filters - Filter configuration
   * @param options - Drawing configuration for context
   */
  private static applyFilters(
    ctx: CanvasRenderingContext2D,
    filters: NonNullable<DrawConfig['filters']>,
    options: DrawConfig
  ): void {
    FilterManager.applyFilters(ctx, filters, options)
  }

  /**
   * Applies transform effects (rotation, scaling, translation)
   * @param ctx - Canvas 2D rendering context
   * @param transform - Transform configuration
   * @param options - Drawing configuration for context
   */
  private static applyTransform(
    ctx: CanvasRenderingContext2D,
    transform: NonNullable<DrawConfig['transform']>,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    let originX = x
    let originY = y
    if (transform.origin) {
      originX = transform.origin.x
      originY = transform.origin.y
    } else if (width !== undefined && height !== undefined) {
      originX = x + width / 2
      originY = y + height / 2
    }
    ctx.translate(originX, originY)
    if (transform.rotate !== undefined) {
      ctx.rotate(transform.rotate)
    }
    if (transform.scale) {
      ctx.scale(transform.scale.x, transform.scale.y)
    }
    ctx.translate(-originX, -originY)
    if (transform.translate) {
      ctx.translate(transform.translate.x, transform.translate.y)
    }
  }

  /**
   * Applies mathematical smoothing effects for rendering quality
   * @param ctx - Canvas 2D rendering context
   * @param smoothing - Smoothing configuration
   */
  private static applyMathematicalSmoothing(
    ctx: CanvasRenderingContext2D,
    smoothing: NonNullable<DrawConfig['smoothing']>
  ): void {
    if (smoothing.antialiasing) {
      switch (smoothing.antialiasing) {
        case 'none':
          ctx.imageSmoothingEnabled = false
          break
        case 'low':
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'low'
          break
        case 'medium':
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'medium'
          break
        case 'high':
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          break
      }
    }
    if (smoothing.curveSmoothing !== undefined) {
      ;(ctx as ExtendedCanvasContext).curveSmoothingFactor = Math.max(
        0,
        Math.min(1, smoothing.curveSmoothing)
      )
    }
    if (smoothing.subPixel) {
      ;(ctx as ExtendedCanvasContext).subPixelRendering = true
    }
    if (smoothing.precision) {
      switch (smoothing.precision) {
        case 'low':
          ;(ctx as ExtendedCanvasContext).mathPrecision = 0.1
          break
        case 'medium':
          ;(ctx as ExtendedCanvasContext).mathPrecision = 0.01
          break
        case 'high':
          ;(ctx as ExtendedCanvasContext).mathPrecision = 0.001
          break
      }
    }
  }
}
