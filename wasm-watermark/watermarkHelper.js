/**
 * 图片水印工具类
 * 使用Rust编译的WASM模块处理图片水印
 */

let wasmModule = null;
let wasmInitialized = false;

/**
 * 使用 Canvas 渲染文字为图片
 * @param {string} text - 要渲染的文字
 * @param {number} fontSize - 字体大小
 * @param {string} color - 字体颜色（十六进制）
 * @param {string} imageType - 图片 MIME 类型（如 'image/jpeg', 'image/png'），默认为 'image/png'
 * @returns {string} - base64 编码的图片数据
 */
function renderTextToImage(text, fontSize, color, imageType = 'image/png') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 设置字体
  ctx.font = `${fontSize}px Arial, sans-serif`;
  
  // 测量文字尺寸
  const metrics = ctx.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  
  // 获取字体的实际高度（使用 fontBoundingBox 更准确）
  const fontBoundingBoxAscent = metrics.fontBoundingBoxAscent;
  const fontBoundingBoxDescent = metrics.fontBoundingBoxDescent;
  const textHeight = Math.ceil(fontBoundingBoxAscent + fontBoundingBoxDescent);
  
  // 设置画布大小（增加 padding 确保完整）
  const padding = 5;
  canvas.width = textWidth + padding * 2;
  canvas.height = textHeight + padding * 2;
  
  // 重新设置字体（因为改变画布大小会重置上下文）
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  
  // 绘制文字（从基线位置开始，考虑 padding）
  ctx.fillText(text, padding, padding + fontBoundingBoxAscent);
  
  // 转换为 base64，使用指定的图片类型
  return canvas.toDataURL(imageType);
}

/**
 * 初始化WASM模块
 */
async function initWasm() {
  if (wasmInitialized) {
    return wasmModule;
  }

  try {
    // 动态导入WASM模块
    const module = await import('./pkg/wasm_watermark.js');
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
  let imageType = 'image/png'; // 默认图片类型
  if (image instanceof File || image instanceof Blob) {
    imageBuffer = await image.arrayBuffer();
    // 获取原始文件的 MIME 类型
    imageType = image.type || 'image/png';
  } else if (image instanceof ArrayBuffer) {
    imageBuffer = image;
  } else {
    throw new Error('不支持的图片格式，请提供File、Blob或ArrayBuffer');
  }

  const imageData = new Uint8Array(imageBuffer);

  try {
    // 调用WASM函数添加水印
    const result = module.add_watermark(imageData, config);
    
    // 将结果转换为Blob，使用原始图片类型
    const blob = new Blob([result], { type: imageType });
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
  let imageType = 'image/png'; // 默认图片类型
  if (image instanceof File || image instanceof Blob) {
    imageBuffer = await image.arrayBuffer();
    // 获取原始文件的 MIME 类型
    imageType = image.type || 'image/png';
  } else if (image instanceof ArrayBuffer) {
    imageBuffer = image;
  } else {
    throw new Error('不支持的图片格式，请提供File、Blob或ArrayBuffer');
  }

  const imageData = new Uint8Array(imageBuffer);

  // 处理文字水印水印：自动渲染文字为图片
  let finalConfig = { ...config };
  if (config.type === 'text' && config.text) {
    try {
      // 使用客户端 Canvas 渲染文字，传入原始图片类型
      const textImageData = renderTextToImage(
        config.text,
        config.font_size || 30,
        config.font_color || '#FFFFFF',
        imageType
      );
      // 将渲染的文字图片作为 image_data
      finalConfig.image_data = textImageData;
      console.log('文字水印已渲染为图片，类型:', imageType);
    } catch (error) {
      console.error('渲染文字失败:', error);
      throw new Error('渲染文字失败: ' + error.message);
    }
  }

  try {
    // 调用WASM异步函数添加水印
    const result = await module.add_watermark_async(imageData, finalConfig);
    
    // 将结果转换为Blob，使用原始图片类型
    const blob = new Blob([result], { type: imageType });
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
  transparency: 0.5, // 不透明度，范围 0-1，0 为完全透明，1 为完全不透明
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
 * @param {string} options.text - 水印文字
 * @param {string} options.font - 字体名称
 * @param {number} options.fontSize - 字体大小
 * @param {string} options.fontColor - 字体颜色（十六进制）
 * @param {number} options.transparency - 不透明度，范围 0-1，0 为完全透明，1 为完全不透明
 * @param {number} options.rotate - 旋转角度（度）
 * @param {number} options.xOffset - X轴偏移量
 * @param {number} options.yOffset - Y轴偏移量
 * @param {boolean} options.tile - 是否平铺
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
 * @param {string} options.imageData - base64编码的图片数据
 * @param {number} options.width - 图片宽度
 * @param {number} options.height - 图片高度
 * @param {number} options.transparency - 不透明度，范围 0-1，0 为完全透明，1 为完全不透明
 * @param {number} options.rotate - 旋转角度（度）
 * @param {number} options.xOffset - X轴偏移量
 * @param {number} options.yOffset - Y轴偏移量
 * @param {boolean} options.tile - 是否平铺
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