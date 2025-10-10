## 全局注册(腾讯云cos)

```javascript
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
      //     "tmpSecretId": "3rn/KVRRTGQw5CVFh4IQoqBBm/1LrdvjyFw7YiqbJk8="
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