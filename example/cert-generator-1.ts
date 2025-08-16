import { NeaCanvas } from '../src/index'

/**
 * Generates a professional certificate with traditional design elements
 * Creates a centered layout with borders, typography hierarchy, and signature sections
 * 
 * @returns Promise<Buffer> - PNG image buffer of the generated certificate
 * @throws Error when certificate generation fails
 */
async function generateCertificate() {
  try {
    console.log('🎓 Generating professional certificate...')
    
    // Create canvas with professional dimensions
    const canvas = NeaCanvas.init({
      width: 1200,
      height: 800,
      backgroundColor: '#f8f9fa'
    })
    
    // Create main certificate layout with proper margins
    const certificate = await canvas.create('certificate', {
      width: 1000,
      height: 600,
      x: 100,
      y: 100,
      backgroundColor: '#ffffff'
    })
    
    // Draw outer border
    certificate.draw('rectangle', { 
      x: 0, y: 0, width: 1000, height: 600, 
      fill: 'transparent', 
      stroke: '#2c3e50', 
      strokeWidth: 3 
    })
    
    // Draw inner border for depth
    certificate.draw('rectangle', { 
      x: 15, y: 15, width: 970, height: 570, 
      fill: 'transparent', 
      stroke: '#34495e', 
      strokeWidth: 1 
    })
    
    // Draw corner accents
    certificate.draw('line', { x: 30, y: 30, endX: 80, endY: 30, stroke: '#7f8c8d', strokeWidth: 2 })
    certificate.draw('line', { x: 30, y: 30, endX: 30, endY: 80, stroke: '#7f8c8d', strokeWidth: 2 })
    
    certificate.draw('line', { x: 920, y: 30, endX: 970, endY: 30, stroke: '#7f8c8d', strokeWidth: 2 })
    certificate.draw('line', { x: 970, y: 30, endX: 970, endY: 80, stroke: '#7f8c8d', strokeWidth: 2 })
    
    certificate.draw('line', { x: 30, y: 520, endX: 80, endY: 520, stroke: '#7f8c8d', strokeWidth: 2 })
    certificate.draw('line', { x: 30, y: 520, endX: 30, endY: 570, stroke: '#7f8c8d', strokeWidth: 2 })
    
    certificate.draw('line', { x: 920, y: 520, endX: 970, endY: 520, stroke: '#7f8c8d', strokeWidth: 2 })
    certificate.draw('line', { x: 970, y: 520, endX: 970, endY: 570, stroke: '#7f8c8d', strokeWidth: 2 })
    
    // Certificate number (top)
    certificate.draw('text', {
      x: 500, y: 80,
      text: 'Certificate #: NC-2024-00151',
      fontSize: 12,
      fontFamily: 'Courier New, monospace',
      fill: '#95a5a6',
      textAlign: 'center',
      textBaseline: 'middle'
    })

    // Draw main title with proper hierarchy
    certificate.draw('text', {
      x: 500, y: 120,
      text: 'CERTIFICATE OF COMPLETION',
      fontSize: 32,
      fontFamily: 'Georgia, serif',
      fill: '#2c3e50',
      textAlign: 'center',
      textBaseline: 'middle',
      fontStyle: 'bold'
    })
    
    // Draw course name (subtitle)
    certificate.draw('text', {
      x: 500, y: 160,
      text: 'Advanced Canvas Framework Development',
      fontSize: 18,
      fontFamily: 'Arial, sans-serif',
      fill: '#7f8c8d',
      textAlign: 'center',
      textBaseline: 'middle'
    })
    
    // Draw main certificate text with proper spacing
    certificate.draw('text', {
      x: 500, y: 220,
      text: 'This is to certify that',
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      fill: '#34495e',
      textAlign: 'center',
      textBaseline: 'middle'
    })
    
    // Draw recipient name
    certificate.draw('text', {
      x: 500, y: 280,
      text: 'John Michael Doe',
      fontSize: 36,
      fontFamily: 'Georgia, serif',
      fill: '#2c3e50',
      textAlign: 'center',
      textBaseline: 'middle',
      fontStyle: 'bold'
    })
    
    // Draw achievement description
    certificate.draw('multitext', {
      x: 500, y: 340,
      text: 'has successfully completed the Advanced Canvas Framework Development course with outstanding performance and demonstrated exceptional skills in TypeScript, graphics programming, and software architecture.',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fill: '#5a6c7d',
      textAlign: 'center',
      textBaseline: 'middle',
      maxWidth: 800,
      lineHeight: 20
    })
    
    // Draw achievement date
    certificate.draw('text', {
      x: 500, y: 420,
      text: 'Awarded on 16 Aug 2025',
      fontSize: 16,
      fontFamily: 'Georgia, serif',
      fill: '#7f8c8d',
      textAlign: 'center',
      textBaseline: 'middle'
    })
    
    // Draw signature section
    certificate.draw('line', {
      x: 200, y: 500, endX: 350, endY: 500,
      stroke: '#2c3e50', strokeWidth: 2
    })
    
    certificate.draw('text', {
      x: 275, y: 520,
      text: 'Course Director',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fill: '#7f8c8d',
      textAlign: 'center',
      textBaseline: 'middle'
    })
    
    certificate.draw('text', {
      x: 275, y: 540,
      text: 'Dr. Sarah Johnson',
      fontSize: 16,
      fontFamily: 'Georgia, serif',
      fill: '#2c3e50',
      textAlign: 'center',
      textBaseline: 'middle'
    })
    
    // Draw second signature
    certificate.draw('line', {
      x: 650, y: 500, endX: 800, endY: 500,
      stroke: '#2c3e50', strokeWidth: 2
    })
    
    certificate.draw('text', {
      x: 725, y: 520,
      text: 'Academic Dean',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fill: '#7f8c8d',
      textAlign: 'center',
      textBaseline: 'middle'
    })
    
    certificate.draw('text', {
      x: 725, y: 540,
      text: 'Prof. Michael Chen',
      fontSize: 16,
      fontFamily: 'Georgia, serif',
      fill: '#2c3e50',
      textAlign: 'center',
      textBaseline: 'middle'
    })
    
    
    
    // Draw authenticity seal
    certificate.draw('circle', {
      x: 850, y: 150, radius: 40,
      fill: 'transparent',
      stroke: '#e74c3c',
      strokeWidth: 2
    })
    
    certificate.draw('text', {
      x: 850, y: 150,
      text: 'SEAL',
      fontSize: 12,
      fontFamily: 'Georgia, serif',
      fill: '#e74c3c',
      textAlign: 'center',
      textBaseline: 'middle',
      fontStyle: 'bold'
    })

    // Export to PNG with high quality
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
      const outputPath = path.join(outputDir, 'cert-generator-1.png')
      fs.writeFileSync(outputPath, png as Buffer)
      console.log(`🎉 Certificate saved to: ${outputPath}`)
      console.log(`📊 File size: ${(png as Buffer).length} bytes`)
    } else {
      console.log('🎉 Certificate generated successfully!')
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
  generateCertificate()
    .then(() => console.log('✅ Certificate generation completed!'))
    .catch(error => console.error('💥 Certificate generation failed:', error))
}

export { generateCertificate }
