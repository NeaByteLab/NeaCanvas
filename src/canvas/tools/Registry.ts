import type { DrawConfig } from '@interfaces/index'
import { PathUtils } from '@tools/2d/PathUtils'
import * as Tools2D from '@tools/2d'
import { Default } from '@constants/Default'

/**
 * Tool Registry for managing drawing tools
 * Uses smart factories to generate 60+ shapes dynamically
 */
export class ToolRegistry {
  /**
   * Map of registered drawing tools by name
   */
  private static tools = new Map<
    string,
    (ctx: CanvasRenderingContext2D, options: DrawConfig) => void
  >()

  /**
   * Initializes the registry with available tools and smart factories
   */
  static initialize(): void {
    this.register('line', Tools2D.Line.draw)
    this.register('rectangle', Tools2D.Rectangle.draw)
    this.register('circle', Tools2D.Circle.draw)
    this.register('triangle', Tools2D.Triangle.draw)
    this.register('ellipse', Tools2D.Ellipse.draw)
    this.register('text', Tools2D.Text.draw)
    this.register('multitext', Tools2D.MultiText.draw)
    this.registerSmartFactories()
  }

  /**
   * Registers smart factories for generating shapes dynamically
   */
  private static registerSmartFactories(): void {
    this.register('semicircle', (ctx, options) =>
      this.drawSemicircle(ctx, options)
    )
    this.register('oval', (ctx, options) => this.drawOval(ctx, options))
    this.register('point', (ctx, options) => this.drawPoint(ctx, options))
    for (let sides = 5; sides <= 100; sides++) {
      const shapeName = this.getPolygonName(sides)
      this.register(shapeName, (ctx, options) =>
        this.drawPolygon(ctx, options, sides)
      )
    }
    for (let points = 5; points <= 12; points++) {
      const shapeName = this.getStarName(points)
      this.register(shapeName, (ctx, options) =>
        this.drawStar(ctx, options, points)
      )
    }
    this.register('parabola', (ctx, options) => this.drawParabola(ctx, options))
    this.register('hyperbola', (ctx, options) =>
      this.drawHyperbola(ctx, options)
    )
    this.register('cardioid', (ctx, options) => this.drawCardioid(ctx, options))
    this.register('lemniscate', (ctx, options) =>
      this.drawLemniscate(ctx, options)
    )
    this.register('annulus', (ctx, options) => this.drawAnnulus(ctx, options))
    this.register('sector', (ctx, options) => this.drawSector(ctx, options))
    this.register('segment', (ctx, options) => this.drawSegment(ctx, options))
    this.register('crescent', (ctx, options) => this.drawCrescent(ctx, options))
    this.register('lens', (ctx, options) => this.drawLens(ctx, options))
    this.register('lune', (ctx, options) => this.drawLune(ctx, options))
    this.register('reuleauxTriangle', (ctx, options) =>
      this.drawReuleauxTriangle(ctx, options)
    )
    this.register('salinon', (ctx, options) => this.drawSalinon(ctx, options))
    this.register('tomahawk', (ctx, options) => this.drawTomahawk(ctx, options))
    this.register('trefoil', (ctx, options) => this.drawTrefoil(ctx, options))
    this.register('plus', (ctx, options) => this.drawPlus(ctx, options))
    this.register('parallelogram', (ctx, options) =>
      this.drawParallelogram(ctx, options)
    )
    this.register('trapezium', (ctx, options) =>
      this.drawTrapezium(ctx, options)
    )
    this.register('kite', (ctx, options) => this.drawKite(ctx, options))
    this.register('dottedLine', (ctx, options) =>
      this.drawDottedLine(ctx, options)
    )
    this.register('zigzag', (ctx, options) => this.drawZigzag(ctx, options))
    this.register('checkerboard', (ctx, options) =>
      this.drawCheckerboard(ctx, options)
    )
    this.register('polkaDots', (ctx, options) =>
      this.drawPolkaDots(ctx, options)
    )
    this.register('heart', (ctx, options) => this.drawHeart(ctx, options))
    this.register('spiral', (ctx, options) => this.drawSpiral(ctx, options))
    this.register('roundedRect', (ctx, options) =>
      this.drawRoundedRect(ctx, options)
    )
    this.register('diamond', (ctx, options) => this.drawDiamond(ctx, options))
    this.register('cross', (ctx, options) => this.drawCross(ctx, options))
    this.register('arrow', (ctx, options) => this.drawArrow(ctx, options))
    this.register('cloud', (ctx, options) => this.drawCloud(ctx, options))
    this.register('flower', (ctx, options) => this.drawFlower(ctx, options))
    this.register('gear', (ctx, options) => this.drawGear(ctx, options))
    this.register('infinity', (ctx, options) => this.drawInfinity(ctx, options))
  }

