/**
 * 图片水印工具类
 * 使用Rust编译的WASM模块处理图片水印
 *
 * 注意：此文件现在作为合并后的 watermark.js 的简化接口
 * 所有功能已合并到 pkg/watermark.js
 */

// 从合并的模块中重新导出所有功能
export {
  add_watermark,
  add_watermark_async,
  renderTextToImage,
  addWatermark,
  addWatermarkAsync,
  isImageFile,
  defaultWatermarkConfig,
  createTextWatermarkConfig,
  createImageWatermarkConfig,
  init as initWasm,
  default as init
} from './pkg/watermark.js';