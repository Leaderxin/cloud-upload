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
                "AKID6oZZNMaZQugnYJOMBA4NKdFKTZ2doyzdWxXQhH7gpIB7eET8O3zE0hIU0ySKp0DR",
              tmpSecretKey: "9B37HAdnUgN4Bjq886neUEjNGqgGT+t5nJhc2nuqUvk=",
              sessionToken:
                "PHoOrfKYTVBc7oCj04My010bu3mwtlva4270ebe19da2e86f722882d78d9b49f3hFTIvHqhqvw651GqolriiSntkS45U_hlJqiFb1z3sI9x7PddKU6_ptdWP6ftmFo1u_m7Zm4hCjVDAgggG0GgXzjjePv0q-XRYTL3krPjeQdZ-HEn7H8tcYSpWUKoFrzXi-jdkpcjy-872xxjjH33g67kjNvpwj8ThLmPebUbJLdCBbscfTyHEAdFwD5rLQ6b5XGRZUxKS1w9pIIUCDrBqpcAbkvHI0nEZvjmO4I5dWHRpv2TZG76RUL6HXJ8PUiidNBPLjDEiTDYaGYz5N7gjhsKoXqs597vANMn9c05KQ0MGcB85oWRxfwpHssKzNeQJpz4tTOC4Utx2kP64SURfU8KkimEpxQSOzFFHpbp81VvdQSFsYZB8GXe-cm1bmHnliZpXliM95A4_9B_UHslXUBptSCInZz_n2P-CUuUDx_s-ZHJ2o8hm4R0LCeU_wlgxb7DljM1A3H71Jbkv2_R2bOdRevGojkQaLaRTDTO6qPw0KAFoCKiKarhGf5_iawWE_qewOy0tBPntIyJSv7sNn9ISmP2dJq1lKnkeo590QDyfP_Bm1V0s6Qc28zcXXF6qdpqYjtXa7NVdrvVAfi7q1pYVSU5Evx1bcrr-oILgKh-FpOt5waVsijdAQfpjhwr5JCmdeWzUx2ETBTyj58TtGe0rk-wu-l3PBASarXg7jM",
            },
            requestId: "05056573-0c26-44a0-aaf1-0532e33ecfe0",
            expiration: "2025-09-15T08:07:59Z",
            startTime: 1757920079,
            expiredTime: 1757923679,
          };
        },
      },
      fileList: [
        {
          url: "https://int-delivery-1301141550.cos.ap-nanjing.myqcloud.com/costest/uTools-7.2.1.exe?q-sign-algorithm=sha1&q-ak=AKIDMjGEBPM5gKulyQbPTzfEnluFbp6ISLUAb0R9CNzyC1IQclwLgBs6s09UdPjjtMTO&q-sign-time=1757661291;1757664891&q-key-time=1757661291;1757664891&q-header-list=host&q-url-param-list=&q-signature=b5cbc952f655699c7aa14a7c2e510ebe90ad279e&x-cos-security-token=bnA421ptbcKq0QOmCnB5kYGVIIowYaua1e598c04a23dd86641affccec9300a1bWesWpRI_91NM0xVv1LUe5SHObHwDTD45-GhZB_IP8FwTbVyvAiK7rdlEUj2M4cWMRxozRzNmORZI-10Jri9ibL48GZfUhygzLSoxDtYu5zbGDV0ljEyvHa5-M103o8rQh2NKo_0lg2-mYN7crGRgpAxVRdrmCXt639LnqgfnOciA0-9rAcRAVl7L7WBjcgNyGpbPlGcdHiBfEjR4qB6fzFFPPQN1Xd5rlYg1edOwRxIruOY-9AnuhERX18HsZSMoYSnVVDNC4h6hW_jhnekvww",
          name: "uTools-7.2.1.exe",
        },
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
