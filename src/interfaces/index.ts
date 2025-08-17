/**
 * Public interfaces for NeaCanvas users
 * Only exports interfaces that end users need to interact with
 * @public - These are the only interfaces exposed to users
 */

// ✅ PUBLIC - Core configuration interfaces users need
export type {
  CanvasConfig,
  LayoutConfig,
  DrawConfig,
  ExportConfig
} from '@interfaces/NeaOptions'

// 🔒 INTERNAL - Framework interfaces are not exported
// Users don't need: NeaExport, NeaLayout, NeaSmart interfaces
// Framework components import these directly when needed
