import type { DrawConfig } from '@interfaces/index'
import { isBrowser } from '@canvas/Environment'

/**
 * Filter Manager for handling canvas filter effects
 * Provides cross-platform filter implementation with environment optimization
 */
export class FilterManager {
  /**
   * Applies filter effects with environment-optimized implementation
   * @param ctx - Canvas 2D rendering context
   * @param filters - Filter configuration
   * @param options - Drawing configuration for context
   */
  static applyFilters(
    ctx: CanvasRenderingContext2D,
    filters: NonNullable<DrawConfig['filters']>,
    options: DrawConfig
  ): void {
    if (this.canUseNativeFilters(filters)) {
      this.applyFiltersNative(ctx, filters)
    } else {
      this.applyFiltersPixelManipulation(ctx, filters, options)
    }
  }

  /**
   * Checks if filters can be applied using native Canvas filter property
   * @param filters - Filter configuration
   * @returns True if native filters can be used
   */
  private static canUseNativeFilters(
    filters: NonNullable<DrawConfig['filters']>
  ): boolean {
    if (!isBrowser()) {
      return false
    }
    try {
      const testCanvas = document.createElement('canvas')
      const testCtx = testCanvas.getContext('2d')
      if (!testCtx) {
        return false
      }
      testCtx.filter = 'blur(1px)'
      const supportsFilters = testCtx.filter === 'blur(1px)'
      if (!supportsFilters) {
        return false
      }
      const hasComplexFilters =
        filters.hueRotate !== undefined ||
        filters.sepia !== undefined ||
        (filters.brightness !== undefined && filters.contrast !== undefined)
      return !hasComplexFilters
    } catch {
      return false
    }
  }

  /**
   * Applies filters using native Canvas filter property
   * @param ctx - Canvas 2D rendering context
   * @param filters - Filter configuration
   */
  private static applyFiltersNative(
    ctx: CanvasRenderingContext2D,
    filters: NonNullable<DrawConfig['filters']>
  ): void {
    const filterString = this.buildCSSFilterString(filters)
    if (filterString) {
      ctx.filter = filterString
    }
  }

  /**
   * Builds CSS filter string for native Canvas filter property
   * @param filters - Filter configuration
   * @returns CSS filter string or empty string
   */
  private static buildCSSFilterString(
    filters: NonNullable<DrawConfig['filters']>
  ): string {
    const filterParts: string[] = []
    if (filters.blur !== undefined) {
      filterParts.push(`blur(${filters.blur}px)`)
    }
    if (filters.brightness !== undefined) {
      filterParts.push(`brightness(${filters.brightness}%)`)
    }
    if (filters.contrast !== undefined) {
      filterParts.push(`contrast(${filters.contrast}%)`)
    }
    if (filters.saturate !== undefined) {
      filterParts.push(`saturate(${filters.saturate}%)`)
    }
    if (filters.grayscale !== undefined) {
      filterParts.push(`grayscale(${filters.grayscale}%)`)
    }
    if (filters.invert !== undefined) {
      filterParts.push(`invert(${filters.invert}%)`)
    }
    if (filters.dropShadow !== undefined) {
      const { offsetX, offsetY, blur, color } = filters.dropShadow
      filterParts.push(
        `drop-shadow(${offsetX}px ${offsetY}px ${blur}px ${color})`
      )
    }
    return filterParts.join(' ')
  }

  /**
   * Applies filters through pixel manipulation
   * Works in both Node.js and browser environments
   * @param ctx - Canvas 2D rendering context
   * @param filters - Filter configuration
   * @param options - Drawing configuration for context
   */
  private static applyFiltersPixelManipulation(
    ctx: CanvasRenderingContext2D,
    filters: NonNullable<DrawConfig['filters']>,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    if (!width || !height) {
      return
    }
    const imageData = ctx.getImageData(x, y, width, height)
    const { data } = imageData
    this.applyAllFilters(data, filters)
    ctx.putImageData(imageData, x, y)
  }

  /**
   * Applies all filters to pixel data
   * @param data - Image data array
   * @param filters - Filter configuration
   */
  private static applyAllFilters(
    data: Uint8ClampedArray,
    filters: NonNullable<DrawConfig['filters']>
  ): void {
    if (filters.brightness !== undefined) {
      this.applyBrightnessFilter(data, filters.brightness)
    }
    if (filters.contrast !== undefined) {
      this.applyContrastFilter(data, filters.contrast)
    }
    if (filters.saturate !== undefined) {
      this.applySaturationFilter(data, filters.saturate)
    }
    if (filters.hueRotate !== undefined) {
      this.applyHueRotationFilter(data, filters.hueRotate)
    }
    if (filters.grayscale !== undefined) {
      this.applyGrayscaleFilter(data, filters.grayscale)
    }
    if (filters.sepia !== undefined) {
      this.applySepiaFilter(data, filters.sepia)
    }
    if (filters.invert !== undefined) {
      this.applyInvertFilter(data, filters.invert)
    }
  }

