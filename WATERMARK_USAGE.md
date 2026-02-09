# 图片水印功能使用指南

## 功能概述

本项目已集成基于 fast-watermark npm 包的图片水印功能，支持在浏览器端为上传的图片添加文字水印或图片水印。

fast-watermark 是基于 **Rust + WebAssembly** 实现的高性能图片水印库，处理速度比纯 JavaScript 快 10-100 倍。

项目地址: https://www.npmjs.com/package/fast-watermark

## 安装依赖

fast-watermark 已作为项目依赖自动安装，无需额外操作。

```bash
npm install
```

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
        font: 'Arial',
        font_size: 30,
        font_color: '#FFFFFF',
        transparency: 0.5,
        rotate: 0,
        x_offset: 10,
        y_offset: 10,
        tile: false
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
  font: 'Arial',             // 字体名称，默认Arial（可选）
  font_size: 30,             // 字体大小（像素），默认30（可选）
  font_color: '#FFFFFF',     // 字体颜色，十六进制或rgba格式，默认#FFFFFF（可选）
  transparency: 0.5,         // 不透明度，0-1之间，默认0.5（可选）
  rotate: 0,                 // 旋转角度（度），默认0（可选）
  x_offset: 10,              // X轴偏移（像素），默认10（可选）
  y_offset: 10,              // Y轴偏移（像素），默认10（可选）
  tile: false                // 是否平铺水印，默认false（可选）
}
```

**注意：** `createTextWatermarkConfig` 函数支持驼峰命名（如 `fontSize`、`fontColor`）和下划线命名（如 `font_size`、`font_color`）两种方式。

### 图片水印配置

```javascript
{
  type: 'image',             // 水印类型，固定为'image'
  image_data: 'data:image/png;base64,...',  // base64编码的图片数据（必需）
  width: 100,                // 水印图片宽度（像素，可选）
  height: 100,               // 水印图片高度（像素，可选）
  transparency: 0.5,         // 不透明度，0-1之间，默认0.5（可选）
  rotate: 0,                 // 旋转角度（度），默认0（可选）
  x_offset: 10,              // X轴偏移（像素），默认10（可选）
  y_offset: 10,              // Y轴偏移（像素），默认10（可选）
  tile: false                // 是否平铺水印，默认false（可选）
}
```

**注意：** `createImageWatermarkConfig` 函数支持驼峰命名（如 `xOffset`、`yOffset`）和下划线命名（如 `x_offset`、`y_offset`）两种方式。

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
    : :cloud-config="cloudConfig"
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

### 示例5：旋转水印

```vue
<template>
  <cloud-upload
    v-model="fileList"
    :cloud-config="cloudConfig"
    :watermark-config="{
      type: 'text',
      text: 'CONFIDENTIAL',
      font_size: 48,
      font_color: 'rgba(255, 0, 0, 0.3)',
      transparency: 0.3,
      rotate: -45,
      tile: true,
      x_offset: 200,
      y_offset: 200
    }"
  />
</template>
```

## 注意事项

1. **依赖安装**：确保已安装 fast-watermark npm 包
2. **图片格式**：水印功能仅对图片文件生效（image/*类型）
3. **性能考虑**：fast-watermark 基于 Rust + WebAssembly，处理速度比纯 JavaScript 快 10-100 倍
4. **错误处理**：如果水印添加失败，组件会自动使用原始文件继续上传
5. **开发模式**：在开发模式下，控制台会输出水印处理的详细信息
6. **WASM初始化**：WASM 模块会在第一次使用时自动初始化，无需手动初始化

## 故障排除

### 问题1：水印添加失败

**错误信息**：`添加水印失败，将使用原始文件上传`

**解决方案**：
1. 检查配置参数是否正确
2. 确认图片格式是否支持
3. 查看浏览器控制台获取详细错误信息
4. 确认 fast-watermark 包已正确安装

### 问题2：水印不显示

**可能原因**：
1. 透明度设置为0
2. 水印文字为空
3. 水印图片数据无效
4. 水印位置超出图片范围
5. 字体颜色与背景色相同

### 问题3：npm install 失败

**解决方案**：
1. 清除 npm 缓存：`npm cache clean --force`
2. 删除 node_modules 文件夹后重新安装
3. 使用淘宝镜像：`npm install --registry=https://registry.npmmirror.com`

## 性能优化建议

1. **使用异步方法**：组件内部已使用`addWatermarkAsync`方法处理大文件
2. **合理设置透明度**：过高的透明度会增加计算量
3. **避免频繁切换配置**：频繁改变水印配置会影响性能
4. **使用平铺模式**：对于大图片，平铺模式可能比单个水印更高效

## 技术细节

- **实现语言**：Rust
- **编译目标**：WebAssembly (wasm32-unknown-unknown)
- **图片处理库**：image crate (Rust)
- **性能优势**：比纯 JavaScript 快 10-100 倍
- **内存占用**：减少 50-70%
- **文件大小**：WASM 文件仅约 100KB（gzip 后约 30KB）

## 参考文档

- [fast-watermark npm 包](https://www.npmjs.com/package/fast-watermark)
- [腾讯云水印参数文档](https://cloud.tencent.com/document/product/436/119425)