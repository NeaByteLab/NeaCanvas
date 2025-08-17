import { Default } from '@constants/Default'

/**
 * Determines if the current environment is Node.js
 * @returns True when running in Node.js environment
 */
export function isNode(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  )
}

/**
 * Determines if the current environment is a web browser
 * @returns True when running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * Checks if the current device supports touch events
 * @returns True if touch events are supported
 */
export function isTouchDevice(): boolean {
  if (isNode()) {
    return false
  }
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - Legacy IE support
    navigator.msMaxTouchPoints > 0
  )
}

/**
 * Checks if the current device is likely a mobile device
 * @returns True if device appears to be mobile
 */
export function isMobileDevice(): boolean {
  if (isNode()) {
    return false
  }
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Gets the maximum number of simultaneous touch points supported
 * @returns Maximum touch points or 0 if touch is not supported
 */
export function getMaxTouchPoints(): number {
  if (isNode()) {
    return 0
  }
  return navigator.maxTouchPoints || 0
}

/**
 * Retrieves the device pixel ratio for display scaling
 * @returns Device pixel ratio value (1 for standard displays, higher for scaled displays)
 */
export function getDevicePixelRatio(): number {
  if (isBrowser()) {
    return window.devicePixelRatio || 1
  }
  return 1
}

/**
 * Computes canvas dimensions based on device pixel ratio
 * @param width - Logical width in CSS pixels
 * @param height - Logical height in CSS pixels
 * @returns Object containing actual canvas size and scale factor
 */
export function getDPICanvasSize(
  width: number,
  height: number
): {
  canvasWidth: number
  canvasHeight: number
  scale: number
} {
  const dpr = getDevicePixelRatio()
  return {
    scale: dpr,
    canvasWidth: Math.round(width * dpr),
    canvasHeight: Math.round(height * dpr)
  }
}

/**
 * Determines whether device pixel ratio scaling should be applied
 * @returns True when DPI scaling should be used
 */
export function shouldUseDPI(): boolean {
  const dpr = getDevicePixelRatio()
  return dpr > 1 && dpr <= Default.MAX_DEVICE_PIXEL_RATIO
}

/**
 * Determines whether high-quality rendering should be enabled
 * @returns True when high-quality rendering should be used based on device capabilities
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

/**
 * Retrieves rendering quality settings based on current environment
 * @returns Configuration object containing anti-aliasing and quality settings
 */
export function getOptimalRatio(): {
  quality: 'fast' | 'good' | 'best' | 'nearest' | 'bilinear'
  antialias: 'default' | 'none' | 'gray' | 'subpixel'
  patternQuality: 'fast' | 'good' | 'best' | 'nearest' | 'bilinear'
  imageSmoothingEnabled: boolean
  imageSmoothingQuality: 'low' | 'medium' | 'high'
} {
  if (isNode()) {
    return {
      quality: 'best',
      antialias: 'subpixel',
      patternQuality: 'best',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    }
  } else {
    const dpr = getDevicePixelRatio()
    if (dpr >= Default.MIN_HIGH_DPI_RATIO) {
      return {
        quality: 'best',
        antialias: 'subpixel',
        patternQuality: 'best',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      }
    } else {
      return {
        quality: 'good',
        antialias: 'default',
        patternQuality: 'good',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'medium'
      }
    }
  }
}

/**
 * Creates a ResizeObserver to monitor device pixel ratio changes
 * @param canvas - HTML canvas element to observe
 * @param callback - Function called when DPR changes
 * @returns ResizeObserver instance or null when not supported
 */
export function createDPRObserver(
  canvas: HTMLCanvasElement,
  callback: (dpr: number) => void
): ResizeObserver | null {
  if (!isBrowser() || !window.ResizeObserver) {
    return null
  }
  const observer = new ResizeObserver(entries => {
    const entry = entries.find(e => e.target === canvas)
    if (entry?.devicePixelContentBoxSize?.[0]) {
      const newDPR = getDevicePixelRatio()
      callback(newDPR)
    }
  })
  try {
    observer.observe(canvas, { box: 'device-pixel-content-box' })
    return observer
  } catch {
    observer.observe(canvas)
    return observer
  }
}

/**
 * Monitors device pixel ratio changes using MediaQuery
 * @param callback - Function called when DPR changes
 * @returns Cleanup function to stop monitoring
 */
export function watchDPRChanges(callback: (dpr: number) => void): () => void {
  if (isNode()) {
    return (): void => {
      // Skip for non-browser environments
    }
  }
  let currentDPR = getDevicePixelRatio()
  let mediaQuery: MediaQueryList | null = null
  let cleanup: (() => void) | null = null
  let handler: (() => void) | null = null

  /**
   * Configures MediaQuery watcher for current DPR and handles changes
   */
  const setupWatcher = (): void => {
    if (mediaQuery && handler) {
      mediaQuery.removeEventListener('change', handler)
    }
    currentDPR = getDevicePixelRatio()
    mediaQuery = window.matchMedia(`(resolution: ${currentDPR}dppx)`)
    handler = (): void => {
      const newDPR = getDevicePixelRatio()
      if (newDPR !== currentDPR) {
        callback(newDPR)
        setupWatcher()
      }
    }
    mediaQuery.addEventListener('change', handler)
  }
  setupWatcher()
  cleanup = (): void => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', (): void => {
        // Event listener cleanup
      })
      mediaQuery = null
    }
  }
  return cleanup
}

