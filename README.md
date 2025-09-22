# Vue Cloud Upload

[![npm version](https://img.shields.io/npm/v/vue-cloud-upload.svg?style=flat-square)](https://www.npmjs.com/package/vue-cloud-upload)
[![npm downloads](https://img.shields.io/npm/dt/vue-cloud-upload.svg?style=flat-square)](https://www.npmjs.com/package/vue-cloud-upload)
[![license](https://img.shields.io/npm/l/vue-cloud-upload.svg?style=flat-square)](https://www.npmjs.com/package/vue-cloud-upload)
[![GitHub stars](https://img.shields.io/github/stars/Leaderxin/cloud-upload.svg?style=social&label=Star)](https://github.com/Leaderxin/cloud-upload)

🌩 **Vue Cloud Upload** - 专为 Vue.js 打造的专业级云端文件上传组件

一款功能强大、高度可定制的云上传解决方案，完美集成腾讯云 COS，提供优雅的 UI 界面和丰富的功能特性，让文件上传变得简单而高效！

## ✨ 核心特性

- 🚀 **开箱即用**：无缝对接腾讯云 COS 存储桶，快速集成到现有项目
- 🎨 **美观 UI**：基于 Element UI 设计语言，提供一致的用户体验
- ⚙️ **高度可定制**：丰富的配置参数，满足各种业务场景需求
- 👁 **在线预览**：支持图片、TXT、PDF 附件直接在线预览
- 📊 **多格式支持**：全面支持各类文件类型上传与展示

## 🔧 现有功能

- ✅ 腾讯云 COS 存储桶无缝对接
- ✅ 多文件上传支持
- ✅ 自动分片断点续传
- ✅ 上传进度实时显示
- ✅ 文件列表管理
- ✅ 附件回显功能
- ✅ 图片/PDF/TXT在线预览
- ✅ 音视频在线播放
- ✅ 自定义样式支持
- ✅ 丰富的回调事件

## 🚧 开发中功能

- 🔄 图片添加水印
- 🔄 图片无损压缩
- 🔄 视频首帧获取
- 🔄 Office 文档在线预览（Word, Excel, PowerPoint）
- 🔄 更多云存储平台支持

## 安装

```bash
npm i vue-cloud-upload
```

## 全局注册

```javascript
import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import CloudUpload from "vue-cloud-upload";
import "vue-cloud-upload/dist/vue-cloud-upload.css";
Vue.use(ElementUI);
Vue.use(CloudUpload); // 或 Vue.component(CloudUpload.name, CloudUpload);
```

## 按需引入（建议）

```vue
<template>
  <div>
    <CloudUpload
      cloudType="tencent"
      :cloudConfig="cloudConfig"
      v-model="fileList"
      @success="handleSuccess"
      @error="handleError"
    >
    </CloudUpload>
  </div>
</script>

<script>
import CloudUpload from 'vue-cloud-upload';
import "vue-cloud-upload/dist/vue-cloud-upload.css";
export default {
  components: { CloudUpload },
  data() {
    return {
      fileList:[],//附件列表，上传或者删除后实时同步更新
      tencentConfig: {
        //腾讯云cos桶名
        bucket: "test-tos-125***",
        //腾讯云cos桶所在地域
        region: "ap-guangzhou",
        //文件上传目录，自定义
        path: "/costest/",
        //此函数为客户端获取临时凭证使用
        getTempCredential: this.getTempCredential,
      }
    };
  },
  methods: {
    /**
     * 调用后端接口返回临时凭证
     */
    async getTempCredential(){
      const response = await fetch('http://localhost:3000/sts')
      const data = response.json();
      return data
      //临时凭证结构应该为如下示例:
      // {
      //   "expiredTime": 1758120268,
      //   "expiration": "2025-09-17T14:44:28Z",
      //   "credentials": {
      //     "sessionToken": "OkiB0nVm0t52UXdyKu0acyK1iw6UhbTa2313c4726bdfa2230aa160cc202e5651kLpfeS8UJsc_4wHB1jPrmywvTJ1KsO0nm9PbEbabQi_D7aahjL5lBJM1DVV7cEZ53AlYq__a07bZ6MKxOIy9CXdGCJF-20xzssYRpukx_MQAhrXKo6cdRi-jXuD-YEe4W-YRXhX4c3x41z8Vb5SQfFoh_THpeFYsaZR_1aPzV22C0UDtI0ru1wiRx-Bw2e9pTHMc0pbvNrYMBuGNt_oEJ0P6fjhCVjLa1BA3KAJen7U6lQqR1UsIRElQAnWqEkG0NCJdPa7nA2pt9COrI58dXiBr9sKXgFcPPhUp9xrAY7-Mx7LuJ6XqgegiBjZeumhNSqIIINadmEjAfWyQfndQKHyxbKRK7h4hCvCV297SVQExnKBO9wkt-Ba0gxpUYj0hgfGCKgvLqG68v1NaIufbR61K5-YlwWA82UFL9PfLIuPR5EAdYgt3-OmM03lZpU22qmq1okkAlNB3wl2Mn03lX4Bx_PKtMZdf8cH2gcUftNjXNwxpMsRdt1U1M9dn_1D3rJy6PE_yqAbGWXOTA5D5c8oP9bW2zUuWgqHbCNU6g8Nvn1wb1hIVIf132T0rfoYP",
      //     "tmpSecretId": "AKID_Duy_4HJP0bS8d3ZG8KsNCMowSm5FxpZr-trO_ayMta5nKI1vr7J3KPOWg_Gu3Bo",
      //     "tmpSecretKey": "3rn/KVRRTGQw5CVFh4IQoqBBm/1LrdvjyFw7YiqbJk8="
      //   },
      //   "requestId": "84fd8060-82a3-4de8-b757-9b22ebabbf7a",
      //   "startTime": 1758116668
      // }
    },
    handleSuccess(result, file) {
      console.log('Upload success:', result.url);
    },
    handleError(err){
      console.log("error:",err);
    }
  }
};
</script>
```
## 使用文档

组件详细使用文档请参考官方文档(https://github.com/Leaderxin/cloud-upload/wiki)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 商务合作

商务合作请通过邮箱联系：[📧 shazhoulen@outlook.com](mailto:shazhoulen@outlook.com)

## 支持

如果您觉得这个组件有帮助，请给它一个 ⭐️ [Star](https://github.com/Leaderxin/cloud-upload) 支持一下！

## 关键词

- vue组件
- 云上传
- 附件上传
- 附件在线预览
- 腾讯云cos上传
- elementui封装
---

**Vue Cloud Upload** - 让文件上传变得更简单！

<p align="center">
  <a href="https://github.com/Leaderxin/cloud-upload" target="_blank">
    <img src="https://img.shields.io/badge/⭐-Star%20This%20Project-blue?style=for-the-badge" alt="Star This Project">
  </a>
</p>
