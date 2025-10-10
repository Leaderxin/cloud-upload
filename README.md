# Vue Cloud Upload

[![npm version](https://img.shields.io/npm/v/vue-cloud-upload.svg?style=flat-square)](https://www.npmjs.com/package/vue-cloud-upload)
[![npm downloads](https://img.shields.io/npm/dt/vue-cloud-upload.svg?style=flat-square)](https://www.npmjs.com/package/vue-cloud-upload)
[![license](https://img.shields.io/npm/l/vue-cloud-upload.svg?style=flat-square)](https://www.npmjs.com/package/vue-cloud-upload)
[![GitHub stars](https://img.shields.io/github/stars/Leaderxin/cloud-upload.svg?style=social&label=Star)](https://github.com/Leaderxin/cloud-upload)

🌩 **Vue Cloud Upload** - 专为 Vue.js 打造的专业级云端文件上传组件

一款功能强大、高度可定制的云上传解决方案，完美集成腾讯云COS、华为云OBS和阿里云OSS，提供优雅的UI界面和丰富的功能特性，让文件上传变得简单而高效！

## ✨ 核心特性

- 🚀 **开箱即用**：无缝对接腾讯云COS桶、华为云OBS桶和阿里云OSS桶，快速集成到现有项目
- 🎨 **美观 UI**：基于 Element UI 设计语言，提供一致的用户体验
- ⚙️ **高度可定制**：丰富的配置参数，满足各种业务场景需求
- 👁 **在线预览**：支持图片、TXT、PDF、视频、音频附件直接在线预览/播放
- 📊 **多格式支持**：全面支持各类文件类型上传与展示

## 🔧 现有功能

- ✅ 腾讯云COS桶无缝对接
- ✅ 华为云OBS桶无缝对接
- ✅ 阿里云OSS桶无缝对接
- ✅ 多文件上传支持
- ✅ 自动分片断点续传
- ✅ 上传进度实时显示
- ✅ 文件列表管理
- ✅ 附件回显功能
- ✅ 图片/PDF/TXT在线预览
- ✅ 音视频附件在线播放
- ✅ 自定义样式支持
- ✅ 丰富的参数配置和回调事件

## 🚧 开发中功能

- 🔄 图片添加水印
- 🔄 图片无损压缩
- 🔄 视频首帧截取
- 🔄 Office 文档在线预览（Word, Excel, PowerPoint）
- 🔄 更多云存储平台支持

## 安装

```bash
npm install vue-cloud-upload
```
根据您使用的对象存储平台，选择安装对应的SDK依赖：

### 腾讯云 COS
```bash
npm install cos-js-sdk-v5
```

### 华为云 OBS
```bash
npm install esdk-obs-browserjs
```

### 阿里云 OSS
```bash
npm install ali-oss
```
安装相应的SDK后，您可以在组件配置中使用对应平台的参数进行文件上传。

## 云平台配置说明

为了更好地组织文档内容，我们将不同云平台的使用说明分别放在独立的文档中，请根据您使用的云平台选择对应的文档：

- [腾讯云 COS 使用说明](./docs/tencent-cloud.md)
- [华为云 OBS 使用说明](./docs/huawei-cloud.md)
- [阿里云 OSS 使用说明](./docs/aliyun-cloud.md)

## 使用文档

组件详细使用文档请参考[官方文档](https://github.com/Leaderxin/cloud-upload/wiki)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 商务合作

商务合作请通过邮箱联系：[📧 shazhoulen@outlook.com](mailto:shazhoulen@outlook.com)

## 支持

如果您觉得这个组件有帮助，请给它一个 ⭐️ [Star](https://github.com/Leaderxin/cloud-upload) 支持一下！

### ☕ 赞赏支持

如果这个项目对您有帮助，欢迎扫码赞赏支持开发者继续维护和改进！

<p align="center">
  <img src="https://img.shields.io/badge/支付宝-扫码赞赏-orange?style=for-the-badge&logo=alipay" alt="支付宝赞赏">
  <img src="https://img.shields.io/badge/微信-扫码赞赏-brightgreen?style=for-the-badge&logo=wechat" alt="微信赞赏">
</p>

<p align="center">
  <img src="docs/images/alipay-qrcode.jpg" alt="支付宝收款码" width="200" style="margin: 10px;">
  <img src="docs/images/wechat-qrcode.png" alt="微信收款码" width="200" style="margin: 10px;">
</p>

### 🏆 感谢打赏者

感谢以下朋友的慷慨支持！您的赞赏是我持续开发和维护项目的动力！

<div align="center">

### 💎 荣誉殿堂

</div>

<div align="center">
  
| 🌟 赞赏者 | 💰 金额 | 📅 日期 | 💬 留言 |
|:--------:|:------:|:------:|:------:|
| 🎉 **首批支持者** | - | - | - |

</div>

<div align="center">
  
> 💌 **成为荣誉支持者**：打赏后请联系我（通过邮箱 [shazhoulen@outlook.com](mailto:shazhoulen@outlook.com)），告诉我您的昵称和希望显示的留言，我会将您添加到这份荣誉榜单中！

</div>

**Vue Cloud Upload** - 让文件上传变得更简单！

<p align="center">
  <a href="https://github.com/Leaderxin/cloud-upload" target="_blank">
    <img src="https://img.shields.io/badge/⭐-Star%20This%20Project-blue?style=for-the-badge" alt="Star This Project">
  </a>
</p>
