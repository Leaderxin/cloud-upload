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
                "AKIDcS8MrIa4tq8LQgfzrVp_j1eWuplnMEZWgmHxef3wfSj3-7DCxssL_R2KuCsY9daJ",
              tmpSecretKey: "lYYblowV1VvaC4ux5r2fMLeaMFkqkqXjd0ID0YmRCt8=",
              sessionToken:
                "uibTMOM75q7B11AIAcNXmG7ETsTJw0Uad5bebec092cfd2b4c4c801d56df9ba0dPNyiU0Fv4DgTi_09Z4a9n8YFrwl1LfT44rTPzSmiXwQLx8UGcyrRutu38zwJ-EavlNOc74aeA5ksnWoXVCMKQ8opze9owjhtiMGRII4BCMXVblvtYKyy8ezi7hGxeM5jaFwGqP_QMGUCVRvdcgrKeirqzKBnLOpI1UlKe0Sqag-HJtWokgV0Wfc2kItTR1_AF1oC50IUGChF6XtfU4T5GtHzZhYo1I9r-tcloaz50xU45jJcG9MvbjDUgWMlKWsdvYjOlwGZycZiFN9jZt2RXxTx4WVNQeeH40pS7egoXGWYeOV8HS_6h-vFWhO8e1osgbNObj3Um8NXgj8awH0aJb03W2I0ugcEJJG_uHUUxoXDkweJOmAd_MnkEXU1c14xR_sCCYff30cWoTPfEXCsaWzItZyhboTrUnjlXPIo4HM5lrFDhpqmpngB7fms6M9tCBlkKNcq8wmlB234cd8QIo4X9KM3EO_iHaOzwwEa0d5sLvWIIJQASHsGZRLIoFwUt-8z1dz2rHRrWnAAFk_BH_ESlzrTZXp3bkuqK3ltyF-l-eVjjWgRaYJQlUvE73ePq5dN9iBs5clW-PhRorI_Vl_psSlVzarrAeZqHD0Nc2d0gcszmJwju7IazD12dlQEcswpsg10Am1GGzLopZQ8eNMB7AzquVC5kwfEYTCVk9o",
            },
            requestId: "b4c53dbd-4a91-47ed-92d7-83293e8ec1ff",
            expiration: "2025-09-11T01:56:21Z",
            startTime: 1757552181,
            expiredTime: 1757555781,
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