  /**
   * Gets polygon name based on number of sides
   * @param sides - Number of polygon sides
   * @returns Polygon name string
   */
  private static getPolygonName(sides: number): string {
    const names: Record<number, string> = {
      3: 'triangle',
      4: 'square',
      5: 'pentagon',
      6: 'hexagon',
      7: 'heptagon',
      8: 'octagon',
      9: 'nonagon',
      10: 'decagon',
      11: 'hendecagon',
      12: 'dodecagon',
      13: 'tridecagon',
      14: 'tetradecagon',
      15: 'pentadecagon',
      16: 'hexadecagon',
      17: 'heptadecagon',
      18: 'octadecagon',
      19: 'enneadecagon',
      20: 'icosagon',
      30: 'triacontagon',
      40: 'tetracontagon',
      50: 'pentacontagon',
      60: 'hexacontagon',
      70: 'heptacontagon',
      80: 'octacontagon',
      90: 'enneacontagon',
      100: 'hectogon',
      1000: 'chiliagon',
      10000: 'myriagon',
      1000000: 'megagon'
    }
    return names[sides] || `polygon${sides}`
  }

  /**
   * Gets star name based on number of points
   * @param points - Number of star points
   * @returns Star name string
   */
  private static getStarName(points: number): string {
    const names: Record<number, string> = {
      5: 'pentagram',
      6: 'hexagram',
      7: 'heptagram',
      8: 'octagram',
      9: 'nonagram',
      10: 'decagram',
      11: 'hendecagram',
      12: 'dodecagram'
    }
    return names[points] || `star${points}`
  }

  /**
   * Draws polygon with specified number of sides
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   * @param sides - Number of polygon sides
   */
  private static drawPolygon(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig,
    sides: number
  ): void {
    const { x, y, width, height, radius } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const safeRadius = radius || Math.min(width || 100, height || 100) / 2
    const points = PathUtils.getPolygonPoints(
      sides,
      safeRadius,
      0,
      centerX,
      centerY
    )
    Tools2D.DrawingUtils.drawPointsWithEffects(ctx, options, points, true)
  }

  /**
   * Draws star with specified number of points
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   * @param points - Number of star points
   */
  private static drawStar(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig,
    points: number
  ): void {
    const { x, y, width, height, radius } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const safeRadius = radius || Math.min(width || 100, height || 100) / 2
    const innerRadius = safeRadius * 0.4
    const starPoints = PathUtils.getStarPoints(
      points,
      safeRadius,
      innerRadius,
      0,
      centerX,
      centerY
    )
    Tools2D.DrawingUtils.drawPointsWithEffects(ctx, options, starPoints, true)
  }

