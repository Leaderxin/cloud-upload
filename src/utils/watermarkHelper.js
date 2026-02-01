/**
 * 图片水印工具类
 * 使用Rust编译的WASM模块处理图片水印
 */

let wasmModule = null;
let wasmInitialized = false;

/**
 * 初始化WASM模块
 */
async function initWasm() {
  if (wasmInitialized) {
    return wasmModule;
  }

  try {
    // 动态导入WASM模块
    const module = await import('../../wasm-watermark/pkg/wasm_watermark.js');
    await module.default();
    wasmModule = module;
    wasmInitialized = true;
    return wasmModule;
  } catch (error) {
    console.error('Failed to initialize WASM module:', error);
    throw new Error('WASM模块初始化失败，请确保已正确构建wasm-watermark项目');
  }
}

/**
 * 添加水印到图片
 * @param {File|Blob|ArrayBuffer} image - 图片文件或数据
 * @param {Object} config - 水印配置
 * @returns {Promise<Blob>} - 处理后的图片Blob
 */
export async function addWatermark(image, config) {
  const module = await initWasm();

  // 将图片转换为ArrayBuffer
  let imageBuffer;
  if (image instanceof File || image instanceof Blob) {
    imageBuffer = await image.arrayBuffer();
  } else if (image instanceof ArrayBuffer) {
    imageBuffer = image;
  } else {
    throw new Error('不支持的图片格式，请提供File、Blob或ArrayBuffer');
  }

  const imageData = new Uint8Array(imageBuffer);

  try {
    // 调用WASM函数添加水印
    const result = module.add_watermark(imageData, config);
    
    // 将结果转换为Blob
    const blob = new Blob([result], { type: 'image/png' });
    return blob;
  } catch (error) {
    console.error('添加水印失败:', error);
    throw error;
  }
}

/**
 * 异步添加水印（支持大文件）
 * @param {File|Blob|ArrayBuffer} image - 图片文件或数据
 * @param {Object} config - 水印配置
 * @returns {Promise<Blob>} - 处理后的图片Blob
 */
export async function addWatermarkAsync(image, config) {
  const module = await initWasm();

  // 将图片转换为ArrayBuffer
  let imageBuffer;
  if (image instanceof File || image instanceof Blob) {
    imageBuffer = await image.arrayBuffer();
  } else if (image instanceof ArrayBuffer) {
    imageBuffer = image;
  } else {
    throw new Error('不支持的图片格式，请提供File、Blob或ArrayBuffer');
  }

  const imageData = new Uint8Array(imageBuffer);

  try {
    // 调用WASM异步函数添加水印
    const result = await module.add_watermark_async(imageData, config);
    
    // 将结果转换为Blob
    const blob = new Blob([result], { type: 'image/png' });
    return blob;
  } catch (error) {
    console.error('添加水印失败:', error);
    throw error;
  }
}

/**
 * 检查是否为图片文件
 * @param {File} file - 文件对象
 * @returns {boolean}
 */
export function isImageFile(file) {
  if (!file || !file.type) {
    return false;
  }
  return file.type.startsWith('image/');
}

/**
 * 默认水印配置
 */
export const defaultWatermarkConfig = {
  // 水印类型：text 或 image
  type: 'text',
  
  // 文字水印参数
  text: '水印文字',
  font: 'Arial',
  font_size: 30,
  font_color: '#FFFFFF',
  transparency: 0.5,
  rotate: 0,
  x_offset: 10,
  y_offset: 10,
  tile: false,
  
  // 图片水印参数
  image_data: null, // base64编码的图片数据
  width: null,
  height: null,
};

/**
 * 创建文字水印配置
 * @param {Object} options - 配置选项
 * @returns {Object} - 水印配置对象
 */
export function createTextWatermarkConfig(options = {}) {
  return {
    type: 'text',
    text: options.text || '水印文字',
    font: options.font || 'Arial',
    font_size: options.fontSize || 30,
    font_color: options.fontColor || '#FFFFFF',
    transparency: options.transparency !== undefined ? options.transparency : 0.5,
    rotate: options.rotate || 0,
    x_offset: options.xOffset !== undefined ? options.xOffset : 10,
    y_offset: options.yOffset !== undefined ? options.yOffset : 10,
    tile: options.tile || false,
  };
}

/**
 * 创建图片水印配置
 * @param {Object} options - 配置选项
 * @returns {Object} - 水印配置对象
 */
export function createImageWatermarkConfig(options = {}) {
  return {
    type: 'image',
    image_data: options.imageData, // base64编码的图片数据
    width: options.width,
    height: options.height,
    transparency: options.transparency !== undefined ? options.transparency : 0.5,
    rotate: options.rotate || 0,
    x_offset: options.xOffset !== undefined ? options.xOffset : 10,
    y_offset: options.yOffset !== undefined ? options.yOffset : 10,
    tile: options.tile || false,
  };
}