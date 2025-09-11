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
                "AKIDWoexOvT1oALwKqdUVwiRBYURwGUjpXW0FXewO1mqxJvhuhGP25mRMTFNo1OLamas",
              tmpSecretKey: "4MwzMvRp8kYzU5uazqyE08XL64FPyFlyzWhohtik7jQ=",
              sessionToken:
                "uibTMOM75q7B11AIAcNXmG7ETsTJw0Uaaf7be19e70dcb2a194fd3866cc2c7ef9PNyiU0Fv4DgTi_09Z4a9n-J3oTXHgSOS6kC3kMj0Q4y3EKjXK11t6OM1AaoyY-_WuAY8KAwU3gAD8IuX8P143QsB_0WlbunayvXcTGabxgZ1TnIfZqQSNideMyW3K6yTzCWQ_Mp7IYw7NcQ44rdGdtXVw0zViuLxPfaBhJlU9DU-eKe020PzGbI8lpls4BImhstfhCdBjmWCzbYwWBAWFSe5R1B4F8gs4fvbRckaa_uLqpzo8DAqqHdDm2RFSVHMJeL084rOoXllSknnpGlVFPCyqWScDKXHxIs6pV24i80OKz1vgTb4LKo55Bkgtoso0kbCGxJGakXYyJM7wMAO6fonkkYi1NZBFA4jd2kyb2RzKFaqJM0PR7AQxPt5KjcGhssUWiSO0yBVXmgwN2AjvwGrjl5R0wfAmSslogjavkWjRrNSeWIKl6KlfIuWnciPuLfxVoMMHacxO8wYzJc6YW3V0djqsD8HXWLpEX1gVjagsAZG0seeLuxMddm-LuAPGDth3L4tmtZbER48QECg0UuwuRoJ25e5BrHoRQDA4SCXsu7erf3GOUSEl5KASZh_1iN9j16MGqpU2hwI_OwaL-gVlw-lkfH6VreL9x7rpttaA3ASEMn4YWFzL7hAiXKSe0G_Tr30XuSa11HPIWdR_f6J7Sno5OjxpO0Uwq6o4xY",
            },
            requestId: "c72ce2f8-fdf1-4273-bf09-160caff8713c",
            expiration: "2025-09-11T09:55:49Z",
            startTime: 1757580949,
            expiredTime: 1757584549,
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
  },
};
</script>
