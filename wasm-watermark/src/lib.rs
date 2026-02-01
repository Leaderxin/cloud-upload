use wasm_bindgen::prelude::*;
use image::{DynamicImage, RgbaImage, GenericImageView};
use serde::{Deserialize, Serialize};
use std::io::Cursor;
use base64::{Engine as _, engine::general_purpose::STANDARD};

// 水印配置结构体
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatermarkConfig {
    // 水印类型：text 或 image
    #[serde(rename = "type")]
    pub watermark_type: String,
    
    // 文字水印参数（现在由客户端渲染）
    #[serde(default)]
    pub text: Option<String>,
    #[serde(default)]
    pub font: Option<String>,
    #[serde(default)]
    pub font_size: Option<u32>,
    #[serde(default)]
    pub font_color: Option<String>,
    #[serde(default)]
    pub transparency: Option<f32>,
    #[serde(default)]
    pub rotate: Option<f32>,
    #[serde(default)]
    pub x_offset: Option<i32>,
    #[serde(default)]
    pub y_offset: Option<i32>,
    #[serde(default)]
    pub tile: Option<bool>,
    
    // 图片水印参数
    #[serde(default)]
    pub image_data: Option<String>, // base64编码的图片数据
    #[serde(default)]
    pub width: Option<u32>,
    #[serde(default)]
    pub height: Option<u32>,
}

impl Default for WatermarkConfig {
    fn default() -> Self {
        Self {
            watermark_type: "text".to_string(),
            text: None,
            font: None,
            font_size: Some(30),
            font_color: Some("#FFFFFF".to_string()),
            transparency: Some(0.5),
            rotate: Some(0.0),
            x_offset: Some(10),
            y_offset: Some(10),
            tile: Some(false),
            image_data: None,
            width: None,
            height: None,
        }
    }
}

// 错误处理
#[wasm_bindgen]
pub struct WatermarkError {
    message: String,
}

#[wasm_bindgen]
impl WatermarkError {
    #[wasm_bindgen(getter)]
    pub fn message(&self) -> String {
        self.message.clone()
    }
}

// 添加文字水印（现在使用客户端渲染的图片）
fn add_text_watermark(
    img: &mut DynamicImage,
    config: &WatermarkConfig,
) -> Result<(), String> {
    let image_data = config.image_data.as_ref()
        .ok_or("Text watermark requires image_data parameter (rendered by client)")?;
    let transparency = config.transparency.unwrap_or(0.5);
    let _rotate = config.rotate.unwrap_or(0.0);
    let x_offset = config.x_offset.unwrap_or(10);
    let y_offset = config.y_offset.unwrap_or(10);
    let tile = config.tile.unwrap_or(false);
    
    // 解码base64图片数据（客户端渲染的文字图片）
    let base64_data = image_data.trim_start_matches("data:image/");
    let base64_data = base64_data.split(',').nth(1).unwrap_or(image_data);
    
    let image_bytes = STANDARD.decode(base64_data)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;
    
    let mut watermark_img = image::load_from_memory(&image_bytes)
        .map_err(|e| format!("Failed to load watermark image: {}", e))?;
    
    // 调整水印图片大小
    if let Some(width) = config.width {
        let height = config.height.unwrap_or((watermark_img.height() * width) / watermark_img.width());
        watermark_img = watermark_img.resize(width, height, image::imageops::FilterType::Lanczos3);
    }
    
    let (img_width, img_height) = img.dimensions();
    let (wm_width, wm_height) = watermark_img.dimensions();
    
    // 应用透明度
    let mut watermark_rgba = watermark_img.to_rgba8();
    for pixel in watermark_rgba.pixels_mut() {
        pixel[3] = (pixel[3] as f32 * transparency) as u8;
    }
    
    if tile {
        // 平铺水印
        let spacing_x = wm_width + x_offset as u32;
        let spacing_y = wm_height + y_offset as u32;
        
        for y in (0..img_height).step_by(spacing_y as usize) {
            for x in (0..img_width).step_by(spacing_x as usize) {
                overlay_image(img, &watermark_rgba, x, y);
            }
        }
    } else {
        // 单个水印
        let x = if x_offset >= 0 {
            x_offset as u32
        } else {
            (img_width as i32 + x_offset).max(0) as u32
        };
        
        let y = if y_offset >= 0 {
            y_offset as u32
        } else {
            (img_height as i32 + y_offset).max(0) as u32
        };
        
        overlay_image(img, &watermark_rgba, x, y);
    }
    
    Ok(())
}