/**
 * Creates coordinate transformation utilities for DPR scaling
 * @param logicalWidth - Width in CSS pixels
 * @param logicalHeight - Height in CSS pixels
 * @param actualWidth - Width in actual pixels
 * @param actualHeight - Height in actual pixels
 * @returns Object containing coordinate transformation methods and scale factors
 */
export function createCoordinateTransformer(
  logicalWidth: number,
  logicalHeight: number,
  actualWidth: number,
  actualHeight: number
): {
  toActual: (x: number, y: number) => { x: number; y: number }
  toLogical: (x: number, y: number) => { x: number; y: number }
  scaleWidth: (width: number) => number
  scaleHeight: (height: number) => number
  needsTransformation: boolean
  scaleX: number
  scaleY: number
} {
  const scaleX = actualWidth / logicalWidth
  const scaleY = actualHeight / logicalHeight
  return {
    toActual: (x: number, y: number): { x: number; y: number } => ({
      x: x * scaleX,
      y: y * scaleY
    }),
    toLogical: (x: number, y: number): { x: number; y: number } => ({
      x: x / scaleX,
      y: y / scaleY
    }),
    scaleWidth: (width: number): number => width * scaleX,
    scaleHeight: (height: number): number => height * scaleY,
    scaleX,
    scaleY,
    needsTransformation: scaleX !== 1 || scaleY !== 1
  }
}

/**
 * Creates a canvas binding that automatically manages DPR changes
 * @param canvas - HTML canvas element
 * @param options - Configuration options for the binding
 * @returns Binding object containing methods for managing canvas and DPR changes
 */
export function createCanvasBinding(
  canvas: HTMLCanvasElement,
  options: {
    onResize?: (width: number, height: number, dpr: number) => void
    onDPRChange?: (dpr: number) => void
    autoResize?: boolean
  } = {}
): {
  createTransformer: () => ReturnType<typeof createCoordinateTransformer>
  getCurrentDPR: () => number
  resize: () => void
  dispose: () => void
} {
  const { onResize, onDPRChange, autoResize = true } = options
  let currentDPR = getDevicePixelRatio()
  let resizeObserver: ResizeObserver | null = null
  let dprWatcher: (() => void) | null = null

  /**
   * Updates canvas dimensions and applies DPR scaling
   */
  const updateCanvasSize = (): void => {
    if (!autoResize) {
      return
    }
    if (!canvas.isConnected) {
      return
    }
    const rect = canvas.getBoundingClientRect()
    const logicalWidth = rect.width
    const logicalHeight = rect.height
    if (logicalWidth <= 0 || logicalHeight <= 0) {
      return
    }
    const dpr = getDevicePixelRatio()
    const { canvasWidth, canvasHeight } = getDPICanvasSize(
      logicalWidth,
      logicalHeight
    )
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    canvas.style.width = `${logicalWidth}px`
    canvas.style.height = `${logicalHeight}px`
    const ctx = canvas.getContext('2d')
    if (ctx && shouldUseDPI()) {
      ctx.scale(dpr, dpr)
    }
    onResize?.(logicalWidth, logicalHeight, dpr)
  }

  /**
   * Processes device pixel ratio changes
   * @param newDPR - New device pixel ratio value
   */
  const handleDPRChange = (newDPR: number): void => {
    if (newDPR !== currentDPR) {
      currentDPR = newDPR
      updateCanvasSize()
      onDPRChange?.(newDPR)
    }
  }
  if (isBrowser()) {
    resizeObserver = createDPRObserver(canvas, handleDPRChange)
    dprWatcher = watchDPRChanges(handleDPRChange)
  }
  return {
    getCurrentDPR: (): number => currentDPR,
    resize: (): void => updateCanvasSize(),
    createTransformer: (): ReturnType<typeof createCoordinateTransformer> => {
      const rect = canvas.getBoundingClientRect()
      return createCoordinateTransformer(
        rect.width,
        rect.height,
        canvas.width,
        canvas.height
      )
    },
    dispose: (): void => {
      resizeObserver?.disconnect()
      dprWatcher?.()
      resizeObserver = null
      dprWatcher = null
    }
  }
}
