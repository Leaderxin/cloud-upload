// src/index.js
import CloudUpload from "./components/CloudUpload.vue";
import ObsHelper from "./plugins/huawei";
import CosHelper from "./plugins/tencent";

// 定义设置外部COS对象的函数
export function setExternalCOS(COS) {
  CosHelper.setExternalCOS(COS);
}

// 定义设置外部OBS对象的函数
export function setExternalOBS(OBS) {
  ObsHelper.setExternalOBS(OBS);
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
