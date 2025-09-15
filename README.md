# Vue Cloud Upload

[![npm version](https://img.shields.io/npm/v/vue-clound-upload.svg?style=flat-square)](https://www.npmjs.com/package/vue-clound-upload)
[![npm downloads](https://img.shields.io/npm/dt/vue-clound-upload.svg?style=flat-square)](https://www.npmjs.com/package/vue-clound-upload)
[![license](https://img.shields.io/npm/l/vue-clound-upload.svg?style=flat-square)](https://www.npmjs.com/package/vue-clound-upload)
[![GitHub stars](https://img.shields.io/github/stars/Leaderxin/cloud-upload.svg?style=social&label=Star)](https://github.com/Leaderxin/cloud-upload)

🌩 **Vue Cloud Upload** - 专为 Vue.js 打造的专业级云端文件上传组件

一款功能强大、高度可定制的云上传解决方案，完美集成腾讯云 COS，提供优雅的 UI 界面和丰富的功能特性，让文件上传变得简单而高效！

## ✨ 核心特性

- 🚀 **开箱即用**：无缝对接腾讯云 COS 存储桶，快速集成到现有项目
- 🎨 **美观UI**：基于 Element UI 设计语言，提供一致的用户体验
- ⚙️ **高度可定制**：丰富的配置参数，满足各种业务场景需求
- 👁 **在线预览**：支持图片、TXT 附件直接在线预览
- 📊 **多格式支持**：全面支持各类文件类型上传与展示

## 🔧 现有功能

- ✅ 腾讯云 COS 存储桶无缝对接
- ✅ 多文件上传支持
- ✅ 上传进度实时显示
- ✅ 文件列表管理
- ✅ 附件回显功能
- ✅ 图片在线预览
- ✅ TXT 文件在线预览
- ✅ 自定义样式支持
- ✅ 丰富的回调事件

## 🚧 开发中功能

- 🔄 附件分片上传
- 🔄 断点续传功能
- 🔄 视频文件在线预览
- 🔄 音频文件在线预览
- 🔄 Office 文档在线预览（Word, Excel, PowerPoint）
- 🔄 更多云存储平台支持


## 安装

```bash
npm i vue-clound-upload
```

## 全局注册

```javascript
import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import CloudUpload from "vue-clound-upload";

Vue.use(ElementUI);
Vue.use(CloudUpload); // 或 Vue.component(CloudUpload.name, CloudUpload);
```

## 按需引入

```vue
<template>
  <div>
    <cloud-upload v-model="fileList" :cloud-config="tencentConfig" cloud-type="tencent" @success="handleSuccess"></cloud-upload>
  </div>
</script>

<script>
import CloudUpload from 'vue-clound-upload';

export default {
  components: { CloudUpload },
  data() {
    return {
      fileList:[],//附件列表，上传或者删除后实时同步更新
      tencentConfig: {
        //腾讯云cos桶名
        bucket: "",
        //腾讯云cos桶所在地域
        region: "",
        //文件上传目录，自定义
        path: "/costest/",
        //临时凭证获取函数，需按照示例结构返回所需参数
        //此临时凭证调用后端接口获取，后端接口调用腾讯云api生成
        getTempCredential: async () => {
          return {
            credentials: {
              tmpSecretId: "",
              tmpSecretKey: "",
              sessionToken: "",
            },
            requestId: "",
            expiration: "",
            startTime: 1757401037,
            expiredTime: 1757404637,
          };
        },
      }
    };
  },
  methods: {
    handleSuccess(result, file) {
      console.log('Upload success:', result.url);
    }
  }
};
</script>
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 支持

如果您觉得这个组件有帮助，请给它一个 ⭐️ [Star](https://github.com/Leaderxin/cloud-upload) 支持一下！

---

**Vue Cloud Upload** - 让文件上传变得更简单！

<p align="center">
  <a href="https://github.com/Leaderxin/cloud-upload" target="_blank">
    <img src="https://img.shields.io/badge/⭐-Star%20This%20Project-blue?style=for-the-badge" alt="Star This Project">
  </a>
</p>

