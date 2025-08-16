import { NeaCanvas } from '../src/index'

/**
 * Generates a proper multi-layout demo
 * Each layout wrapped in its own function - CLEAN & ISOLATED
 */
async function generateMultiLayoutDemo() {
  try {
    console.log('🎨 Creating multi-layout demo...')
    
    // 1) NeaCanvas -> Create Fixed Canvas
    const canvas = NeaCanvas.init({
      width: 800,
      height: 600,
      backgroundColor: '#f8f9fa'
    })
    
    // 2) Create separate layouts
    const headerLayout = await canvas.create('header', {
      width: 700,
      height: 100,
      x: 50,
      y: 50,
      backgroundColor: '#3498db'
    })
    
    const contentLayout = await canvas.create('content', {
      width: 700,
      height: 200,
      x: 50,
      y: 170,
      backgroundColor: '#e74c3c'
    })
    
    const footerLayout = await canvas.create('footer', {
      width: 700,
      height: 100,
      x: 50,
      y: 390,
      backgroundColor: '#f39c12'
    })
    
    // 3) Draw shapes in each layout using functions
    drawHeader(headerLayout)
    drawContent(contentLayout)
    drawFooter(footerLayout)
    
    // 4) Export - Canvas merges all layouts
    console.log('📤 Exporting multi-layout demo...')
    const png = await canvas.export({ format: 'png', quality: 0.95 })
    
    // Save to file
    if (typeof process !== 'undefined') {
      const fs = await import('fs')
      const path = await import('path')
      const outputDir = path.join(process.cwd(), 'example', 'output')
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      const outputPath = path.join(outputDir, 'multi-layout-demo.png')
      fs.writeFileSync(outputPath, png as Buffer)
      console.log(`🎉 Multi-layout demo saved to: ${outputPath}`)
    }
    
    return png
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

/**
 * Header Layout Function - Isolated drawing
 */
function drawHeader(layout: any) {
  // Border
  layout.draw('rectangle', {
    x: 0, y: 0, width: 700, height: 100,
    fill: 'transparent',
    stroke: '#2c3e50',
    strokeWidth: 2
  })
  
  // Title
  layout.draw('text', {
    x: 350, y: 50,
    text: 'MULTI-LAYOUT DEMO',
    fontSize: 24,
    fontFamily: 'Georgia, serif',
    fill: '#2c3e50',
    textAlign: 'center',
    textBaseline: 'middle',
    fontStyle: 'bold'
  })
}

/**
 * Content Layout Function - Isolated drawing
 */
function drawContent(layout: any) {
  // Border
  layout.draw('rectangle', {
    x: 0, y: 0, width: 700, height: 200,
    fill: 'transparent',
    stroke: '#34495e',
    strokeWidth: 1
  })
  
  // Left circle
  layout.draw('circle', {
    x: 150, y: 100, radius: 50,
    fill: '#3498db',
    stroke: '#ffffff',
    strokeWidth: 2
  })
  
  // Center rectangle
  layout.draw('rectangle', {
    x: 275, y: 50, width: 150, height: 100,
    fill: '#e74c3c',
    stroke: '#ffffff',
    strokeWidth: 2
  })
  
  // Right triangle (using existing triangle tool)
  layout.draw('triangle', {
    x: 500, y: 50, width: 100, height: 100,
    fill: '#f39c12',
    stroke: '#ffffff',
    strokeWidth: 2
  })
  
  // Content text
  layout.draw('text', {
    x: 350, y: 170,
    text: 'Three shapes in isolated content layout',
    fontSize: 14,
    fontFamily: 'Arial, sans-serif',
    fill: '#7f8c8d',
    textAlign: 'center',
    textBaseline: 'middle'
  })
}

/**
 * Footer Layout Function - Isolated drawing
 */
function drawFooter(layout: any) {
  // Border
  layout.draw('rectangle', {
    x: 0, y: 0, width: 700, height: 100,
    fill: 'transparent',
    stroke: '#2c3e50',
    strokeWidth: 2
  })
  
  // Footer line
  layout.draw('line', {
    x: 50, y: 30, endX: 650, endY: 30,
    stroke: '#7f8c8d',
    strokeWidth: 1
  })
  
  // Footer text (kept within bounds)
  layout.draw('text', {
    x: 20, y: 60,
    text: 'Multi-Layout Demo',
    fontSize: 16,
    fontFamily: 'Georgia, serif',
    fill: '#2c3e50',
    textAlign: 'left',
    textBaseline: 'middle'
  })
  
  // Date (kept within bounds)
  layout.draw('text', {
    x: 20, y: 80,
    text: 'Generated: 16 Aug 2025',
    fontSize: 12,
    fontFamily: 'Arial, sans-serif',
    fill: '#95a5a6',
    textAlign: 'left',
    textBaseline: 'middle'
  })
}

// Run the demo
if (typeof process !== 'undefined') {
  generateMultiLayoutDemo()
    .then(() => console.log('✅ Multi-layout demo completed!'))
    .catch(error => console.error('💥 Demo failed:', error))
}

export { generateMultiLayoutDemo }