// 添加图片水印
fn add_image_watermark(
    img: &mut DynamicImage,
    config: &WatermarkConfig,
) -> Result<(), String> {
    let image_data = config.image_data.as_ref().ok_or("Image watermark requires image_data parameter")?;
    let transparency = config.transparency.unwrap_or(0.5);
    let _rotate = config.rotate.unwrap_or(0.0);
    let x_offset = config.x_offset.unwrap_or(10);
    let y_offset = config.y_offset.unwrap_or(10);
    let tile = config.tile.unwrap_or(false);
    
    // 解码base64图片数据
    let base64_data = image_data.trim_start_matches("data:image/");
    let base64_data = base64_data.split(',').nth(1).unwrap_or(image_data);
    
    let image_bytes = STANDARD.decode(base64_data)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;
    
    let mut watermark_img = image::load_from_memory(&image_bytes)
        .map_err(|e| format!("Failed to load watermark image: {}", e))?;
    
    // 调整水印图片大小
    if let Some(width) = config.width {
        let height = config.height.unwrap_or((watermark_img.height() * width) / watermark_img.width());
        watermark_img = watermark_img.resize(width, height, image::imageops::FilterType::Lanczos3);
    }
    
    let (img_width, img_height) = img.dimensions();
    let (wm_width, wm_height) = watermark_img.dimensions();
    
    // 应用透明度
    let mut watermark_rgba = watermark_img.to_rgba8();
    for pixel in watermark_rgba.pixels_mut() {
        pixel[3] = (pixel[3] as f32 * transparency) as u8;
    }
    
    if tile {
        // 平铺水印
        let spacing_x = wm_width + x_offset as u32;
        let spacing_y = wm_height + y_offset as u32;
        
        for y in (0..img_height).step_by(spacing_y as usize) {
            for x in (0..img_width).step_by(spacing_x as usize) {
                overlay_image(img, &watermark_rgba, x, y);
            }
        }
    } else {
        // 单个水印
        let x = if x_offset >= 0 {
            x_offset as u32
        } else {
            (img_width as i32 + x_offset).max(0) as u32
        };
        
        let y = if y_offset >= 0 {
            y_offset as u32
        } else {
            (img_height as i32 + y_offset).max(0) as u32
        };
        
        overlay_image(img, &watermark_rgba, x, y);
    }
    
    Ok(())
}

// 叠加图片
fn overlay_image(target: &mut DynamicImage, overlay: &RgbaImage, x: u32, y: u32) {
    let mut target_rgba = target.to_rgba8();
    let (target_width, target_height) = target_rgba.dimensions();
    let (overlay_width, overlay_height) = overlay.dimensions();
    
    for oy in 0..overlay_height {
        for ox in 0..overlay_width {
            let target_x = x + ox;
            let target_y = y + oy;
            
            if target_x >= target_width || target_y >= target_height {
                continue;
            }
            
            let overlay_pixel = overlay.get_pixel(ox, oy);
            let target_pixel = target_rgba.get_pixel_mut(target_x, target_y);
            
            let alpha = overlay_pixel[3] as f32 / 255.0;
            if alpha > 0.0 {
                target_pixel[0] = (target_pixel[0] as f32 * (1.0 - alpha) + overlay_pixel[0] as f32 * alpha) as u8;
                target_pixel[1] = (target_pixel[1] as f32 * (1.0 - alpha) + overlay_pixel[1] as f32 * alpha) as u8;
                target_pixel[2] = (target_pixel[2] as f32 * (1.0 - alpha) + overlay_pixel[2] as f32 * alpha) as u8;
                target_pixel[3] = (target_pixel[3] as f32 * (1.0 - alpha) + overlay_pixel[3] as f32 * alpha) as u8;
            }
        }
    }
    
    *target = DynamicImage::ImageRgba8(target_rgba);
}

// WASM导出函数：添加水印
#[wasm_bindgen]
pub fn add_watermark(
    image_data: &[u8],
    config_js: JsValue,
) -> Result<Vec<u8>, JsValue> {
    // 解析配置
    let config: WatermarkConfig = serde_wasm_bindgen::from_value(config_js)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse config: {}", e)))?;
    
    // 加载图片
    let mut img = image::load_from_memory(image_data)
        .map_err(|e| JsValue::from_str(&format!("Failed to load image: {}", e)))?;
    
    // 根据类型添加水印
    match config.watermark_type.as_str() {
        "text" => {
            add_text_watermark(&mut img, &config)
                .map_err(|e| JsValue::from_str(&format!("Failed to add text watermark: {}", e)))?;
        }
        "image" => {
            add_image_watermark(&mut img, &config)
                .map_err(|e| JsValue::from_str(&format!("Failed to add image watermark: {}", e)))?;
        }
        _ => {
            return Err(JsValue::from_str("Invalid watermark type. Use 'text' or 'image'"));
        }
    }
    
    // 编码为PNG
    let mut buffer = Vec::new();
    img.write_to(&mut Cursor::new(&mut buffer), image::ImageFormat::Png)
        .map_err(|e| JsValue::from_str(&format!("Failed to encode image: {}", e)))?;
    
    Ok(buffer)
}

// WASM导出函数：批量添加水印
#[wasm_bindgen]
pub async fn add_watermark_async(
    image_data: &[u8],
    config_js: JsValue,
) -> Result<Vec<u8>, JsValue> {
    // 使用wasm-bindgen-futures来支持异步操作
    add_watermark(image_data, config_js)
}

// 初始化函数
#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
}