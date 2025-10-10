## 全局注册(华为云obs)

```javascript
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