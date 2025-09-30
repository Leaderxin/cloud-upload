// src/index.js
import CloudUpload from "./components/CloudUpload.vue";

// 只导出设置函数，不直接导入插件
export function setExternalCOS(COS) {
  // 延迟加载并设置
  import("./plugins/tencent").then(module => {
    module.default.setExternalCOS(COS);
  });
}

export function setExternalOBS(OBS) {
  // 延迟加载并设置
  import("./plugins/huawei").then(module => {
    module.default.setExternalOBS(OBS);
  });
}

// 定义 install 函数，用于 Vue.use() 注册
CloudUpload.install = function (Vue) {
  Vue.component(CloudUpload.name, CloudUpload);
};

// 自动注册（当在浏览器环境中通过<script>标签直接引入时）
if (typeof window !== "undefined" && window.Vue) {
  window.Vue.component(CloudUpload.name, CloudUpload);
}

// 导出组件
export default CloudUpload;
