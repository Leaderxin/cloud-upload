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
                "AKIDCVe5OrJ57ufQuJMoO-UUS2uVYLlTStmCy9TGazDd5td1nGxH_tpDEaU2Cpj92mvV",
              tmpSecretKey: "WhhgIzCIG8yTfnqmHsHB/OugLW+y2ISKP1GNbYPy2Pg=",
              sessionToken:
                "1LLnI9lo7G0exDx5WFwjpm4yiJM5MEYa09d0463aee04bdfd21c12bfe78f505d6Jqbxfes518KqeVic5PGzkjog00tKOnwe7uB3yMBtAfd4VDuqZvZjWzohxjVWWKLAy60Ugh8tGxztjuLn7JsvCnQFiE2rRb47wSSseCImMSXto0GP8zMRMlS7eYrKU7GHtumSseqXMwd3KSNezGxqDhT9h6WNGMi5lsTkPFQQESpJqXpvf9nWtFzid0DKt5BasE6RKIiFvmJj2kMFXlJ9ggzGbNJsWF_RfzywaGRNalJZkym4YKLUezjZ0zZ-czxAxhotWGBc34NCBZ7vaPfFhBOjVNz2J9LFiO3X4HTocl0k7WmeD592pFPkYhMTLNs6Gcz5sEBsetH7ewOV_R_WpWRjBTFp95-OkGFE0K3zJV2nVm-vW40LlHTVrLzGIluK0tyiEFI7-VcI8G2wubzX9jR0qUmzrMkiAh-3vaypLrKN22oxA4XZXJzZ2mPTKRLy9pwUyyqGEi6jrW9pFWByTBVVEdoZYPC4AIEEI_ghc2iBPUQyKWq9zKGspfq-nNbwWNChkjKZu7meUbP17iGCSY3HmS7z5s12OY-EnOazUXtPfDFdS-FrjaqvLdpVTPJ2eIYqVpNYlyRLh-dsSmSuQnDh-BzjvW4in25EN2vapxqwGt7NM85jWt81kAEQB0JSZW-kdnAMFLuGi1gukZBERzNaqWiOc8nTAdE0gn4iyLw",
            },
            requestId: "8aa7c909-c896-447b-bac0-cdcb2a2a2c5d",
            expiration: "2025-09-12T08:01:36Z",
            startTime: 1757660496,
            expiredTime: 1757664096,
          };
        },
      },
      fileList: [],
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
