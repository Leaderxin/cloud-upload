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
        <h3>腾讯云配置项：</h3>
      </el-tab-pane>
      <el-tab-pane label="阿里云" name="alibaba">
        <h3>阿里云配置项：</h3>
      </el-tab-pane>
    </el-tabs>
    <h3>上传示例：</h3>
    <el-form>
      <el-form-item label="图片上传：">
        <CloudUpload
          :multiple="false"
          :limit="1"
          accept=".png,.jpg,.jpeg"
          :cloudType="cloudType"
          :cloudConfig="cloudConfig"
          v-model="fileList"
          list-type="picture-card"
        >
           <!-- <el-button size="small" type="primary">点击上传1</el-button> 
           <div slot="tip" class="el-upload__tip">
            只能上传jpg/png文件，且不超过500kb
          </div>  -->
        </CloudUpload>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import CloudUpload from "@/components/CloudUpload.vue";

export default {
  name: "App",
  components: {
    CloudUpload,
  },
  data() {
    return {
      cloudType: "tencent",
      cloudConfig: {
        bucket: "int-delivery-1301141550",
        region: "ap-nanjing",
        path: "/costest/",
        getTempCredential: () => {
          return {
            credentials: {
              tmpSecretId:
                "AKIDtzL9dH1crSeeoFGfrEZhNVrulnyWbQ1yJd1U8URkPQpQwJY5Kpc9EMQXfFXNl19z",
              tmpSecretKey: "RUDtu24g7KkN4jQUifB85l3gvb1cY7k5PaoRjSIX57o=",
              sessionToken:
                "6aK2BXF1L84tfnnhoUyWfeAE0LzFfixa3e5226784c052ee2ec426d18183bc5e3DFRCeYarLK1fxOz-EPufrE8-mclmdnQmj4C1PX7sojS5-nJ7fO76QlktFHsE1FDzyRlFPgeXlLl4VD2e9Psdztg7sRQ_SYxBJMMd_8Hv-AjpUZr1egyjxkivmwtlQZ6NA0XnxCw4N9utt0tA_RI8BeKEasmn5_bnDR0CeV5828OwIvZJdledKVM2MYc0NwcvTLHChZyFeN6HF3BQUV7nBl6n-GLoeySfbP9X-jLJvvPyz5xdrDevvHChY1sD53EFB4vLpJkLNfuy8rkGqU6bh1Dg-4rqldFnhmJQY0HsysI3Fey-H1O6Qzv3Q7-9zkxAjBrqQvdAWR6JwnptxCqYDZ6L7LqWS6X_yFB9lyOf6ZEut33Y85WikIjUWDf1tS97sMfjZU-RH4-8utSSZJLx-P1vMVqmJl0nV0Kbrheopv61HZ9Hjy6Sqs2oNmfuaZSasvBWtJUuUGzm6BtkM6fAQ58U1bkRV9yrYYbSI2O8nROHPuTZIcQ3miTZ0im5eC4K0snqNqWjn-oM7kCOD3gVoW3CP6JOSszdgePNRsFt_WI_RixJxGdian8EmKWs2f6xzBY_IfLnlvajXRqmgSK6uR0P-zzKIQ_MOtQG3auXhANynlqdkabvey_mkzjnOBJea7G9WySJ6rM-8FhFAC56tqFVzTi_iX9B-cAbMxv7B70",
            },
            requestId: "037c2e53-06f7-492e-a6c6-5d6bdcf320fd",
            expiration: "2025-09-08T03:56:12Z",
            startTime: 1757300172,
            expiredTime: 1757303772,
          };
        },
      },
      fileList: [],
    };
  },
};
</script>
