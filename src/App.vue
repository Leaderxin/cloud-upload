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
          @success="handleSuccess"
          @error="handleError"
        >
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
                "AKIDpNke5tJ7crXqfAiy4Vu3bMM9gGweAv0nR5AXiHcsbEm0KHmxeI3xNBvV5INFtkBG",
              tmpSecretKey: "wdYdTr4EZvKyKR9l7z1/IIa0K03GRLr+nJu9TyZ7CFw=",
              sessionToken:
                "pewbukajCNG5OFWOyHVReIU24t9E1Ika91974eb9e1bb0229fe4d2093c71f8577TVZNjmGQQx_LYYZ2s1LEM_tmu9H3IQnNoTpOHdOSFq_LYeeMrjI69X6v0fO52VsYJdp4izO4Qn207OGLEA7h3YsTMoQc1d5NukfwnUbnlUiD-XW0m84XmG87fqkYSH_XdFyTZAYCK6Tj9d6nQu5b3uqCTdADh96Rj2p7api8m5RVJFDeDuj7_nE_F7zuIJC11oF-WfyOGMUZQjHwmVRfKR6hYBuX9U3wrLESMrRyTGm0cfyF4H99vKNZdAD_9j6uerOfYgdmyvU9U9wWsa7A1di-_kHgO-7go0RWJy9ZY9qsEd8_9LmpBC571pH0EOpeba2M4zlkMxDM_mO2SKWEGq4hQ5F4uTqJ0D3dtRTEUTJ_3tPnU_v4G5wHpgahEjbo_Gu14V09Cojc77oka41TTiJfL_mCFYLy8qBxz--gx681M2RP7ZZHksNtO71_bpAOfCBf799pBkuOO7dr1wqwjH6lpeLZovNujYAuHX3g1EYJgvkR11nChXswwrw7jjRBEnPZRMPCpEAtxjwy_IgDgks6OQgw6k79ED2xKswTm8jMvL7Bk60hSFKP95otzYuGxfE2ongYWHZKQubq4Z5RldnnZb5eTKcGf3bFis15jaT1P_7m_PTw0cA3h83-1ppDjrkDQPLnLJEX0H0Ne2xhmkSZZiceRc0hQ3H9e7_Bu_Y",
            },
            requestId: "c6837d8d-0292-45b1-9729-1f795a29395e",
            expiration: "2025-09-16T08:18:01Z",
            startTime: 1758007081,
            expiredTime: 1758010681,
          };
        },
      },
      fileList: [
        {
          url: "https://int-delivery-1301141550.cos.ap-nanjing.myqcloud.com/costest/%E6%B5%8B%E8%AF%95txt%E9%A2%84%E8%A7%88.txt",
          //name: '测试txt预览.txt'
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
    handleError(err) {
      console.log("error:", err);
    },
  },
};
</script>
