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

## 全局注册(腾讯云cos)

```vue
import Vue from "vue";
import COS from 'cos-js-sdk-v5';
import "vue-cloud-upload/dist/vue-cloud-upload.css";
import CloudUpload, { setExternalCOS } from 'vue-cloud-upload';
// 传入腾讯云COS对象
setExternalCOS(COS);
Vue.use(CloudUpload); // 或 Vue.component(CloudUpload.name, CloudUpload);
```

## 按需引入(推荐做法，腾讯云cos)

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
import COS from 'cos-js-sdk-v5';
import "vue-cloud-upload/dist/vue-cloud-upload.css";
import CloudUpload, { setExternalCOS } from 'vue-cloud-upload';
//传入腾讯云COS对象
setExternalCOS(COS);
export default {
  components: { CloudUpload },
  data() {
    return {
      fileList:[],//附件列表，上传或者删除后实时同步更新
      cloudConfig: {
        //腾讯云cos桶名
        bucket: "test-tos-125***",
        //腾讯云cos桶所在地域
        region: "ap-guangzhou",
        //文件上传目录，自定义，以/结尾
        path: "costest/",
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
## 全局注册(华为云obs)

```vue
import Vue from "vue";
import ObsClient from 'esdk-obs-browserjs';
import "vue-cloud-upload/dist/vue-cloud-upload.css";
import CloudUpload, { setExternalOBS } from 'vue-cloud-upload';
// 传入华为云OBS对象
setExternalOBS(ObsClient);
Vue.use(CloudUpload); // 或 Vue.component(CloudUpload.name, CloudUpload);
```

## 按需引入(推荐做法，华为云obs)

```vue
<template>
  <div>
    <CloudUpload
      cloudType="huawei"
      :cloudConfig="cloudConfig"
      v-model="fileList"
      @success="handleSuccess"
      @error="handleError"
    >
    </CloudUpload>
  </div>
</script>

<script>
import ObsClient from 'esdk-obs-browserjs';
import "vue-cloud-upload/dist/vue-cloud-upload.css";
import CloudUpload, { setExternalOBS } from 'vue-cloud-upload';
// 传入华为云OBS对象
setExternalOBS(ObsClient);
export default {
  components: { CloudUpload },
  data() {
    return {
      fileList:[],//附件列表，上传或者删除后实时同步更新
      cloudConfig: {
        //华为云obs桶名
        bucket: "cloudupload",
        //华为云终端节点
        server: "https://obs.cn-south-1.myhuaweicloud.com",
        //文件上传目录，自定义，以/结尾
        path: "costest/",
        //华为云临时凭证获取函数
        getTempCredential: this.getObsCredential,
      }
    };
  },
  methods: {
    handleSuccess(result, file) {
      console.log('Upload success:', result.url);
    },
    handleError(err){
      console.log("error:",err);
    },
    //调用后端接口获取临时凭证
    async getObsCredential() {
      const response = await fetch("http://localhost:3000/obs/temporary");
      return await response.json();
      //临时凭证结构为如下示例:
      // {
      //   "credential": {
      //     "access": "HST3WHEHXD7Q5K6WKVR1",
      //     "expires_at": "2025-10-02T05:54:55.606000Z",
      //     "secret": "6P2441bazjE85XzJn6mXxWB8cLmqV77SoU3H76vy",
      //     "securitytoken": "ggpjbi1zb3V0aC0xT4t7ImFjY2VzcyI6IkhTVDNXSEVIWEQ3UTVLNldLVlIxIiwiaXNzdWVkX2F0IjoxNzU5MzgzNTk1NjA2LCJtZXRob2RzIjpbInRva2VuIl0sInJvbGUiOltdLCJyb2xldGFnZXMiOltdLCJ0aW1lb3V0X2F0IjoxNzU5Mzg0NDk1NjA2LCJ1c2VyIjp7ImRvbWFpbiI6eyJpZCI6IjcwMTg0OGZhZGEzNTQwNTk5MmViNTliNjY2NDcyYTlkIiwibmFtZSI6InhpbjE1ODI3MjE1OTk3In0sImlkIjoiNGRkMDc3ZTY0YzQzNGYwY2I4ODViOTgxMDZjMmI4NWMiLCJuYW1lIjoieGluMTU4MjcyMTU5OTciLCJwYXNzd29yZF9leHBpcmVzX2F0IjoiIiwidXNlcl90eXBlIjoxN319nnv4vCNRrXlJxCuXE88_GlHbaDzBg9gt5Ls6UC5PHB70SvqDqt4vUBc1k8Gt6EqoLisyTcq8nn8Sn0rsoI-_KRUz-7Hwp-sdsXi15NVdHTy5mWQsMarKQkkciOQu0ryMIM-H8JKGRRK041qN5EuHnsRv1hi4PP0FPCYxHTOvCzmCrqtzAzLipJt4dHdTI4GtcI5pU296pA8rJf1Nq7VvMjio_9BuaeLccBTEosmijganMRNBqFxnWWSAjets3Qg1fr1U2mpTGKbzZ0Wc8tehfOI0kQdjYUT2T0cGDXMm_Kta9iOmVmydSqWzDzQbNXrzujWNWbrtXfERrU6psu0_JQ=="
      //   },
      //   "httpStatusCode": 201
      // }
    },    
  }
};
</script>
```

## 全局注册(阿里云oss)

```javascript
import Vue from "vue";
import OSS from "ali-oss";
import "vue-cloud-upload/dist/vue-cloud-upload.css";
import CloudUpload, { setExternalOSS } from 'vue-cloud-upload';
// 传入阿里云OSS对象
setExternalOSS(OSS);
Vue.use(CloudUpload); // 或 Vue.component(CloudUpload.name, CloudUpload);
```
## 按需引入(推荐做法，阿里云oss)

```vue
<template>
  <div>
    <CloudUpload
      cloudType="aliyun"
      :cloudConfig="cloudConfig"
      v-model="fileList"
      @success="handleSuccess"
      @error="handleError"
    >
    </CloudUpload>
  </div>
</script>

<script>
import OSS from "ali-oss";
import "vue-cloud-upload/dist/vue-cloud-upload.css";
import CloudUpload, { setExternalOSS } from 'vue-cloud-upload';
// 传入阿里云OSS对象
setExternalOSS(OSS);
export default {
  components: { CloudUpload },
  data() {
    return {
      fileList:[],//附件列表，上传或者删除后实时同步更新
      cloudConfig: {
        //阿里云oss桶名
        bucket: "cloudupload",
        //桶所属地域
        region: "oss-cn-wuhan-lr",
        //文件上传目录，自定义，以/结尾
        path: "costest/",
        //临时凭证获取函数
        getTempCredential: this.getOssCredential,
      }
    };
  },
  methods: {
    handleSuccess(result, file) {
      console.log('Upload success:', result.url);
    },
    handleError(err){
      console.log("error:",err);
    },
    //调用后端接口获取临时凭证
    async getOssCredential(){
      const response = await fetch("http://localhost:3000/oss");
      const data = await response.json()
      //临时凭证获取函数应返回如下三个字段
      const result = {
        accessKeyId: data.AccessKeyId,
        accessKeySecret: data.AccessKeySecret,
        stsToken: data.SecurityToken
      }
      return result;
    },   
  }
};
</script>
```

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
