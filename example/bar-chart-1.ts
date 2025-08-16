import { NeaCanvas } from '../src/index'

/**
 * Generates a professional bar chart.
 * - Clean axes, gridlines, labels
 * - Layout-relative coordinates, in-bounds drawing
 *
 * @returns {Promise<Buffer|undefined>} PNG buffer when running in Node.js, or undefined when rendering in a browser
 * @throws {Error} If the bar chart generation or export fails
 */
async function generateBarChart() {
  try {
    // Canvas (root)
    const canvas = NeaCanvas.init({
      width: 1200,
      height: 800,
      backgroundColor: '#ffffff'
    })

    // Layout (bounded drawing area)
    const chart = await canvas.create('bar-chart', {
      width: 1000,
      height: 600,
      x: 100,
      y: 100,
      backgroundColor: '#ffffff'
    })

    // Title
    chart.draw('text', {
      x: 500, y: 36,
      text: 'Monthly Performance',
      fontSize: 28,
      fontFamily: 'Arial',
      fill: '#2c3e50',
      textAlign: 'center',
      textBaseline: 'middle',
      fontStyle: 'bold'
    })

    // Chart inner plot area (margins inside layout)
    const margin = { top: 80, right: 60, bottom: 90, left: 80 }
    const plot = {
      x: margin.left,
      y: margin.top,
      width: 1000 - margin.left - margin.right,
      height: 600 - margin.top - margin.bottom
    }

    // Background panel for plot
    chart.draw('roundedRect', {
      x: plot.x,
      y: plot.y,
      width: plot.width,
      height: plot.height,
      radius: 8,
      fill: '#f8f9fa'
    })

    // Sample data
    const data = [
      { label: 'Jan', value: 42 },
      { label: 'Feb', value: 58 },
      { label: 'Mar', value: 36 },
      { label: 'Apr', value: 75 },
      { label: 'May', value: 62 },
      { label: 'Jun', value: 90 },
      { label: 'Jul', value: 55 }
    ]

    // Scales
    const maxValue = Math.max(...data.map(d => d.value))
    // Add 10% headroom so tallest bars and value labels don't hit the top
    const yMax = Math.ceil((maxValue * 1.1) / 10) * 10
    const yTicks = 5
    const yStep = yMax / yTicks
    const pxPerUnit = plot.height / yMax

    // Gridlines + Y axis labels
    for (let i = 0; i <= yTicks; i++) {
      const v = i * yStep
      const y = plot.y + plot.height - v * pxPerUnit
      // Gridline
      chart.draw('line', {
        x: plot.x,
        y,
        endX: plot.x + plot.width,
        endY: y,
        stroke: i === 0 ? '#ced4da' : '#e9ecef',
        strokeWidth: 1
      })
      // Y label
      chart.draw('text', {
        x: plot.x - 20,
        y,
        text: String(v),
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#6c757d',
        textAlign: 'right',
        textBaseline: 'middle'
      })
    }

    // Axes
    // Y axis
    chart.draw('line', {
      x: plot.x,
      y: plot.y,
      endX: plot.x,
      endY: plot.y + plot.height,
      stroke: '#2c3e50',
      strokeWidth: 2
    })
    // X axis
    chart.draw('line', {
      x: plot.x,
      y: plot.y + plot.height,
      endX: plot.x + plot.width,
      endY: plot.y + plot.height,
      stroke: '#2c3e50',
      strokeWidth: 2
    })

    // Bars
    const barGap = 24
    const barW = Math.floor((plot.width - barGap * (data.length + 1)) / data.length)
    const barColors = ['#4ecdc4', '#ff6b6b', '#ffd166', '#6c5ce7', '#00b894', '#0984e3', '#e17055']
    const barStrokes = ['#3aaea7', '#e85b5b', '#e0b955', '#5848d6', '#019970', '#0872bf', '#c15f46']

    data.forEach((d, i) => {
      const x = plot.x + barGap + i * (barW + barGap)
      const h = d.value * pxPerUnit
      const y = plot.y + plot.height - h

      // Bar
      chart.draw('rectangle', {
        x,
        y,
        width: barW,
        height: h,
        fill: barColors[i % barColors.length],
        stroke: barStrokes[i % barStrokes.length],
        strokeWidth: 1,
        shadow: { color: 'rgba(0,0,0,0.08)', offsetX: 2, offsetY: 2, blur: 4 }
      })

      // Value label above bar (clamped to stay within plot area)
      chart.draw('text', {
        x: x + barW / 2,
        y: Math.max(y - 12, plot.y + 10),
        text: String(d.value),
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#2c3e50',
        textAlign: 'center',
        textBaseline: 'middle'
      })

      // X label
      chart.draw('text', {
        x: x + barW / 2,
        y: plot.y + plot.height + 20,
        text: d.label,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#6c757d',
        textAlign: 'center',
        textBaseline: 'top'
      })
    })

    // Axis labels (Y label removed per feedback)
    chart.draw('text', { x: plot.x + plot.width / 2, y: plot.y + plot.height + 52, text: 'Month', fontSize: 14, fontFamily: 'Arial', fill: '#2c3e50', textAlign: 'center', textBaseline: 'middle', fontStyle: 'bold' })

    // Browser render or Node export
    if (typeof window !== 'undefined') {
      canvas.render()
      return
    }
    const png = await canvas.export({ format: 'png', quality: 0.95 })
    if (typeof process !== 'undefined') {
      const fs = await import('fs')
      const path = await import('path')
      const outputDir = path.join(process.cwd(), 'example', 'output')
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
      const outputPath = path.join(outputDir, 'bar-chart-1.png')
      fs.writeFileSync(outputPath, png as Buffer)
      console.log(`saved: ${outputPath}`)
    }
    return png
  } catch (error) {
    console.error('❌ Error generating bar chart:', error)
    throw error
  }
}

// Run when executed directly via tsx (Node)
if (typeof process !== 'undefined' && !process.env.NEA_DISABLE_AUTO_RUN) {
  generateBarChart()
    .then(() => console.log('✅ bar-chart-1 complete'))
    .catch(err => console.error('💥 bar-chart-1 failed', err))
}

export { generateBarChart }
