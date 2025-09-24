<template>
  <div id="app">
    <el-tabs v-model="cloudType">
      <el-tab-pane label="腾讯云cos" name="tencent">
        <h3>腾讯云配置项：</h3>
        <el-form>
          <el-form-item label="bucket(桶名)">
            <el-input size="mini" v-model="cloudConfig.bucket"></el-input>
          </el-form-item>
          <el-form-item label="region(地域)">
            <el-input size="mini" v-model="cloudConfig.region"></el-input>
          </el-form-item>
          <el-form-item label="path(文件上传目录)">
            <el-input size="mini" v-model="cloudConfig.path"></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="火山云" name="huoshan">
        <h3>火山云配置项：</h3>
      </el-tab-pane>
      <el-tab-pane label="华为云" name="huawei">
        <h3>华为云配置项：</h3>
      </el-tab-pane>
    </el-tabs>
    <h3>上传示例：</h3>
    <el-form>
      <el-form-item label="图片上传：" v-if="ifUpload">
        <CloudUpload
          :multiple="true"
          :cloudType="cloudType"
          :cloudConfig="cloudConfig"
          v-model="fileList"
          @success="handleSuccess"
          @error="handleError"
        >
        </CloudUpload>
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="ifUpload = !ifUpload">删除/添加组件</el-button>
  </div>
</template>

<script>
import COS from "cos-js-sdk-v5";
import CloudUpload from "@/components/CloudUpload.vue";
import CosHelper from "./plugins/tencent";
CosHelper.setExternalCOS(COS)
export default {
  name: "App",
  components: {
    CloudUpload,
  },
  data() {
    return {
      cloudType: "tencent",
      cloudConfig: {
        bucket: "test-tos-1257156776",
        region: "ap-guangzhou",
        path: "/costest/",
        getTempCredential: this.getTempCredential,
      },
      fileList: [
        {
          url: "https://int-delivery-1301141550.cos.ap-nanjing.myqcloud.com/costest/%E6%B5%8B%E8%AF%95txt%E9%A2%84%E8%A7%88.txt",
          //name: '测试txt预览.txt'
        },
      ],
      ifUpload: true,
    };
  },
  methods: {
    /**
     * 调用后端接口返回临时凭证
     */
    async getTempCredential() {
      const response = await fetch("http://localhost:3000/sts");
      const data = response.json();
      return data;
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
    handleBeforeUpload(file) {
      console.log("handleBeforeUpload");

      return false;
    },
    handleSuccess(result, file) {
      console.log("success:", result, file);
    },
    handleError(err) {
      console.log("error:", err);
    },
  },
};
</script>
