import CloudUpload from './components/CloudUpload.vue';
import FilePreview from './components/FilePreview.vue';

// 导出设置外部SDK的函数
export function setExternalCOS(COS: any) {
  // 延迟加载并设置
  import('./plugins/tencent').then(module => {
    module.default.setExternalCOS(COS);
  });
}

export function setExternalOBS(OBS: any) {
  // 延迟加载并设置
  import('./plugins/huawei').then(module => {
    module.default.setExternalOBS(OBS);
  });
}

export function setExternalOSS(OSS: any) {
  // 延迟加载并设置
  import('./plugins/aliyun').then(module => {
    module.default.setExternalOSS(OSS);
  });
}

export { CloudUpload, FilePreview };
export default CloudUpload;