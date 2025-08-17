# 🎨 NeaCanvas ✨

![Version](https://img.shields.io/badge/version-0.1.3-blue)
![License](https://img.shields.io/badge/license-PROPRIETARY-red)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-green)
![TypeScript](https://img.shields.io/badge/typescript-%3E%3D5.9.0-blue)

⚠️ **ALPHA VERSION 0.1.3 - NOT FOR PRODUCTION USE**

Universal canvas framework for Node.js and browser environments with TypeScript support.

> **Personal Use Only** - Commercial license required for business/production use. See [LICENSE](LICENSE) for details.

## 🚀 Features

- **2D Graphics**: Comprehensive drawing primitives and tools
- **Universal Runtime**: Works in Node.js and browser environments
- **TypeScript**: Full TypeScript support with strict typing
- **Performance**: Optimized rendering with NeaSmart batching and caching
- **Extensible**: Plugin architecture for custom functionality
- **Export Support**: PNG, JPEG, SVG, and PDF export

## 📦 Installation

**GitHub Release Only** (Not yet published to npm)

```bash
# Clone from GitHub
git clone https://github.com/NeaByteLab/NeaCanvas.git
cd NeaCanvas
npm install
npm run build

# Or install directly from GitHub
npm install github:NeaByteLab/NeaCanvas
```

## 🚀 Quick Start

```typescript
import { NeaCanvas } from './src/index' // Local development
// or
import { NeaCanvas } from '@neabyte/canvas' // After GitHub install

// Create canvas instance
const canvas = NeaCanvas.init({
  width: 800,
  height: 600,
  backgroundColor: '#ffffff'
})

// Create a layout
const layout = await canvas.create('main', {
  width: 600,
  height: 400,
  x: 100,
  y: 100
})

// Draw shapes on the layout
layout.draw('rectangle', {
  x: 0,
  y: 0,
  width: 200,
  height: 100,
  fill: '#ff6b6b'
})

layout.draw('circle', {
  x: 300,
  y: 150,
  radius: 80,
  fill: '#4ecdc4'
})

layout.draw('text', {
  x: 50,
  y: 200,
  text: 'Hello NeaCanvas!',
  fill: '#2d3436',
  fontSize: 24
})

// Render in browser
canvas.render()

// Export as image
const pngData = await canvas.export({ format: 'png', quality: 0.9 })
```

---

## ⚙️ Requirements

- Node.js 20.0.0 or higher
- TypeScript 5.9.0 or higher

## 🎯 Examples

Check out the `/example` directory for complete examples:
- `cert-generator-1.ts` - Professional certificate generation
- `cert-generator-2.ts` - Creative diagonal certificate
- `bar-chart-1.ts` - Business dashboard with charts
- `website-ui-demo.ts` - Multi-layout website UI
- `multi-layout-demo.ts` - Basic multi-layout concept

## 🔄 Development Status

- ✅ Core framework architecture
- ✅ Multi-layout system with auto-flush
- ✅ Comprehensive validation system
- ✅ Universal Node.js + Browser support
- ✅ Export system (PNG, JPEG, SVG, PDF)
- 🚧 Animation system with easing functions (in development)
- 🚧 Advanced examples (expanding)
- 🚧 Interactive web features (planned)
- 🚧 3D rendering capabilities (planned)
- 🚧 WebGL GPU integration (planned)
- 🚧 Performance optimizations (in progress)
- 🚧 Advanced examples (expanding)
- 🚧 Plugin system (planned)

## 📄 License

**Personal Use Only** - See [LICENSE](LICENSE) for complete terms.

For commercial, production, or business use, contact us for a commercial license:
- See [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md) for commercial terms
- Email: me@neabyte.com

## 📞 Contact & Support

- **Email**: me@neabyte.com
- **GitHub**: [NeaByteLab](https://github.com/NeaByteLab)
- **Issues**: [GitHub Issues](https://github.com/NeaByteLab/NeaCanvas/issues)

---

**⚡ Built with TypeScript, designed for enterprise, licensed for personal use.**
