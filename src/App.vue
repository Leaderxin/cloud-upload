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
          :limit="3"
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
        getTempCredential: async () => {
          return {
            credentials: {
              tmpSecretId:
                "AKIDQG7nARUt6py8Aahwieg_Cqg1a_2CePEpOz8yWY13ZZc5spmXkSdfpRlDfTbOPUEC",
              tmpSecretKey: "7Ye8hbVtg4F73q8T1mp1c4Cm53nSLeBqCRoh+qbj5kU=",
              sessionToken:
                "lXhdUO6FIb2ywg8nOLVwqhTEocXH5Z7a9700b61ae67a446c9a86a8bf962d46f2t799CnJrr1zZtqpzorFObeiosHZxBZ7LRqhqP3Po1qMFLsJ0dIfKSGgFIyoGe0ofVuYgHbU0W1K0vwlQXEVYQID7wcYQDayXVqk4LZP0sNf1LhuctvoOryfDYGlZvuLIJpF0i54a7h_vAgNdW9ujHpajq22MuIkHxVeF6wXiPuA7HL2nuAkVoooffhLjXuJvmdlPDq5xts3l6tknEgnmVFGIDDUOvo9mJzLqsUbSw5a8TcRRFtm6P3njoYJavh6WBwlW3O9uWu9z9HjWoV9Ya16CmZJ7KcIfYPp6BKE8u_v2QCYnLlEqOZKrDeEoeTf4qKTeYuCNgDj4SxVPAvnFD_7uwfqSIcNP3mOUpjQ-4FTKneLjTRo051nhJNGwm9CQEk_4nCRxsKgpvTt90-F-uO7wadiQNWbkN2xffO-JEf0amphXC988Nb0ZGfMGuDfTNfP9dQIvB43JFcr3ADepq3FDS9gp7-whYmEkBztYLh6Qz6ZGd0egtLqp0lpSgXsBA1_spWVwO7xiX9XAzQ8CbPQPzvYYQNZiWUGCskuTfN06Kp2asuQJtgMjtp7LNyMrjrbd3ntQQzuWcH-L1PCcyFAhxGpNQUpV-0FV0vQKUtpNoQQCOAUhak1e-WC4H3cT0Y_2zApNnfXC02zkfeBRQkwXjDKEJlbAhagNBfSGIf8",
            },
            requestId: "725e0ca7-d372-4ef8-89cf-a5f7278347ab",
            expiration: "2025-09-09T07:57:17Z",
            startTime: 1757401037,
            expiredTime: 1757404637,
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
