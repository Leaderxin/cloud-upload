# WASM 图片水印模块

这是一个使用Rust编写的WebAssembly模块，用于在浏览器端为图片添加水印。

## 功能特性

- 支持文字水印
- 支持图片水印
- 支持透明度调节
- 支持旋转角度
- 支持位置偏移
- 支持平铺模式
- 高性能处理（基于Rust + WASM）

## 构建要求

### 1. 安装Rust工具链

```bash
# Windows (使用rustup)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 或者访问 https://rustup.rs/ 下载安装程序
```

### 2. 安装wasm-pack

```bash
cargo install wasm-pack
```

### 3. 添加wasm32目标

```bash
rustup target add wasm32-unknown-unknown
```

## 构建步骤

### 方法1：使用构建脚本（推荐）

```bash
cd wasm-watermark
bash build.sh
```

### 方法2：手动构建

```bash
cd wasm-watermark
wasm-pack build --target web --out-dir pkg
```

构建完成后，会在`pkg`目录下生成以下文件：
- `wasm_watermark.js` - JavaScript绑定文件
- `wasm_watermark_bg.wasm` - WebAssembly二进制文件
- `wasm_watermark.d.ts` - TypeScript类型定义文件

## 使用方法

### 在Vue项目中使用

1. 将构建好的`pkg`目录复制到项目根目录

2. 在Vue组件中导入：

```javascript
import { addWatermark, createTextWatermarkConfig } from '@/utils/watermarkHelper';

// 添加文字水印
const config = createTextWatermarkConfig({
  text: '我的水印',
  fontSize: 30,
  fontColor: '#FFFFFF',
  transparency: 0.5,
  tile: true
});

const watermarkedBlob = await addWatermark(file, config);
```

## 水印配置参数

### 文字水印配置

```javascript
{
  type: 'text',              // 水印类型
  text: '水印文字',           // 水印文字内容
  font: 'Arial',             // 字体名称
  font_size: 30,             // 字体大小
  font_color: '#FFFFFF',     // 字体颜色（十六进制）
  transparency: 0.5,         // 透明度（0-1）
  rotate: 0,                 // 旋转角度（度）
  x_offset: 10,              // X轴偏移（像素）
  y_offset: 10,              // Y轴偏移（像素）
  tile: false                // 是否平铺
}
```

### 图片水印配置

```javascript
{
  type: 'image',             // 水印类型
  image_data: 'data:image/png;base64,...',  // base64编码的图片数据
  width: 100,                // 水印图片宽度（可选）
  height: 100,               // 水印图片高度（可选）
  transparency: 0.5,         // 透明度（0-1）
  rotate: 0,                 // 旋转角度（度）
  x_offset: 10,              // X轴偏移（像素）
  y_offset: 10,              // Y轴偏移（像素）
  tile: false                // 是否平铺
}
```

## API参考

### addWatermark(image, config)

同步添加水印到图片。

**参数：**
- `image`: File | Blob | ArrayBuffer - 图片数据
- `config`: Object - 水印配置对象

**返回：**
- `Promise<Blob>` - 处理后的图片Blob对象

### addWatermarkAsync(image, config)

异步添加水印到图片（推荐用于大文件）。

**参数：**
- `image`: File | Blob | ArrayBuffer - 图片数据
- `config`: Object - 水印配置对象

**返回：**
- `Promise<Blob>` - 处理后的图片Blob对象

## 性能优化

- 使用`--release`模式构建以获得最佳性能
- 对于大文件，建议使用`addWatermarkAsync`方法
- WASM模块会自动缓存，避免重复加载

## 故障排除

### 构建失败

如果构建失败，请确保：
1. 已安装Rust工具链
2. 已安装wasm-pack
3. 已添加wasm32目标

### 运行时错误

如果运行时出现错误，请检查：
1. WASM文件是否正确加载
2. 图片格式是否支持（PNG、JPEG、GIF等）
3. 配置参数是否正确

## 许可证

Apache-2.0