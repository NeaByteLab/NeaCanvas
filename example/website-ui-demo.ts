import { NeaCanvas } from '../src/index'

/**
 * Website UI Layout Demo
 * Creates a typical website layout: Header, Sidebar, Content, Footer
 * Demonstrates multi-layout architecture with proper positioning
 */
async function createWebsiteUI() {
  console.log('🎨 Creating Website UI Layout...')

  // 1. Initialize Canvas (1200x800 - typical website size)
  const canvas = NeaCanvas.init({ 
    width: 1200, 
    height: 800,
    backgroundColor: '#f5f5f5'
  })

  // 2. Create Layouts (Non-overlapping regions)
  console.log('📐 Creating layouts...')
  
  // Header: Full width, top of page
  const header = await canvas.create('header', {
    width: 1200,
    height: 80,
    x: 0,
    y: 0,
    backgroundColor: '#2c3e50'
  })

  // Sidebar: Left side, below header
  const sidebar = await canvas.create('sidebar', {
    width: 250,
    height: 640, // 800 - 80 (header) - 80 (footer)
    x: 0,
    y: 80,
    backgroundColor: '#34495e'
  })

  // Content: Main area, right of sidebar
  const content = await canvas.create('content', {
    width: 950, // 1200 - 250 (sidebar)
    height: 640,
    x: 250,
    y: 80,
    backgroundColor: '#ffffff'
  })

  // Footer: Full width, bottom of page
  const footer = await canvas.create('footer', {
    width: 1200,
    height: 80,
    x: 0,
    y: 720, // 800 - 80
    backgroundColor: '#2c3e50'
  })

  // 3. Draw Header Content
  console.log('🎯 Drawing header...')
  header.draw('text', {
    x: 60,
    y: 40,
    text: 'NeaCanvas Website',
    fontSize: 24,
    fill: '#ffffff',
    fontFamily: 'Arial'
  })

  header.draw('rectangle', {
    x: 1000,
    y: 25,
    width: 120,
    height: 30,
    fill: '#3498db',
    stroke: '#2980b9',
    strokeWidth: 1
  })

  header.draw('text', {
    x: 1060,
    y: 40,
    text: 'Login',
    fontSize: 14,
    fill: '#ffffff'
  })

  // 4. Draw Sidebar Navigation
  console.log('📋 Drawing sidebar...')
  const menuItems = ['Dashboard', 'Projects', 'Analytics', 'Settings', 'Help']
  
  menuItems.forEach((item, index) => {
    const y = 60 + (index * 60)
    const isActive = index === 0
    
    // Menu item background with better contrast
    sidebar.draw('rectangle', {
      x: 10,
      y: y - 20,
      width: 230,
      height: 40,
      fill: isActive ? '#ffffff' : 'transparent',
      stroke: isActive ? 'transparent' : '#4a5568',
      strokeWidth: 1
    })

    // Active indicator bar (left edge)
    if (isActive) {
      sidebar.draw('rectangle', {
        x: 10,
        y: y - 20,
        width: 4,
        height: 40,
        fill: '#3498db'
      })
    }

    // Menu item text with contrasting colors
    sidebar.draw('text', {
      x: 30,
      y: y,
      text: item,
      fontSize: 16,
      fill: isActive ? '#2c3e50' : '#ffffff'
    })

    // Menu icon with theme colors
    sidebar.draw('circle', {
      x: 200,
      y: y,
      radius: 6,
      fill: isActive ? '#3498db' : '#95a5a6'
    })
  })

  // 5. Draw Content Area
  console.log('📄 Drawing content...')
  
  // Page title
  content.draw('text', {
    x: 50,
    y: 50,
    text: 'Dashboard Overview',
    fontSize: 28,
    fill: '#2c3e50',
    fontFamily: 'Arial'
  })

  // Stats cards
  const stats = [
    { label: 'Total Users', value: '12,345', color: '#3498db' },
    { label: 'Revenue', value: '$45,678', color: '#2ecc71' },
    { label: 'Orders', value: '1,234', color: '#e74c3c' }
  ]

  stats.forEach((stat, index) => {
    const x = 50 + (index * 280)
    
    // Card background
    content.draw('rectangle', {
      x: x,
      y: 100,
      width: 250,
      height: 120,
      fill: '#ffffff',
      stroke: '#ecf0f1',
      strokeWidth: 2
    })

    // Colored accent
    content.draw('rectangle', {
      x: x,
      y: 100,
      width: 250,
      height: 8,
      fill: stat.color
    })

    // Value
    content.draw('text', {
      x: x + 125,
      y: 140,
      text: stat.value,
      fontSize: 24,
      fill: '#2c3e50',
      fontFamily: 'Arial'
    })

    // Label
    content.draw('text', {
      x: x + 125,
      y: 180,
      text: stat.label,
      fontSize: 14,
      fill: '#7f8c8d'
    })
  })

  // Chart area
  content.draw('rectangle', {
    x: 50,
    y: 260,
    width: 850,
    height: 300,
    fill: '#ffffff',
    stroke: '#ecf0f1',
    strokeWidth: 2
  })

  content.draw('text', {
    x: 475,
    y: 290,
    text: 'Analytics Chart',
    fontSize: 18,
    fill: '#2c3e50'
  })

  // Simple chart bars (scaled to fit in chart area)
  const chartData = [60, 100, 75, 150, 125, 90, 110]
  chartData.forEach((height, index) => {
    content.draw('rectangle', {
      x: 100 + (index * 100),
      y: 520 - height, // Chart area bottom is at y=560, so bars fit within
      width: 60,
      height: height,
      fill: '#3498db',
      stroke: '#2980b9',
      strokeWidth: 1
    })
  })

  // 6. Draw Footer
  console.log('🦶 Drawing footer...')
  footer.draw('text', {
    x: 60,
    y: 40,
    text: '© 2025 NeaCanvas Framework - Enterprise Canvas Solution',
    fontSize: 14,
    fill: '#bdc3c7'
  })

  footer.draw('text', {
    x: 1000,
    y: 40,
    text: 'v0.1.0',
    fontSize: 12,
    fill: '#95a5a6'
  })

  // 7. Export the website UI (auto-flush included!)
  console.log('💾 Exporting website UI...')
  const result = await canvas.export({
    format: 'png'
  })

  // Save the file (Node.js environment)
  if (result instanceof Buffer) {
    const fs = await import('fs')
    const path = await import('path')
    
    const outputDir = path.join(process.cwd(), 'example', 'output')
    const outputPath = path.join(outputDir, 'website-ui-demo.png')
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    fs.writeFileSync(outputPath, result)
    console.log('✅ Website UI Demo Complete!')
    console.log('📁 Output saved to:', outputPath)
  }
  
  return result
}

// Run the demo
createWebsiteUI().catch(console.error)
