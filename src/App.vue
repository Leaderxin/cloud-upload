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
                "AKIDKTeBmYSUuWVzdtOIC88pdQ-yLfDu3t7CHVn1_fsbXuEnYaHGASXR0x6gaUs_PX_J",
              tmpSecretKey: "Z/Pqq5XA7Ip2+e5W0OHbznIElevV0L1oPIxNFllA5Ys=",
              sessionToken:
                "uibTMOM75q7B11AIAcNXmG7ETsTJw0Uac05bdbab0d2b3614089e8ec43442d343PNyiU0Fv4DgTi_09Z4a9nw5NTe32TbmYt4eIdxgIYK8pl13dsQN2_JLx8EPfS4o9STHeK0gz-W5hmifkLRKm1j2_1XUgwULV-9PcnkZCch96KjkqoSLK0WaJt67z_t20CqD5T7kVCZ79i6LCZVzErdKZ738z8lYHBjPJepH7pkndHXsUYbKHP2eoPXpzvVcbTX0GGYLO_XbaXAKoihuGS9xevRnNTDVLLeOgyNQSakIUXWo_Da_iBzZvC5Wl7rg9a94MGn0X9jOWKVEK2AdDPMtlkHDmqg1Dg1GwCdJHwsYO0H0UMxDoF5ABTC7_mjb-9SyoWfInn1Sj4-7zlssr4IZl0jIpQz12ape-F7OqrXDPbmjR1jQXhWniOfxFwz1y_iGnunibZRfyEbEkwck6UJRx-ij42Y9NgocDqpxfMIJktaspLr-hwtmNvvXr97zx3zPEuy1UKqdQihzWpUCp4m7s3cmzkJcPJOn7gPHDDrd0GhphK6kDIzpSJu97GTDf4Bxr2fk-_Pc8V6H2PJWdmYDDWgJ6Jc24HCKFlxZAguRClyh52gJWK-Gl3JciMleSFfcum_iNztZED5PhshbQYXZPeTh8KKLw-zeG_9nMTfANViJODqqLhI9O0OZQ5iTdN2QUczNUjajJCS6rx_oO05e9c6Y5NeoZmicytdaS_OE",
            },
            requestId: "5cc0d9ee-97c6-4b19-831a-d5835cc510ce",
            expiration: "2025-09-11T08:35:23Z",
            startTime: 1757576123,
            expiredTime: 1757579723,
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