  /**
   * Applies brightness adjustment (-100 to 100)
   * @param data - Image data array
   * @param brightness - Brightness value (-100 to 100)
   */
  private static applyBrightnessFilter(
    data: Uint8ClampedArray,
    brightness: number
  ): void {
    const factor = 1 + brightness / 100
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, (data[i] ?? 0) * factor))
      data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] ?? 0) * factor))
      data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] ?? 0) * factor))
    }
  }

  /**
   * Applies contrast adjustment (-100 to 100)
   * @param data - Image data array
   * @param contrast - Contrast value (-100 to 100)
   */
  private static applyContrastFilter(
    data: Uint8ClampedArray,
    contrast: number
  ): void {
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(
        0,
        Math.min(255, factor * ((data[i] ?? 0) - 128) + 128)
      )
      data[i + 1] = Math.max(
        0,
        Math.min(255, factor * ((data[i + 1] ?? 0) - 128) + 128)
      )
      data[i + 2] = Math.max(
        0,
        Math.min(255, factor * ((data[i + 2] ?? 0) - 128) + 128)
      )
    }
  }

  /**
   * Applies saturation adjustment (0 to 200)
   * @param data - Image data array
   * @param saturation - Saturation value (0 to 200)
   */
  private static applySaturationFilter(
    data: Uint8ClampedArray,
    saturation: number
  ): void {
    const factor = saturation / 100
    for (let i = 0; i < data.length; i += 4) {
      const gray =
        0.299 * (data[i] ?? 0) +
        0.587 * (data[i + 1] ?? 0) +
        0.114 * (data[i + 2] ?? 0)
      data[i] = Math.max(
        0,
        Math.min(255, gray + factor * ((data[i] ?? 0) - gray))
      )
      data[i + 1] = Math.max(
        0,
        Math.min(255, gray + factor * ((data[i + 1] ?? 0) - gray))
      )
      data[i + 2] = Math.max(
        0,
        Math.min(255, gray + factor * ((data[i + 2] ?? 0) - gray))
      )
    }
  }

  /**
   * Applies hue rotation (0 to 360 degrees)
   * @param data - Image data array
   * @param hueRotate - Hue rotation value in degrees
   */
  private static applyHueRotationFilter(
    data: Uint8ClampedArray,
    hueRotate: number
  ): void {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] ?? 0
      const g = data[i + 1] ?? 0
      const b = data[i + 2] ?? 0
      const [h, s, l] = this.rgbToHsl(r, g, b)
      const newH = (h + hueRotate) % 360
      const [newR, newG, newB] = this.hslToRgb(newH, s, l)
      data[i] = newR
      data[i + 1] = newG
      data[i + 2] = newB
    }
  }

  /**
   * Applies grayscale conversion (0 to 100)
   * @param data - Image data array
   * @param grayscale - Grayscale value (0 to 100)
   */
  private static applyGrayscaleFilter(
    data: Uint8ClampedArray,
    grayscale: number
  ): void {
    const factor = grayscale / 100
    for (let i = 0; i < data.length; i += 4) {
      const gray =
        0.299 * (data[i] ?? 0) +
        0.587 * (data[i + 1] ?? 0) +
        0.114 * (data[i + 2] ?? 0)
      data[i] = Math.max(
        0,
        Math.min(255, (data[i] ?? 0) * (1 - factor) + gray * factor)
      )
      data[i + 1] = Math.max(
        0,
        Math.min(255, (data[i + 1] ?? 0) * (1 - factor) + gray * factor)
      )
      data[i + 2] = Math.max(
        0,
        Math.min(255, (data[i + 2] ?? 0) * (1 - factor) + gray * factor)
      )
    }
  }

  /**
   * Applies sepia effect (0 to 100)
   * @param data - Image data array
   * @param sepia - Sepia value (0 to 100)
   */
  private static applySepiaFilter(
    data: Uint8ClampedArray,
    sepia: number
  ): void {
    const factor = sepia / 100
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] ?? 0
      const g = data[i + 1] ?? 0
      const b = data[i + 2] ?? 0
      const sepiaR = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
      const sepiaG = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
      const sepiaB = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
      data[i] = Math.max(0, Math.min(255, r * (1 - factor) + sepiaR * factor))
      data[i + 1] = Math.max(
        0,
        Math.min(255, g * (1 - factor) + sepiaG * factor)
      )
      data[i + 2] = Math.max(
        0,
        Math.min(255, b * (1 - factor) + sepiaB * factor)
      )
    }
  }

  /**
   * Applies color inversion (0 to 100)
   * @param data - Image data array
   * @param invert - Inversion value (0 to 100)
   */
  private static applyInvertFilter(
    data: Uint8ClampedArray,
    invert: number
  ): void {
    const factor = invert / 100
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(
        0,
        Math.min(
          255,
          (data[i] ?? 0) * (1 - factor) + (255 - (data[i] ?? 0)) * factor
        )
      )
      data[i + 1] = Math.max(
        0,
        Math.min(
          255,
          (data[i + 1] ?? 0) * (1 - factor) +
            (255 - (data[i + 1] ?? 0)) * factor
        )
      )
      data[i + 2] = Math.max(
        0,
        Math.min(
          255,
          (data[i + 2] ?? 0) * (1 - factor) +
            (255 - (data[i + 2] ?? 0)) * factor
        )
      )
    }
  }

  /**
   * Converts RGB to HSL color space
   * @param r - Red value (0-255)
   * @param g - Green value (0-255)
   * @param b - Blue value (0-255)
   * @returns HSL values [h, s, l]
   */
  private static rgbToHsl(
    r: number,
    g: number,
    b: number
  ): [number, number, number] {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }
    return [h * 360, s * 100, l * 100]
  }

  /**
   * Converts HSL to RGB color space
   * @param h - Hue value (0-360)
   * @param s - Saturation value (0-100)
   * @param l - Lightness value (0-100)
   * @returns RGB values [r, g, b]
   */
  private static hslToRgb(
    h: number,
    s: number,
    l: number
  ): [number, number, number] {
    h /= 360
    s /= 100
    l /= 100
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) {
        t += 1
      }
      if (t > 1) {
        t -= 1
      }
      if (t < 1 / 6) {
        return p + (q - p) * 6 * t
      }
      if (t < 1 / 2) {
        return q
      }
      if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6
      }
      return p
    }
    let r: number, g: number, b: number
    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
  }
}
