use wasm_bindgen::prelude::*;
use image::{DynamicImage, RgbaImage, GenericImageView};
use serde::{Deserialize, Serialize};
use std::io::Cursor;
use base64::{Engine as _, engine::general_purpose::STANDARD};

// 只在开发时启用 panic hook
#[cfg(feature = "console_error_panic_hook")]
use console_error_panic_hook::set_once;

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

// 旋转图片（（优化版本：使用最近邻插值，更快）
fn rotate_image(img: &DynamicImage, angle_degrees: f32) -> DynamicImage {
    if angle_degrees == 0.0 {
        return img.clone();
    }
    
    let angle_rad = angle_degrees * std::f32::consts::PI / 180.0;
    let cos_r = angle_rad.cos();
    let sin_r = angle_rad.sin();
    
    let (width, height) = img.dimensions();
    let center_x = width as f32 / 2.0;
    let center_y = height as f32 / 2.0;
    
    // 计算旋转后的新尺寸
    let new_width = (width as f32 * cos_r.abs() + height as f32 * sin_r.abs()).ceil() as u32;
    let new_height = (width as f32 * sin_r.abs() + height as f32 * cos_r.abs()).ceil() as u32;
    
    let mut result = RgbaImage::new(new_width, new_height);
    let new_center_x = new_width as f32 / 2.0;
    let new_center_y = new_height as f32 / 2.0;
    
    // 转换为 RGBA8 以便快速访问
    let img_rgba = img.to_rgba8();
    
    for y in 0..new_height {
        for x in 0..new_width {
            // 将新坐标转换到相对于中心的坐标
            let rel_x = x as f32 - new_center_x;
            let rel_y = y as f32 - new_center_y;
            
            // 逆旋转到原图坐标
            let orig_x = rel_x * cos_r + rel_y * sin_r + center_x;
            let orig_y = -rel_x * sin_r + rel_y * cos_r + center_y;
            
            // 边界检查和最近邻采样（更快）
            let orig_x_u32 = orig_x.round() as i32;
            let orig_y_u32 = orig_y.round() as i32;
            
            if orig_x_u32 >= 0 && orig_x_u32 < width as i32 &&
               orig_y_u32 >= 0 && orig_y_u32 < height as i32 {
                let pixel = img_rgba.get_pixel(orig_x_u32 as u32, orig_y_u32 as u32);
                result.put_pixel(x, y, *pixel);
            }
        }
    }
    
    DynamicImage::ImageRgba8(result)
}

