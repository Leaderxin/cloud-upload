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
      <el-form-item label="单个图片，大小限制10Mb">
        <CloudUpload
          :multiple="false"
          :limit="1"
          accept=".png,.jpg,.jpeg"
          :cloudType="cloudType"
          :cloudConfig="cloudConfig"
          v-model="fileList"
        ></CloudUpload>
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
      cloudType: "tencent1",
      cloudConfig: {
        bucket: "int-delivery-1301141550",
        region: "ap-nanjing",
        path: "/costest/",
        getTempCredential: () => {
          return {
            credentials: {
              tmpSecretId:
                "AKID-qfBR4lmmi62AFcpZgtsWBKaoVs3uefRrFC5ua_lVC07rs8WMYH9z0UlktArfBsL",
              tmpSecretKey: "MxWfaVN1Wt0iuaZVHV95TvxbZ9nDVgfh47jX63DHAmQ=",
              sessionToken:
                "veOwpLGi3UnznQR8k4wumJUVqFcmpyVa2b4799fb91d2a8b40efc3ae1028b58e8HkNFb9c-DMJ2rPscAC9PU-WScX2B311EkSZDWQolWWloJoX47yaQL0yUB7wqmCqNzVNVAZJrp0vjLgBJnAKmkrGMBtOJdXpGlA78C9xFfeKOrEY60dJh7cV3Ebgn59KfCA-brTL_NYGov3IrLpR-_s7H41Mi-KOEJUfvmEMbSl3OEtEXPblwBwqC8nCpFItzX5dXaYu9BxcQPGfv2OziUEbeF9T-Kqwprd8dts_2IEcGLo-6i9fUqxPaQHBY0CXjowee90QMzhA2WexP3KUCNJgGDSzZ4x7kso560VVeLLl97y3yfTeeaOGvDSz4UgpeOSbn2Ti_NgSkYFijLsec6_DhTcBVMbaQmW-Jk5-aIFDjZ6deFk4J5Z31Gw2foeZMaPIIeQc2z3E-eZ9kR_VpysZSdls5J0JWS18hCeKMUY86DeBFzlpjqC_g8z4ly52gxdCBUZlYd5EY7XtFycM0nhRgp4ndhbjpYYahXEiHtJ5ZqYcFChCsQqVdchXd0RVfkDbSB7z4Yy-hwYQlTGhiX0Uv1n7JKoz68WJvI7ZpbH529UtiXxJ6dgdGqANElZEGJsRUdSOnt7uynXysifbQHMv9GyvGDxYMrsCdy2iZKiHNe57EW-x11_bnooQjo4BHd9ms6scpZWrinJuDpsCFG6oWZbE8Z-NJGstzTkievVc",
            },
            requestId: "54167d11-9a62-48e3-8ae7-5bd364e82cf3",
            expiration: "2025-09-04T09:20:02Z",
            startTime: 1756974002,
            expiredTime: 1756977602,
          };
        },
      },
      fileList: [],
    };
  },
};
</script>
