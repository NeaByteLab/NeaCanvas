import { NeaCanvas } from '../src/index'

/**
 * Generates a creative diagonal certificate with dark theme and geometric accents
 * Features diagonal layout elements, circular backgrounds, and asymmetric positioning
 * 
 * @returns Promise<Buffer> - PNG image buffer of the generated certificate
 * @throws Error when certificate generation fails
 */
async function generateCreativeDiagonalCertificate() {
  try {
    console.log('🎨 Generating creative diagonal certificate...')
    
    // Create canvas with creative dimensions
    const canvas = NeaCanvas.init({
      width: 1200,
      height: 800,
      backgroundColor: '#0f172a'
    })
    
    // Create main certificate layout
    const certificate = await canvas.create('certificate', {
      width: 1000,
      height: 600,
      x: 100,
      y: 100,
      backgroundColor: '#1e293b'
    })
    
    // Draw diagonal background elements
    certificate.draw('rectangle', { 
      x: 0, y: 0, width: 1000, height: 600, 
      fill: '#334155', 
      stroke: 'transparent'
    })
    
    // Draw diagonal accent lines
    certificate.draw('line', { 
      x: 0, y: 0, endX: 120, endY: 120, 
      stroke: '#3b82f6', 
      strokeWidth: 2 
    })
    
    certificate.draw('line', { 
      x: 879, y: 120, endX: 999, endY: 0, 
      stroke: '#3b82f6', 
      strokeWidth: 2 
    })
    
    certificate.draw('line', { 
      x: 0, y: 479, endX: 120, endY: 599, 
      stroke: '#3b82f6', 
      strokeWidth: 2 
    })
    
    certificate.draw('line', { 
      x: 879, y: 479, endX: 999, endY: 599, 
      stroke: '#3b82f6', 
      strokeWidth: 2 
    })
    
    // Add inner diagonal lines for depth
    certificate.draw('line', { 
      x: 20, y: 20, endX: 100, endY: 100, 
      stroke: 'rgba(59, 130, 246, 0.5)', 
      strokeWidth: 1 
    })
    
    certificate.draw('line', { 
      x: 899, y: 100, endX: 979, endY: 20, 
      stroke: 'rgba(59, 130, 246, 0.5)', 
      strokeWidth: 1 
    })
    
    certificate.draw('line', { 
      x: 100, y: 499, endX: 20, endY: 579, 
      stroke: 'rgba(59, 130, 246, 0.5)', 
      strokeWidth: 1 
    })
    
    certificate.draw('line', { 
      x: 899, y: 499, endX: 979, endY: 579, 
      stroke: 'rgba(59, 130, 246, 0.5)', 
      strokeWidth: 1 
    })
    
    // Draw geometric background shapes
    certificate.draw('circle', { 
      x: 150, y: 150, radius: 40, 
      fill: 'rgba(59, 130, 246, 0.08)', 
      stroke: 'rgba(59, 130, 246, 0.2)',
      strokeWidth: 1
    })
    
    certificate.draw('circle', { 
      x: 850, y: 150, radius: 40, 
      fill: 'rgba(59, 130, 246, 0.08)', 
      stroke: 'rgba(59, 130, 246, 0.2)',
      strokeWidth: 1
    })
    
    certificate.draw('circle', { 
      x: 150, y: 450, radius: 40, 
      fill: 'rgba(59, 130, 246, 0.08)', 
      stroke: 'rgba(59, 130, 246, 0.2)',
      strokeWidth: 1
    })
    
    certificate.draw('circle', { 
      x: 850, y: 450, radius: 40, 
      fill: 'rgba(59, 130, 246, 0.08)', 
      stroke: 'rgba(59, 130, 246, 0.2)',
      strokeWidth: 1
    })
    
    // Draw main title (diagonal positioning)
    certificate.draw('text', {
      x: 100, y: 120,
      text: 'ACHIEVEMENT',
      fontSize: 48,
      fontFamily: 'Arial, sans-serif',
      fill: '#f8fafc',
      textAlign: 'left',
      textBaseline: 'middle',
      fontStyle: 'bold'
    })
    
    // Draw course name (diagonal)
    certificate.draw('text', {
      x: 100, y: 180,
      text: 'Advanced Canvas Framework Development',
      fontSize: 20,
      fontFamily: 'Arial, sans-serif',
      fill: '#94a3b8',
      textAlign: 'left',
      textBaseline: 'middle'
    })
    
    // Draw divider (diagonal)
    certificate.draw('line', {
      x: 100, y: 220, endX: 400, endY: 220,
      stroke: '#f8fafc', strokeWidth: 3
    })
    
    // Draw main certificate text (diagonal)
    certificate.draw('text', {
      x: 100, y: 280,
      text: 'This certifies that',
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      fill: '#cbd5e1',
      textAlign: 'left',
      textBaseline: 'middle'
    })
    
    // Draw recipient name (diagonal)
    certificate.draw('text', {
      x: 100, y: 340,
      text: 'Dr. Emily Rodriguez',
      fontSize: 42,
      fontFamily: 'Arial, sans-serif',
      fill: '#f8fafc',
      textAlign: 'left',
      textBaseline: 'middle',
      fontStyle: 'bold'
    })
    
    // Draw achievement description (diagonal)
    certificate.draw('multitext', {
      x: 100, y: 400,
      text: 'has demonstrated exceptional excellence and outstanding achievement in the Advanced Canvas Framework Development program, exhibiting mastery of TypeScript, graphics programming, software architecture, and innovative technological solutions.',
      fontSize: 15,
      fontFamily: 'Arial, sans-serif',
      fill: '#94a3b8',
      textAlign: 'left',
      textBaseline: 'middle',
      maxWidth: 500,
      lineHeight: 22
    })
    
    // Draw achievement date (diagonal)
    certificate.draw('text', {
      x: 100, y: 500,
      text: 'Completed on August 16, 2025',
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      fill: '#cbd5e1',
      textAlign: 'left',
      textBaseline: 'middle'
    })
    
    // Draw signature section (diagonal)
    certificate.draw('line', {
      x: 100, y: 540, endX: 300, endY: 540,
      stroke: '#f8fafc', strokeWidth: 2
    })
    
    certificate.draw('text', {
      x: 100, y: 560,
      text: 'Lead Developer',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      fill: '#94a3b8',
      textAlign: 'left',
      textBaseline: 'middle'
    })
    
    certificate.draw('text', {
      x: 100, y: 580,
      text: 'Sarah Kim',
      fontSize: 15,
      fontFamily: 'Arial, sans-serif',
      fill: '#f8fafc',
      textAlign: 'left',
      textBaseline: 'middle',
      fontStyle: 'bold'
    })
    
    // Draw second signature (diagonal)
    certificate.draw('line', {
      x: 600, y: 540, endX: 800, endY: 540,
      stroke: '#f8fafc', strokeWidth: 2
    })
    
    certificate.draw('text', {
      x: 600, y: 560,
      text: 'Tech Lead',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      fill: '#94a3b8',
      textAlign: 'left',
      textBaseline: 'middle'
    })
    
    certificate.draw('text', {
      x: 600, y: 580,
      text: 'Mike Rodriguez',
      fontSize: 15,
      fontFamily: 'Arial, sans-serif',
      fill: '#f8fafc',
      textAlign: 'left',
      textBaseline: 'middle'
    })
    
    // Draw certificate ID (top-right area, kept within bounds)
    certificate.draw('text', {
      x: 860, y: 50,
      text: 'ID: CD-2025-0047',
      fontSize: 12,
      fontFamily: 'Courier New, monospace',
      fill: '#94a3b8',
      textAlign: 'left',
      textBaseline: 'middle'
    })
    
    // Draw authenticity badge (diagonal)
    certificate.draw('circle', {
      x: 850, y: 300, radius: 40,
      fill: 'rgba(59, 130, 246, 0.2)',
      stroke: '#3b82f6',
      strokeWidth: 3
    })
    
    certificate.draw('text', {
      x: 850, y: 300,
      text: '✓',
      fontSize: 24,
      fontFamily: 'Arial, sans-serif',
      fill: '#3b82f6',
      textAlign: 'center',
      textBaseline: 'middle',
      fontStyle: 'bold'
    })
    
    // Draw achievement level indicator
    certificate.draw('text', {
      x: 850, y: 360,
      text: 'LEVEL 99',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fill: '#3b82f6',
      textAlign: 'center',
      textBaseline: 'middle',
      fontStyle: 'bold'
    })
    
    // Export to PNG
    console.log('📤 Exporting certificate...')
    const png = await canvas.export({ format: 'png', quality: 0.95 })
    
    // Save to file (Node.js)
    if (typeof process !== 'undefined') {
      const fs = await import('fs')
      const path = await import('path')
      const outputDir = path.join(process.cwd(), 'example', 'output')
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      const outputPath = path.join(outputDir, 'cert-generator-2.png')
      fs.writeFileSync(outputPath, png as Buffer)
      console.log(`🎉 Creative diagonal certificate saved to: ${outputPath}`)
      console.log(`📊 File size: ${(png as Buffer).length} bytes`)
    } else {
      console.log('🎉 Creative diagonal certificate generated successfully!')
      console.log('📊 Export format: PNG')
    }
    return png
  } catch (error) {
    console.error('❌ Error generating certificate:', error)
    throw error
  }
}

// Run the showcase
if (typeof process !== 'undefined') {
  generateCreativeDiagonalCertificate()
    .then(() => console.log('✅ Creative diagonal certificate generation completed!'))
    .catch(error => console.error('💥 Creative diagonal certificate generation failed:', error))
}

export { generateCreativeDiagonalCertificate }