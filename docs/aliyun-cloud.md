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