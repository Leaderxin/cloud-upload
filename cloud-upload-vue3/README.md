# Vue3 Cloud Upload

基于 Vue3 + Element Plus + TypeScript 的通用云上传组件，无缝衔接腾讯云、华为云、阿里云等对象存储平台，开箱即用。

## 特性

- ✅ 支持三大云平台：腾讯云COS、阿里云OSS、华为云OBS
- ✅ 支持断点续传
- ✅ 支持多种文件类型预览（图片、视频、音频、PDF、TXT等）
- ✅ 支持拖拽上传
- ✅ 支持大文件分片上传
- ✅ 完整的 TypeScript 类型支持
- ✅ 基于 Vue3 Composition API
- ✅ 使用 Element Plus UI 组件

## 安装

```bash
npm install vue3-cloud-upload
```

## 使用

### 基础用法

```vue
<template>
  <cloud-upload
    v-model="fileList"
    :cloud-config="cloudConfig"
    cloud-type="tencent"
  />
</template>

<script setup>
import { ref } from 'vue'
import CloudUpload from 'vue-cloud-upload-v3'

const fileList = ref([])
const cloudConfig = ref({
  bucket: 'your-bucket-name',
  region: 'ap-guangzhou',
  getTempCredential: async () => {
    // 调用后端接口获取临时凭证
    const response = await fetch('/api/get-cos-credential')
    return await response.json()
  }
})
</script>
```

### 腾讯云COS配置

```javascript
const cloudConfig = {
  bucket: 'your-bucket-name',
  region: 'ap-guangzhou',
  dir: 'uploads/', // 可选，上传目录
  // 方式1：使用永久密钥
  secretId: 'your-secret-id',
  secretKey: 'your-secret-key',
  // 方式2：使用临时凭证（推荐）
  getTempCredential: async () => {
    const response = await fetch('/api/get-cos-credential')
    return await response.json()
  }
}
```

### 阿里云OSS配置

```javascript
const cloudConfig = {
  bucket: 'your-bucket-name',
  region: 'oss-cn-hangzhou',
  dir: 'uploads/',
  getTempCredential: async () => {
    const response = await fetch('/api/get-oss-credential')
    return await response.json()
  },
  refreshSTSTokenInterval: 85000 // 可选，临时凭证刷新间隔
}
```

### 华为云OBS配置

```javascript
const cloudConfig = {
  bucket: 'your-bucket-name',
  region: 'cn-north-4',
  server: 'https://obs.cn-north-4.myhuaweicloud.com',
  dir: 'uploads/',
  // 方式1：使用永久密钥
  accessKeyId: 'your-access-key-id',
  secretAccessKey: 'your-secret-access-key',
  // 方式2：使用临时凭证（推荐）
  getTempCredential: async () => {
    const response = await fetch('/api/get-obs-credential')
    return await response.json()
  }
}
```

## Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| v-model | 文件列表 | Array | - | [] |
| cloudType | 云平台类型 | string | tencent/huawei/aliyun | tencent |
| cloudConfig | 云平台配置 | Object | - | 必填 |
| multiple | 是否支持多选文件 | boolean | - | false |
| showFileList | 是否显示已上传文件列表 | boolean | - | true |
| drag | 是否启用拖拽上传 | boolean | - | false |
| accept | 接受上传的文件类型 | string | - | - |
| listType | 文件列表的类型 | string | text/picture/picture-card | picture-card |
| disabled | 是否禁用 | boolean | - | false |
| limit | 最大允许上传个数 | number | - | - |
| maxSize | 单个附件大小限制MB | number | - | - |
| size | 默认UI组件大小 | string | medium/small/mini | small |
| sliceSize | 触发分块上传的阈值 | number | - | 10MB |
| chunkSize | 分块大小 | number | - | 5MB |
| keyType | 文件key生成方式 | string | uuid/name/uuid+name | uuid+name |
| customKey | 自定义函数生成上传文件key | function | - | - |
| previewConfig | 附件预览/在线查看配置 | Object | - | - |
| primaryColor | 主题色 | string | - | #409eff |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 文件状态改变时的钩子 | (file, fileList) |
| preview | 点击文件列表中已上传的文件时的钩子 | file |
| remove | 删除文件时的钩子 | (file, fileList) |
| exceed | 文件超出个数限制时的钩子 | (files, fileList) |
| success | 上传成功时的钩子 | (response, file, fileList) |
| error | 上传失败时的钩子 | (error, file, fileList) |

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 构建生产版本
npm run build
```

## 技术栈

- Vue 3
- TypeScript
- Element Plus
- Vite

## 许可证

Apache-2.0

## 作者

Leaderxin