  /**
   * Draws heart shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawHeart(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height, radius } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const size = radius || Math.min(width || 100, height || 100) / 2
    const points = PathUtils.getHeartPoints(centerX, centerY, size)
    Tools2D.DrawingUtils.drawPointsWithEffects(ctx, options, points, true)
  }

  /**
   * Draws spiral shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawSpiral(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height, radius } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const maxRadius = radius || Math.min(width || 100, height || 100) / 2
    const points = PathUtils.getSpiralPoints(centerX, centerY, 3, maxRadius)
    Tools2D.DrawingUtils.drawPointsWithEffects(ctx, options, points, false)
  }

  /**
   * Draws rounded rectangle
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height, radius } = options
    const safeWidth = width || 100
    const safeHeight = height || 100
    const cornerRadius = radius || Math.min(safeWidth, safeHeight) * 0.2
    const points = PathUtils.getRoundedRectPoints(
      x,
      y,
      safeWidth,
      safeHeight,
      cornerRadius
    )
    Tools2D.DrawingUtils.drawPointsWithEffects(ctx, options, points, true)
  }

  /**
   * Draws diamond shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawDiamond(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const radius = Math.min(width || 100, height || 100) / 2
    const points = PathUtils.getPolygonPoints(
      4,
      radius,
      Math.PI / 4,
      centerX,
      centerY
    )
    Tools2D.DrawingUtils.drawPointsWithEffects(ctx, options, points, true)
  }

  /**
   * Draws cross shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawCross(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const safeWidth = width || 100
    const safeHeight = height || 100
    const thickness = Math.min(safeWidth, safeHeight) * 0.3
    const points = [
      { x: x + safeWidth / 2 - thickness / 2, y },
      { x: x + safeWidth / 2 + thickness / 2, y },
      {
        x: x + safeWidth / 2 + thickness / 2,
        y: y + safeHeight / 2 - thickness / 2
      },
      { x: x + safeWidth, y: y + safeHeight / 2 - thickness / 2 },
      { x: x + safeWidth, y: y + safeHeight / 2 + thickness / 2 },
      {
        x: x + safeWidth / 2 + thickness / 2,
        y: y + safeHeight / 2 + thickness / 2
      },
      { x: x + safeWidth / 2 + thickness / 2, y: y + safeHeight },
      { x: x + safeWidth / 2 - thickness / 2, y: y + safeHeight },
      {
        x: x + safeWidth / 2 - thickness / 2,
        y: y + safeHeight / 2 + thickness / 2
      },
      { x, y: y + safeHeight / 2 + thickness / 2 },
      { x, y: y + safeHeight / 2 - thickness / 2 },
      {
        x: x + safeWidth / 2 - thickness / 2,
        y: y + safeHeight / 2 - thickness / 2
      }
    ]
    Tools2D.DrawingUtils.drawPointsWithEffects(ctx, options, points, true)
  }

  /**
   * Draws arrow shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawArrow(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const safeWidth = width || 100
    const safeHeight = height || 100
    const arrowHeadSize = Math.min(safeWidth, safeHeight) * 0.3
    const points = [
      { x, y: y + safeHeight / 2 },
      { x: x + safeWidth - arrowHeadSize, y: y + safeHeight / 2 },
      { x: x + safeWidth - arrowHeadSize, y },
      { x: x + safeWidth, y: y + safeHeight / 2 },
      { x: x + safeWidth - arrowHeadSize, y: y + safeHeight },
      { x: x + safeWidth - arrowHeadSize, y: y + safeHeight / 2 }
    ]
    Tools2D.DrawingUtils.drawPointsWithEffects(ctx, options, points, true)
  }

  /**
   * Draws cloud shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawCloud(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const safeWidth = width || 100
    const safeHeight = height || 100
    ctx.beginPath()
    ctx.arc(
      x + safeWidth * 0.3,
      y + safeHeight * 0.5,
      safeHeight * 0.3,
      0,
      Math.PI * 2
    )
    ctx.arc(
      x + safeWidth * 0.7,
      y + safeHeight * 0.5,
      safeHeight * 0.3,
      0,
      Math.PI * 2
    )
    ctx.arc(
      x + safeWidth * 0.5,
      y + safeHeight * 0.5,
      safeHeight * 0.4,
      0,
      Math.PI * 2
    )
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      // Path is already drawn above
    })
  }

  /**
   * Draws flower shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawFlower(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const radius = Math.min(width || 100, height || 100) / 2
    const points = []
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const petalRadius = radius * 0.6
      points.push({
        x: centerX + Math.cos(angle) * petalRadius,
        y: centerY + Math.sin(angle) * petalRadius
      })
    }
    Tools2D.DrawingUtils.drawPointsWithEffects(ctx, options, points, true)
  }

  /**
   * Draws gear shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawGear(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const radius = Math.min(width || 100, height || 100) / 2
    const points = []
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const isOuter = i % 2 === 0
      const currentRadius = isOuter ? radius : radius * 0.7
      points.push({
        x: centerX + Math.cos(angle) * currentRadius,
        y: centerY + Math.sin(angle) * currentRadius
      })
    }
    Tools2D.DrawingUtils.drawPointsWithEffects(ctx, options, points, true)
  }

  /**
   * Draws infinity symbol
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawInfinity(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const safeWidth = width || 100
    const safeHeight = height || 100
    const radius = Math.min(safeWidth, safeHeight) * 0.3
    ctx.beginPath()
    ctx.arc(x + safeWidth * 0.3, y + safeHeight * 0.5, radius, 0, Math.PI * 2)
    ctx.arc(x + safeWidth * 0.7, y + safeHeight * 0.5, radius, 0, Math.PI * 2)
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      // Path is already drawn above
    })
  }

  /**
   * Draws a semicircle shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawSemicircle(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height, radius } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const safeRadius = radius || Math.min(width || 100, height || 100) / 2
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.arc(centerX, centerY, safeRadius, 0, Math.PI)
    })
  }

  /**
   * Draws an oval shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawOval(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const safeWidth = width || 100
    const safeHeight = height || 100
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.ellipse(
        x + safeWidth / 2,
        y + safeHeight / 2,
        safeWidth / 2,
        safeHeight / 2,
        0,
        0,
        Math.PI * 2
      )
    })
  }

  /**
   * Draws a point shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawPoint(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y } = options
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.arc(x, y, 1, 0, Math.PI * 2)
    })
  }

  /**
   * Draws a parabola shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawParabola(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const safeWidth = width || 100
    const safeHeight = height || 100
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.moveTo(x, y + safeHeight)
      const a = (-4 * safeHeight) / (safeWidth * safeWidth)
      const h = safeWidth / 2
      const k = safeHeight
      for (let i = 0; i <= safeWidth; i++) {
        const px = x + i
        const relativeX = i - h
        const py = y + k + a * relativeX * relativeX
        ctx.lineTo(px, py)
      }
    })
  }

  /**
   * Draws a hyperbola shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawHyperbola(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const safeWidth = width || 100
    const safeHeight = height || 100
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      const a = safeWidth / 4
      const b = safeHeight / 4
      const centerX = x + safeWidth / 2
      const centerY = y + safeHeight / 2
      for (let t = -2; t <= 2; t += 0.1) {
        const px = centerX + a * Math.cosh(t)
        const py = centerY + b * Math.sinh(t)
        if (t === -2) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }
      for (let t = 2; t >= -2; t -= 0.1) {
        const px = centerX - a * Math.cosh(t)
        const py = centerY + b * Math.sinh(t)
        ctx.lineTo(px, py)
      }
    })
  }

  /**
   * Draws a cardioid shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawCardioid(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const radius = Math.min(width || 100, height || 100) / 2
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      const steps = Default.CURVE_STEPS_HIGH
      const stepSize = (2 * Math.PI) / steps
      for (let i = 0; i <= steps; i++) {
        const angle = i * stepSize
        const r = radius * (1 + Math.cos(angle))
        const px = centerX + r * Math.cos(angle)
        const py = centerY + r * Math.sin(angle)
        if (i === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }
    })
  }

  /**
   * Draws a lemniscate shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawLemniscate(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const radius = Math.min(width || 100, height || 100) / 2
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      const steps = Default.CURVE_STEPS_HIGH
      const stepSize = (2 * Math.PI) / steps
      for (let i = 0; i <= steps; i++) {
        const t = i * stepSize
        const denominator = Math.sqrt(1 + Math.sin(t) * Math.sin(t))
        if (Math.abs(denominator) > 1e-10) {
          const px = centerX + (radius * Math.cos(t)) / denominator
          const py =
            centerY + (radius * Math.sin(t) * Math.cos(t)) / denominator
          if (i === 0) {
            ctx.moveTo(px, py)
          } else {
            ctx.lineTo(px, py)
          }
        }
      }
    })
  }

  /**
   * Draws an annulus shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawAnnulus(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height, radius } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const outerRadius = radius || Math.min(width || 100, height || 100) / 2
    const innerRadius = outerRadius * 0.6
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2)
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true)
    })
  }

  /**
   * Draws a sector shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawSector(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height, radius } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const safeRadius = radius || Math.min(width || 100, height || 100) / 2
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, safeRadius, 0, Math.PI / 2)
      ctx.closePath()
    })
  }

  /**
   * Draws a segment shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawSegment(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height, radius } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const safeRadius = radius || Math.min(width || 100, height || 100) / 2
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.arc(centerX, centerY, safeRadius, 0, Math.PI / 2)
      ctx.lineTo(centerX, centerY)
      ctx.closePath()
    })
  }

  /**
   * Draws a crescent shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawCrescent(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const radius = Math.min(width || 100, height || 100) / 2
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.arc(
        centerX + radius * 0.3,
        centerY,
        radius * 0.7,
        0,
        Math.PI * 2,
        true
      )
    })
  }

  /**
   * Draws a lens shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawLens(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const radius = Math.min(width || 100, height || 100) / 2
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.arc(centerX - radius * 0.3, centerY, radius, 0, Math.PI * 2)
      ctx.arc(centerX + radius * 0.3, centerY, radius, 0, Math.PI * 2, true)
    })
  }

  /**
   * Draws a lune shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawLune(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const radius = Math.min(width || 100, height || 100) / 2
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.arc(
        centerX + radius * 0.5,
        centerY,
        radius * 0.5,
        0,
        Math.PI * 2,
        true
      )
    })
  }

  /**
   * Draws a Reuleaux triangle shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawReuleauxTriangle(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const radius = Math.min(width || 100, height || 100) / 2
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      const cos30 = Math.cos(Math.PI / 6)
      const sin30 = Math.sin(Math.PI / 6)
      const v1x = centerX - radius * cos30
      const v1y = centerY - radius * sin30
      const v2x = centerX + radius * cos30
      const v2y = centerY - radius * sin30
      const v3x = centerX
      const v3y = centerY + radius
      const steps = Default.CURVE_STEPS_MEDIUM
      const stepSize = (2 * Math.PI) / 3 / steps
      for (let i = 0; i <= steps; i++) {
        const angle = Math.atan2(v1y - v3y, v1x - v3x) + i * stepSize
        const px = v3x + radius * Math.cos(angle)
        const py = v3y + radius * Math.sin(angle)
        if (i === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }
      for (let i = 0; i <= steps; i++) {
        const angle = Math.atan2(v2y - v1y, v2x - v1x) + i * stepSize
        const px = v1x + radius * Math.cos(angle)
        const py = v1y + radius * Math.sin(angle)
        ctx.lineTo(px, py)
      }
      for (let i = 0; i <= steps; i++) {
        const angle = Math.atan2(v3y - v2y, v3x - v2x) + i * stepSize
        const px = v2x + radius * Math.cos(angle)
        const py = v2y + radius * Math.sin(angle)
        ctx.lineTo(px, py)
      }
    })
  }

  /**
   * Draws a salinon shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawSalinon(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const radius = Math.min(width || 100, height || 100) / 2
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.arc(
        centerX - radius * 0.5,
        centerY,
        radius * 0.5,
        0,
        Math.PI * 2,
        true
      )
      ctx.arc(
        centerX + radius * 0.5,
        centerY,
        radius * 0.5,
        0,
        Math.PI * 2,
        true
      )
    })
  }

  /**
   * Draws a tomahawk shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawTomahawk(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const safeWidth = width || 100
    const safeHeight = height || 100
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.moveTo(x, y + safeHeight)
      ctx.lineTo(x + safeWidth * 0.3, y + safeHeight * 0.7)
      ctx.lineTo(x + safeWidth * 0.7, y + safeHeight * 0.7)
      ctx.lineTo(x + safeWidth, y + safeHeight)
      ctx.lineTo(x + safeWidth * 0.5, y)
      ctx.closePath()
    })
  }

  /**
   * Draws a trefoil shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawTrefoil(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const radius = Math.min(width || 100, height || 100) / 2
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2
        const cx = centerX + Math.cos(angle) * radius * 0.3
        const cy = centerY + Math.sin(angle) * radius * 0.3
        ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2)
      }
    })
  }

  /**
   * Draws a plus shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawPlus(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const safeWidth = width || 100
    const safeHeight = height || 100
    const thickness = Math.min(safeWidth, safeHeight) * 0.3
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.rect(x + safeWidth / 2 - thickness / 2, y, thickness, safeHeight)
      ctx.rect(x, y + safeHeight / 2 - thickness / 2, safeWidth, thickness)
    })
  }

  /**
   * Draws a parallelogram shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawParallelogram(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const safeWidth = width || 100
    const safeHeight = height || 100
    const skew = safeWidth * 0.2
    const points = [
      { x, y },
      { x: x + safeWidth + skew, y },
      { x: x + safeWidth, y: y + safeHeight },
      { x: x - skew, y: y + safeHeight }
    ]
    Tools2D.DrawingUtils.drawPointsWithEffects(ctx, options, points, true)
  }

  /**
   * Draws a trapezium shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawTrapezium(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const safeWidth = width || 100
    const safeHeight = height || 100
    const topWidth = safeWidth * 0.6
    const points = [
      { x: x + (safeWidth - topWidth) / 2, y },
      { x: x + (safeWidth + topWidth) / 2, y },
      { x: x + safeWidth, y: y + safeHeight },
      { x, y: y + safeHeight }
    ]
    Tools2D.DrawingUtils.drawPointsWithEffects(ctx, options, points, true)
  }

  /**
   * Draws a kite shape
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawKite(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const centerX = x + (width || 0) / 2
    const centerY = y + (height || 0) / 2
    const radiusX = (width || 100) / 2
    const radiusY = (height || 100) / 2
    const points = [
      { x: centerX, y: centerY - radiusY },
      { x: centerX + radiusX, y: centerY },
      { x: centerX, y: centerY + radiusY },
      { x: centerX - radiusX, y: centerY }
    ]
    Tools2D.DrawingUtils.drawPointsWithEffects(ctx, options, points, true)
  }

  /**
   * Draws a dotted line pattern
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawDottedLine(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, endX, endY } = options
    const safeEndX = endX || x + 100
    const safeEndY = endY || y
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      const distance = Math.sqrt((safeEndX - x) ** 2 + (safeEndY - y) ** 2)
      const dotSpacing = Default.DOT_SPACING
      const numDots = Math.floor(distance / dotSpacing)
      for (let i = 0; i <= numDots; i++) {
        const t = i / numDots
        const px = x + (safeEndX - x) * t
        const py = y + (safeEndY - y) * t
        ctx.beginPath()
        ctx.arc(px, py, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }

  /**
   * Draws a zigzag pattern
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawZigzag(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const safeWidth = width || 100
    const safeHeight = height || 100
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      ctx.beginPath()
      ctx.moveTo(x, y + safeHeight / 2)
      const segmentWidth = safeWidth / Default.ZIGZAG_SEGMENTS
      for (let i = 1; i <= Default.ZIGZAG_SEGMENTS; i++) {
        const px = x + i * segmentWidth
        const py =
          y + safeHeight / 2 + (i % 2 === 0 ? safeHeight / 4 : -safeHeight / 4)
        ctx.lineTo(px, py)
      }
    })
  }

  /**
   * Draws a checkerboard pattern
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawCheckerboard(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const safeWidth = width || 100
    const safeHeight = height || 100
    const squareSize = Default.CHECKERBOARD_SIZE
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      for (let row = 0; row < safeHeight; row += squareSize) {
        for (let col = 0; col < safeWidth; col += squareSize) {
          if ((row + col) % (squareSize * 2) === 0) {
            ctx.fillRect(x + col, y + row, squareSize, squareSize)
          }
        }
      }
    })
  }

  /**
   * Draws a polka dots pattern
   * @param ctx - Canvas 2D rendering context
   * @param options - Drawing configuration
   */
  private static drawPolkaDots(
    ctx: CanvasRenderingContext2D,
    options: DrawConfig
  ): void {
    const { x, y, width, height } = options
    const safeWidth = width || 100
    const safeHeight = height || 100
    const dotSpacing = Default.POLKA_DOT_SPACING
    const dotRadius = Default.POLKA_DOT_RADIUS
    Tools2D.DrawingUtils.drawWithEffects(ctx, options, () => {
      for (let row = dotSpacing; row < safeHeight; row += dotSpacing) {
        for (let col = dotSpacing; col < safeWidth; col += dotSpacing) {
          ctx.beginPath()
          ctx.arc(x + col, y + row, dotRadius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    })
  }

  /**
   * Registers a new drawing tool
   * @param name - Tool identifier string
   * @param drawFunction - Drawing function that takes context and options
   */
  static register(
    name: string,
    drawFunction: (ctx: CanvasRenderingContext2D, options: DrawConfig) => void
  ): void {
    this.tools.set(name, drawFunction)
  }

  /**
   * Gets a drawing tool by name
   * @param name - Tool identifier string
   * @returns Drawing function with context and options parameters, or undefined if not found
   */
  static get(
    name: string
  ):
    | ((ctx: CanvasRenderingContext2D, options: DrawConfig) => void)
    | undefined {
    return this.tools.get(name)
  }

  /**
   * Checks if a tool exists in the registry
   * @param name - Tool identifier string
   * @returns True if tool exists, false otherwise
   */
  static has(name: string): boolean {
    return this.tools.has(name)
  }

  /**
   * Gets all available tool names from the registry
   * @returns Array of registered tool names
   */
  static getAvailableTools(): string[] {
    return Array.from(this.tools.keys())
  }

  /**
   * Gets the total number of registered tools in the registry
   * @returns Number of tools currently registered
   */
  static getToolCount(): number {
    return this.tools.size
  }
}
