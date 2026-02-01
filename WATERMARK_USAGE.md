# 图片水印功能使用指南

## 功能概述

本项目已集成基于Rust + WASM的图片水印功能，支持在浏览器端为上传的图片添加文字水印或图片水印。

## 构建WASM模块

### 前置要求

1. 安装Rust工具链：
```bash
# 访问 https://rustup.rs/ 下载安装程序
# 或使用以下命令（Linux/Mac）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. 安装wasm-pack：
```bash
cargo install wasm-pack
```

3. 添加wasm32目标：
```bash
rustup target add wasm32-unknown-unknown
```

### 构建步骤

```bash
cd wasm-watermark
wasm-pack build --target web --out-dir pkg
```

构建完成后，会在`pkg`目录下生成：
- `wasm_watermark.js` - JavaScript绑定
- `wasm_watermark_bg.wasm` - WebAssembly二进制文件
- `wasm_watermark.d.ts` - TypeScript类型定义

## 使用方法

### 基本用法

在Vue组件中使用`watermarkConfig`属性配置水印：

```vue
<template>
  <cloud-upload
    v-model="fileList"
    :cloud-config="cloudConfig"
    :watermark-config="watermarkConfig"
  />
</template>

<script>
export default {
  data() {
    return {
      fileList: [],
      cloudConfig: {
        // 云平台配置
      },
      // 文字水印配置
      watermarkConfig: {
        type: 'text',
        text: '我的水印',
        font_size: 30,
        font_color: '#FFFFFF',
        transparency: 0.5,
        rotate: 0,
        x_offset: 10,
        y_offset: 10,
        tile: true
      }
    }
  }
}
</script>
```

### 文字水印配置

```javascript
{
  type: 'text',              // 水印类型，固定为'text'
  text: '水印文字',           // 水印文字内容（必需）
  font: 'Arial',             // 字体名称（可选）
  font_size: 30,             // 字体大小，默认30（可选）
  font_color: '#FFFFFF',     // 字体颜色，十六进制格式，默认#FFFFFF（可选）
  transparency: 0.5,         // 透明度，0-1之间，默认0.5（可选）
  rotate: 0,                 // 旋转角度（度），默认0（可选）
  x_offset: 10,              // X轴偏移（像素），默认10（可选）
  y_offset: 10,              // Y轴偏移（像素），默认10（可选）
  tile: false                // 是否平铺，默认false（可选）
}
```

### 图片水印配置

```javascript
{
  type: 'image',             // 水印类型，固定为'image'
  image_data: 'data:image/png;base64,...',  // base64编码的图片数据（必需）
  width: 100,                // 水印图片宽度（像素，可选）
  height: 100,               // 水印图片高度（像素，可选）
  transparency: 0.5,         // 透明度，0-1之间，默认0.5（可选）
  rotate: 0,                 // 旋转角度（度），默认0（可选）
  x_offset: 10,              // X轴偏移（像素），默认10（可选）
  y_offset: 10,              // Y轴偏移（像素），默认10（可选）
  tile: false                // 是否平铺，默认false（可选）
}
```

## 使用示例

### 示例1：简单的文字水印

```vue
<template>
  <cloud-upload
    v-model="fileList"
    :cloud-config="cloudConfig"
    :watermark-config="{
      type: 'text',
      text: '版权所有',
      font_size: 24,
      font_color: '#FF0000',
      transparency: 0.7
    }"
  />
</template>
```

### 示例2：平铺文字水印

```vue
<template>
  <cloud-upload
    v-model="fileList"
    :cloud-config="cloudConfig"
    :watermark-config="{
      type: 'text',
      text: '机密文件',
      font_size: 20,
      font_color: '#000000',
      transparency: 0.3,
      tile: true,
      x_offset: 100,
      y_offset: 100
    }"
  />
</template>
```

### 示例3：图片水印

```vue
<template>
  <cloud-upload
    v-model="fileList"
    :cloud-config="cloudConfig"
    :watermark-config="imageWatermarkConfig"
  />
</template>

<script>
export default {
  data() {
    return {
      fileList: [],
      cloudConfig: {
        // 云平台配置
      },
      imageWatermarkConfig: {
        type: 'image',
        image_data: this.getWatermarkImage(),
        width: 80,
        height: 80,
        transparency: 0.8,
        x_offset: 10,
        y_offset: 10
      }
    }
  },
  methods: {
    getWatermarkImage() {
      // 返回base64编码的水印图片
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }
  }
}
</script>
```

### 示例4：动态水印配置

```vue
<template>
  <div>
    <el-form>
      <el-form-item label="水印文字">
        <el-input v-model="watermarkText" />
      </el-form-item>
      <el-form-item label="透明度">
        <el-slider v-model="watermarkTransparency" :min="0" :max="1" :step="0.1" />
      </el-form-item>
      <el-form-item label="平铺">
        <el-switch v-model="watermarkTile" />
      </el-form-item>
    </el-form>
    
    <cloud-upload
      v-model="fileList"
      :cloud-config="cloudConfig"
      :watermark-config="currentWatermarkConfig"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      fileList: [],
      cloudConfig: {
        // 云平台配置
      },
      watermarkText: '我的水印',
      watermarkTransparency: 0.5,
      watermarkTile: false
    }
  },
  computed: {
    currentWatermarkConfig() {
      return {
        type: 'text',
        text: this.watermarkText,
        font_size: 30,
        font_color: '#FFFFFF',
        transparency: this.watermarkTransparency,
        tile: this.watermarkTile
      };
    }
  }
}
</script>
```

## 注意事项

1. **WASM模块构建**：首次使用前必须构建WASM模块，否则会报错
2. **图片格式**：水印功能仅对图片文件生效（image/*类型）
3. **性能考虑**：对于大图片，添加水印可能需要一些时间
4. **错误处理**：如果水印添加失败，组件会自动使用原始文件继续上传
5. **开发模式**：在开发模式下，控制台会输出水印处理的详细信息

## 故障排除

### 问题1：WASM模块加载失败

**错误信息**：`WASM模块初始化失败，请确保已正确构建wasm-watermark项目`

**解决方案**：
1. 确保已构建WASM模块：`cd wasm-watermark && wasm-pack build --target web --out-dir pkg`
2. 检查`wasm-watermark/pkg`目录是否存在
3. 确认`wasm_watermark.js`和`wasm_watermark_bg.wasm`文件存在

### 问题2：水印添加失败

**错误信息**：`添加水印失败，将使用原始文件上传`

**解决方案**：
1. 检查配置参数是否正确
2. 确认图片格式是否支持
3. 查看浏览器控制台获取详细错误信息

### 问题3：水印不显示

**可能原因**：
1. 透明度设置为0
2. 水印文字为空
3. 水印图片数据无效
4. 水印位置超出图片范围

## 性能优化建议

1. **使用异步方法**：组件内部已使用`addWatermarkAsync`方法处理大文件
2. **合理设置透明度**：过高的透明度会增加计算量
3. **避免频繁切换配置**：频繁改变水印配置会影响性能
4. **使用平铺模式**：对于大图片，平铺模式可能比单个水印更高效

## 技术细节

- **实现语言**：Rust
- **编译目标**：WebAssembly (wasm32-unknown-unknown)
- **图片处理库**：image crate (Rust)
- **序列化**：serde + serde-wasm-bindgen
- **性能优化**：Release模式编译，启用LTO优化

## 参考文档

- [腾讯云水印参数文档](https://cloud.tencent.com/document/product/436/119425)
- [wasm-pack文档](https://rustwasm.github.io/wasm-pack/)
- [Rust image crate](https://github.com/image-rs/image)