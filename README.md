# 使用指南

## 安装

```bash
npm i vue-clound-upload
```

## 全局注册

```javascript
import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import CloudUpload from "vue-clound-upload";

Vue.use(ElementUI);
Vue.use(CloudUpload); // 或 Vue.component(CloudUpload.name, CloudUpload);
```

## 按需引入

```vue
<template>
  <div>
    <cloud-upload :cloud-config="tencentConfig" cloud-type="tencent" @success="handleSuccess"></cloud-upload>
  </div>
</script>

<script>
import CloudUpload from 'vue-clound-upload';

export default {
  components: { CloudUpload },
  data() {
    return {
      tencentConfig: {
        //腾讯云cos桶名
        bucket: "", 
        //腾讯云cos桶所在地域
        region: "",
        //文件上传目录，自定义
        path: "/costest/",
        //临时凭证获取函数，需按照示例结构返回所需参数
        //此临时凭证调用后端接口获取，后端接口调用腾讯云api生成
        getTempCredential: () => {
          return {
            credentials: {
              tmpSecretId:
                "",
              tmpSecretKey: "",
              sessionToken:
                "",
            },
            requestId: "",
            expiration: "",
            startTime: 1757401037,
            expiredTime: 1757404637,
          };
        },
      }
    };
  },
  methods: {
    handleSuccess(result, file) {
      console.log('Upload success:', result.url);
    }
  }
};
</script>
```
