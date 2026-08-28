# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目简介

`vue-cloud-upload` —— 一个基于 Vue 2 + Element UI 的库组件（`CloudUpload`），可将文件上传到三种对象存储后端（腾讯云 COS、华为云 OBS、阿里云 OSS），支持在线预览、分片断点续传和图片水印。已发布到 npm；`src/` 下的源码由 Vite 编译为 `dist/` 下的 ES + UMD 产物。

## 常用命令

```bash
npm run dev      # Vite 开发服务器，运行在 http://localhost:5500（自动打开浏览器），演示应用是 src/App.vue
npm run build    # 库构建 → dist/（ES + UMD + 各平台分包 + CSS）
```

项目**没有测试套件**（`test/` 目录为空），也**没有配置 linter**。

发布流程（由 npm 生命周期钩子自动驱动，无需手动执行命令）：
- `prepack` → `node scripts/generate-changelog.js` —— 读取 git 标签，重写 `README.md` 中 `<!-- 自动生成的更新日志开始/结束 -->` 之间的内容。
- `prepublishOnly` → `npm run build`。
- 通过 `npm publish` 发布；版本号在 `package.json` 中手动更新。

WASM 水印重新构建（仅在修改 Rust 代码时需要，普通 JS 开发无需执行）：
```bash
cd wasm-watermark && bash build.sh   # 需要 Rust 工具链、wasm-pack 以及 wasm32-unknown-unknown 目标
```
产物已提交到 `wasm-watermark/pkg/`。详见 `wasm-watermark/README.md` 和 `docs/WASM_BUILD_TROUBLESHOOTING.md`。

## 架构

库入口是 [src/index.js](src/index.js)。它导出 `CloudUpload` 组件（默认导出，带 `install()` 方法供 `Vue.use()` 使用），以及三个 SDK 注入函数：`setExternalCOS`、`setExternalOBS`、`setExternalOSS`。每个函数都通过动态 `import()` 懒加载，把 SDK 对象设置到对应插件类的静态 `externalXxx` 字段上。

**云 SDK 永远不会被打包进产物。** 它们在 [vite.config.js](vite.config.js) 中被声明为 `external`，并列为*可选*的 `peerDependencies`。使用方按需安装 SDK，并在组件挂载前通过 `setExternalCOS/OBS/OSS(...)` 将 SDK 对象传入（见 README）。这是所有上传路径背后的核心设计决策。

### 组件层 —— [src/components/](src/components/)

- [CloudUpload.vue](src/components/CloudUpload.vue) 是唯一的对外组件。它封装 `el-upload` 并负责完整生命周期：`checkAndInit`（懒 `import()` 插件类、`getInstance`、await `waitForInitialization`）、`customUpload`（作为 `http-request` 处理器，按 `cloudType` 分发）、key 生成（`generateKey`）、预览、下载、删除以及 v-model 同步。
- [FilePreview.vue](src/components/FilePreview.vue) 是基于 `el-dialog` 的预览（图片走 `el-image`，PDF 走 iframe，txt/video/audio 内联）。它是 `CloudUpload` 的子组件，不对外导出。

### 插件层 —— [src/plugins/](src/plugins/)

`tencent.js`、`huawei.js`、`aliyun.js` 各自定义一个辅助类（`CosHelper`、`ObsHelper`、`OssHelper`），三个类具有**几乎完全一致的单例结构**：

- `static externalXxx` —— 由 `index.js` 注入的 SDK。
- `static instance` + `static refCount` —— 引用计数单例。`getInstance(config)` 递增计数；`destroyInstance()` 递减，仅在归零时才真正销毁。这是因为 `CloudUpload` 可能被多次挂载，且其 `cloudType`/`cloudConfig` 可在运行时切换 —— 组件在 `beforeDestroy` 中调用 `destroyInstance()`。
- `initPromise` / `waitForInitialization()` —— 构造函数启动异步的 `initClient`，调用方在上传前 await 它。
- 凭证处理：支持永久密钥或 `getTempCredential()` 回调；临时凭证缓存在 `localStorage` 中，并提前 60 秒视为过期。
- 断点续传的 checkpoints 缓存在 `localStorage`（各平台 key 分别为：`cosCacheDatas`、`obsCpDatas`、`ossCptDatas`），以 `name-size-lastModified` 为键，带 10 天过期清理。
- 每个类都暴露组件用到的三个相同操作：`uploadFile`、`getFileUrlByKey`、`addWatermark`。

尽管结构相似，这三个类**刻意没有**统一为基类 —— 各家云 SDK 的 API 差异很大（COS 是回调式 `uploadFile`，OBS 是 `putObject`/`uploadFile` 配合 `CommonMsg`，OSS 是 `put`/`multipartUpload` 配合 `refreshSTSToken`）。

### 工具类

- [src/utils/fileHelper.js](src/utils/fileHelper.js) —— 纯静态辅助方法：扩展名、大小格式化、文件类型分类（`image`/`video`/`audio`/`word`/`excel`/`ppt`/`pdf`/`txt`/`rar`/`other`）、图片识别、预览 URL 生成、下载。
- [src/utils/watermarkHelper.js](src/utils/watermarkHelper.js) —— 对已构建 WASM 模块 `wasm-watermark/pkg/watermark.js` 的简单转发导出。

### 新增云平台

需要改动以下所有位置（`cloudType` 的分发逻辑是重复的，并未集中管理）：
1. 新建 `src/plugins/<platform>.js` 辅助类，遵循上述单例结构。
2. 在 [src/index.js](src/index.js) 中新增 `setExternal<Platform>` 导出。
3. 在 [CloudUpload.vue](src/components/CloudUpload.vue) 中修改 `cloudType` prop 校验器、`checkAndInit`、`customUpload`、`getFileUrls` 的 switch 分支。
4. 在 [vite.config.js](vite.config.js) 的 `external`/`globals` 中，以及 [package.json](package.json) 的 `peerDependencies` 中加入该 SDK。

## 重要约定

- 全项目使用 Vue 2（通过 `@vitejs/plugin-vue2`）；`package.json` 中 `"type": "module"` 意味着 `scripts/` 和配置文件都是 ESM。
- v-model 是手动实现的：`value` prop + 触发 `input` 事件。`data().fileList` 别名指向 `this.value` 并通过引用修改，然后在成功/删除后重新触发 `input`。
- `@` 别名指向 `src/`（见 vite.config.js 的 `resolve.alias`）。
- Element UI 子组件（`Upload`、`Image`、`Tooltip`、`Dialog`、`Loading`）在 `CloudUpload.vue` 内部全局注册，而非依赖宿主应用的 Element UI 安装。
- `accept` / `maxSize` 校验仅在**未**提供 `beforeUpload` prop 时于 `onbeforeUpload` 中执行；用户自定义的 `beforeUpload` 会覆盖所有内置校验。
- 源码注释和用户可见文案均为中文；新增消息请保持一致。
- 分支按版本号管理（`v1.5`、`v1.7.7`、`feature_v1.8.0`、…），默认分支为 `main`；存在 `vue3` 分支和空的 `cloud-upload-vue3/` 目录用于 Vue 3 移植，但并非当前活跃工作。
