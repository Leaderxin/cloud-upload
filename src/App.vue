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
          :multiple="true"
          :cloudType="cloudType"
          :cloudConfig="cloudConfig"
          v-model="fileList"
          list-type="picture-card"
          @success="handleSuccess"
          size="small"
        >
          <!-- accept=".png,.jpg,.jpeg" -->
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
        getTempCredential: async () => {
          return {
            credentials: {
              tmpSecretId:
                "AKIDSIyLDLqbtpbTr5LR6Cz7kEq6R_dI-Ugd2fk9f20mc37-4zwKVaq-5Dx8QEmKcwr2",
              tmpSecretKey: "dcHrNnlQL5f3fL6TwDalsBjahaCGUbJBJQBFp/K9BAI=",
              sessionToken:
                "PHoOrfKYTVBc7oCj04My010bu3mwtlva54fd30c2f7b54ec4255397cd0bb82805hFTIvHqhqvw651GqolriieT-YY7vHgTM50TbyM2EuwQK0SxGAM7oBbiGdHgNLoaeJ-OJbWyggzT4pD8bR-qIwdCcHod_DkEF_196TQG9QkWwTaR43er0Q2qGWAru1Qz1T1MsvCWQWZAVV2wv43u1Aq7bvESAE4n1kvYI_qBe1DOCLMGvxp3nfvcFlJQa91zlbqhInOS3QHeDD0ZipUHbVlQNYKgcbXvZBmW7ow6FXIOoGZH3WLznoRLr01WeXtc36hROyeZwuu09p1rvTqRmcvsZbQ3n3tvHccRB9e10j2DOIwXXGm91KEEy9HFgPHIyT7rWnjparE3_z34N7uQbGSgpltQZpjcdgoBNa3UMzg4QBYxrdyqbiuJWPTOV6huJ3Xbkzfp1PEi76OlS38-08tc_GAWs4KphEtadkJCPSrJXfCX4f2OVxmhgHp3juuFAPNCCio7OeIOw9GBIZWvSdmrTKNyXbCkh_WGMR1EhBSc_HjX4od5Nw9PtfE4Y9IwJw8Te20Rk8z6PNxSXc76gG_f1CZIpOnkUlLJWlfkHLfbKt2GerMLth1XtFmYj6eGeK68hzFQLJ-3T_cEspeWIGT5xUCOgIcqeQB0y5Ns_Sd0wYhy5VRQeMn-7S1zGds5mr0WDpQA_ICM7SBdIN7Rw-SbfxM1mMGBUSpNi8eG0nRA",
            },
            requestId: "56289dc5-57f4-4bfe-80d3-afd603e4fad7",
            expiration: "2025-09-15T10:12:40Z",
            startTime: 1757927560,
            expiredTime: 1757931160,
          };
        },
      },
      fileList: [
        {
          url: 'https://int-delivery-1301141550.cos.ap-nanjing.myqcloud.com/costest/%E6%B5%8B%E8%AF%95txt%E9%A2%84%E8%A7%88.txt',
          //name: '测试txt预览.txt'
        }
      ],
    };
  },
  methods: {
    handleBeforeUpload(file) {
      console.log("handleBeforeUpload");

      return false;
    },
    handleSuccess(result, file) {
      console.log("success:", result, file);
    },
  },
};
</script>
