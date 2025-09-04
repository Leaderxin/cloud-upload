// src/index.js
import CloudUpload from './components/CloudUpload.vue';

// 定义 install 函数，用于 Vue.use() 注册
CloudUpload.install = function (Vue) {
  Vue.component(CloudUpload.name, CloudUpload);
};

// 自动注册（当在浏览器环境中通过<script>标签直接引入时）
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.component(CloudUpload.name, CloudUpload);
}

// 导出组件，用于按需引入 (import { CloudUpload } from 'your-package-name')
export default CloudUpload;