// 添加文字水印（现在使用客户端渲染的图片）
fn add_text_watermark(
    img: &mut DynamicImage,
    config: &WatermarkConfig,
) -> Result<(), String> {
    let image_data = config.image_data.as_ref()
        .ok_or("Text watermark requires image_data parameter (rendered by client)")?;
    let transparency = config.transparency.unwrap_or(0.5);
    let rotate = config.rotate.unwrap_or(0.0);
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
    
    // 旋转图片
    watermark_img = rotate_image(&watermark_img, rotate);
    
    let (img_width, img_height) = img.dimensions();
    let (wm_width, wm_height) = watermark_img.dimensions();
    
    // 转换为 RGBA8（优化：不再预先应用透明度）
    let watermark_rgba = watermark_img.to_rgba8();
    
    if tile {
        // 平铺水印 - 优化版本：只转换一次目标图片
        let spacing_x = wm_width + x_offset.abs() as u32;
        let spacing_y = wm_height + y_offset.abs() as u32;
        
        // 计算起始位置（考虑偏移量）
        let start_x = if x_offset >= 0 {
            x_offset as u32
        } else {
            0
        };
        
        let start_y = if y_offset >= 0 {
            y_offset as u32
        } else {
            0
        };
        
        // 只转换一次目标图片为 RGBA8
        let mut target_rgba = img.to_rgba8();
        
        for y in (start_y..img_height).step_by(spacing_y as usize) {
            for x in (start_x..img_width).step_by(spacing_x as usize) {
                overlay_image_rgba_with_transparency(&mut target_rgba, &watermark_rgba, x, y, transparency);
            }
        }
        
        // 转换回 DynamicImage
        *img = DynamicImage::ImageRgba8(target_rgba);
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
        
        overlay_image_with_transparency(img, &watermark_rgba, x, y, transparency);
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
    let rotate = config.rotate.unwrap_or(0.0);
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
    
    // 旋转图片
    watermark_img = rotate_image(&watermark_img, rotate);
    
    let (img_width, img_height) = img.dimensions();
    let (wm_width, wm_height) = watermark_img.dimensions();
    
    // 转换为 RGBA8（优化：不再预先应用透明度）
    let watermark_rgba = watermark_img.to_rgba8();
    
    if tile {
        // 平铺水印 - 优化版本：只转换一次目标图片
        let spacing_x = wm_width + x_offset.abs() as u32;
        let spacing_y = wm_height + y_offset.abs() as u32;
        
        // 计算起始位置（考虑偏移量）
        let start_x = if x_offset >= 0 {
            x_offset as u32
        } else {
            0
        };
        
        let start_y = if y_offset >= 0 {
            y_offset as u32
        } else {
            0
        };
        
        // 只转换一次目标图片为 RGBA8
        let mut target_rgba = img.to_rgba8();
        
        for y in (start_y..img_height).step_by(spacing_y as usize) {
            for x in (start_x..img_width).step_by(spacing_x as usize) {
                overlay_image_rgba_with_transparency(&mut target_rgba, &watermark_rgba, x, y, transparency);
            }
        }
        
        // 转换回 DynamicImage
        *img = DynamicImage::ImageRgba8(target_rgba);
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
        
        overlay_image_with_transparency(img, &watermark_rgba, x, y, transparency);
    }
    
    Ok(())
}

// 叠加图片（直接操作 RGBA8，带透明度参数，优化版本）
fn overlay_image_rgba_with_transparency(
    target: &mut RgbaImage,
    overlay: &RgbaImage,
    x: u32,
    y: u32,
    transparency: f32
) {
    let (target_width, target_height) = target.dimensions();
    let (overlay_width, overlay_height) = overlay.dimensions();
    
    for oy in 0..overlay_height {
        for ox in 0..overlay_width {
            let target_x = x + ox;
            let target_y = y + oy;
            
            if target_x >= target_width || target_y >= target_height {
                continue;
            }
            
            let overlay_pixel = overlay.get_pixel(ox, oy);
            let target_pixel = target.get_pixel_mut(target_x, target_y);
            
            // 直接应用透明度，避免重复计算
            let alpha = overlay_pixel[3] as f32 / 255.0 * transparency;
            if alpha > 0.0 {
                let inv_alpha = 1.0 - alpha;
                target_pixel[0] = (target_pixel[0] as f32 * inv_alpha + overlay_pixel[0] as f32 * alpha) as u8;
                target_pixel[1] = (target_pixel[1] as f32 * inv_alpha + overlay_pixel[1] as f32 * alpha) as u8;
                target_pixel[2] = (target_pixel[2] as f32 * inv_alpha + overlay_pixel[2] as f32 * alpha) as u8;
                target_pixel[3] = (target_pixel[3] as f32 * inv_alpha + overlay_pixel[3] as f32 * alpha) as u8;
            }
        }
    }
}

// 叠加图片（带透明度，兼容旧接口）
fn overlay_image_with_transparency(target: &mut DynamicImage, overlay: &RgbaImage, x: u32, y: u32, transparency: f32) {
    let mut target_rgba = target.to_rgba8();
    overlay_image_rgba_with_transparency(&mut target_rgba, overlay, x, y, transparency);
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
    #[cfg(feature = "console_error_panic_hook")]
    set_once();
}