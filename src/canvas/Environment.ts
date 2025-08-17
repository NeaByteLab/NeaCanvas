import { Default } from '@constants/Default'

/**
 * Checks if the current environment is Node.js
 * @returns True if running in Node.js environment
 */
export function isNode(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  )
}

/**
 * Checks if the current environment is a browser
 * @returns True if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * Gets the device pixel ratio for high DPI support
 * @returns Device pixel ratio (1 for standard, 2+ for retina)
 */
export function getDevicePixelRatio(): number {
  if (isBrowser()) {
    return window.devicePixelRatio || 1
  }
  return 1
}

/**
 * Calculates high DPI canvas dimensions
 * @param width - Logical width in CSS pixels
 * @param height - Logical height in CSS pixels
 * @returns Object with actual canvas size and scale factor
 */
export function getHighDPICanvasSize(
  width: number,
  height: number
): {
  canvasWidth: number
  canvasHeight: number
  scale: number
} {
  const dpr = getDevicePixelRatio()
  return {
    canvasWidth: Math.round(width * dpr),
    canvasHeight: Math.round(height * dpr),
    scale: dpr
  }
}

/**
 * Checks if high DPI is supported and beneficial
 * @returns True if high DPI should be used
 */
export function shouldUseHighDPI(): boolean {
  const dpr = getDevicePixelRatio()
  return dpr > 1 && dpr <= Default.MAX_DEVICE_PIXEL_RATIO
}

/**
 * Gets the optimal anti-aliasing setting for the current environment
 * @returns Anti-aliasing configuration object with quality settings for Node.js and browser environments
 */
export function getOptimalAntiAliasing(): {
  antialias: 'default' | 'none' | 'gray' | 'subpixel'
  patternQuality: 'fast' | 'good' | 'best' | 'nearest' | 'bilinear'
  quality: 'fast' | 'good' | 'best' | 'nearest' | 'bilinear'
  imageSmoothingEnabled: boolean
  imageSmoothingQuality: 'low' | 'medium' | 'high'
} {
  if (isNode()) {
    return {
      antialias: 'subpixel',
      patternQuality: 'best',
      quality: 'best',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    }
  } else {
    const dpr = getDevicePixelRatio()
    if (dpr >= Default.MIN_HIGH_DPI_RATIO) {
      return {
        antialias: 'subpixel',
        patternQuality: 'best',
        quality: 'best',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      }
    } else {
      return {
        antialias: 'default',
        patternQuality: 'good',
        quality: 'good',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'medium'
      }
    }
  }
}

/**
 * Checks if the device supports high-quality rendering
 * @returns True if high quality should be enabled based on device capabilities and environment
 */
export function shouldUseHighQuality(): boolean {
  if (isNode()) {
    return true
  }
  const dpr = getDevicePixelRatio()
  if (typeof window !== 'undefined' && 'navigator' in window) {
    const navigator = window.navigator as Navigator & {
      hardwareConcurrency?: number
    }
    return (
      dpr >= Default.MIN_HIGH_DPI_RATIO ||
      (navigator.hardwareConcurrency ?? 0) >= Default.MIN_HARDWARE_CORES
    )
  }
  return dpr >= Default.MIN_HIGH_DPI_RATIO
}
