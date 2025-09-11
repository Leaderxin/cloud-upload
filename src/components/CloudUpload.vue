<template>
  <div class="cloud-upload">
    <el-upload
      ref="innerUpload"
      action="#"
      :file-list="fileList"
      :multiple="multiple"
      :accept="accept"
      :limit="limit"
      :drag="drag"
      :show-file-list="showFileList"
      :on-exceed="handleExceed"
      :on-remove="handleRemove"
      :before-upload="onbeforeUpload"
      :http-request="customUpload"
      :list-type="listType"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <!-- 默认插槽内容 -->
      <template v-if="!$scopedSlots.default">
        <i
          slot="default"
          class="el-icon-plus"
          v-if="listType == 'picture-card'"
        ></i>
        <el-button size="small" type="primary" v-else>点击上传</el-button>
      </template>
      <!-- 暴露所有默认插槽 -->
      <template
        v-for="(_, slotName) in $scopedSlots"
        v-slot.[slotName]="scoped"
      >
        <slot :name="slotName" v-bind="scoped" />
      </template>
      <!-- picture-card文件列表插槽默认内容 -->
      <template
        v-if="!$scopedSlots.file && listType == 'picture-card'"
        slot="file"
        slot-scope="{ file }"
      >
        <el-image
          ref="previewImg"
          fit="contain"
          class="el-upload-list__item-thumbnail"
          :src="file.url"
          :preview-src-list="getPreviewList"
        ></el-image>
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-preview">
            <i class="el-icon-view" @click="() => handlePreview(file)"></i>
          </span>
          <span v-if="!disabled" class="el-upload-list__item-delete">
            <i class="el-icon-download" @click="() => handleDown(file)"></i>
          </span>
          <span
            v-if="!disabled"
            class="el-upload-list__item-delete"
            @click="() => handleRemove(file)"
          >
            <i class="el-icon-delete"></i>
          </span>
        </span>
        <el-tooltip
          class="item"
          effect="light"
          :content="file.name"
          placement="top"
        >
          <span class="file-name" @click="() => handleDown(file)">{{
            file.name
          }}</span>
        </el-tooltip>
      </template>
    </el-upload>
  </div>
</template>

<script>
import '@/assets/iconfont/iconfont.css'
import Vue from "vue";
import CosHelper from "../plugins/tencent";
import fileHelper from "../utils/fileHelper";
import { Upload } from "element-ui";
Vue.component("el-upload", Upload);

export default {
  name: "CloudUpload",
  inheritAttrs: false,
  props: {
    /**
     * 是否支持多选文件
     */
    multiple: {
      type: Boolean,
      default: false,
    },
    /**
     * 是否显示已上传文件列表
     */
    showFileList: {
      type: Boolean,
      default: true,
    },
    /**
     * 是否启用拖拽上传
     */
    drag: {
      type: Boolean,
      default: false,
    },
    /**
     * 接受上传的文件类型（thumbnail-mode 模式下此参数无效）
     */
    accept: {
      type: String,
    },
    /**
     * 文件列表的类型 text/picture/picture-card
     */
    listType: {
      type: String,
      default: "picture-card",
    },
    /**
     * 是否禁用
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * 最大允许上传个数
     */
    limit: {
      type: Number,
    },
    /**
     * 单个附件大小限制mb
     */
    maxSize: {
      type: Number,
    },
    /**
     * 使用的云平台类型 tencent腾讯云桶
     */
    cloudType: {
      type: String,
      default: "tencent",
    },
    /**
     * 云平台配置参数，包含桶名，地域，上传目录，凭证获取等
     */
    cloudConfig: {
      type: Object,
      required: true,
      default: () => ({
        bucket: "",
        region: "",
        path: "",
        getTempCredential: () => {
          return {
            TmpSecretId: "",
            TmpSecretKey: "",
            SecurityToken: "",
            StartTime: "",
            ExpiredTime: "",
          };
        },
      }),
    },
    /**
     * 自定义v-model
     */
    value: {
      type: Array,
      default: () => {
        [];
      },
    },
    beforeUpload: {
      type: Function,
      required: false,
    },
    onExceed: {
      type: Function,
      required: false,
    },
  },
  data() {
    return {
      fileList: this.value,
    };
  },
  computed: {
    getPreviewList() {
      let result = [];
      this.fileList.forEach((item) => {
        const url = item.url;
        const index = url.lastIndexOf("/");
        const filename = url.slice(index).toLocaleLowerCase();
        const image = [".png", ".jpg", ".jpeg", ".bmp", ".gif"];
        if (image.some((x) => filename.includes(x))) {
          result.push(url);
        }
      });
      return result;
    },
  },
  created() {
    this.checkAndInit();
  },
  methods: {
    checkAndInit() {
      //检查关键参数传入
      const typeList = ["tencent"];
      if (!this.cloudType) {
        console.warn("未设置云平台类型cloudType!");
      } else if (!typeList.includes(this.cloudType)) {
        console.warn(`云平台类型cloudType设置错误，应为${typeList.join("/")}`);
      }
      switch (this.cloudType) {
        case "tencent":
          CosHelper.getInstance(this.cloudConfig.getTempCredential);
          break;
        default:
          break;
      }
    },
    // 自定义上传方法
    async customUpload(options) {
      const { file, onProgress, onSuccess, onError } = options;
      const uploadConfig = {
        file,
        ...this.cloudConfig,
        onProgress: (progressEvent) => {
          // 计算进度并触发事件
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress({ percent });
          this.$emit("progress", percent, file);
        },
      };

      try {
        let result;
        // 根据云平台类型选择上传方法
        switch (this.cloudType) {
          case "tencent":
            result = await CosHelper.getInstance().uploadFile(uploadConfig);
            if (result.statusCode == 200) {
              this.fileList.push({
                uid: file.uid,
                name: file.name,
                url: result.Location.startsWith("https://")
                  ? result.Location
                  : "https://" + result.Location,
                CosResult: result,
              });
            }
            break;
          case "volcengine":
            result = await tencentUpload(uploadConfig);
            //result = await volcengineUpload(uploadConfig);
            break;
          default:
            throw new Error(`Unsupported cloud type: ${this.cloudType}`);
        }
        onSuccess(result, file);
        this.$emit("success", result, file);
      } catch (error) {
        onError(error);
        this.$emit("error", error, file);
      }
    },

    onbeforeUpload(file) {
      if (this.beforeUpload && typeof this.beforeUpload == "function") {
        return this.beforeUpload();
      } else {
        // 文件类型和大小校验逻辑
        let isTypeValid = true;
        if (this.accept) {
          const list = this.accept
            .split(",")
            .map((item) => item.replace(".", ""));
          isTypeValid = fileHelper.checkFileType(file, list);
        }
        const isSizeValid = this.maxSize
          ? fileHelper.getFileSizeMB(file) < this.maxSize
          : true;
        if (!isTypeValid) {
          this.$message.error(`文件类型必须是 ${this.accept} 中的一种!`);
          return false;
        }
        if (!isSizeValid) {
          this.$message.error(`文件大小不能超过 ${this.maxSize}MB!`);
          return false;
        }
        return true;
      }
    },
    handleRemove(file, fileList) {
      this.fileList = this.fileList.filter(
        (x) => x.uid != file.uid && x.url != file.url
      );
      this.$emit("input", this.fileList);
    },
    handlePreview(file) {
      this.$refs["previewImg"].clickHandler();
      console.log(this.$refs["previewImg"].$el.click);
    },
    handleDown(file) {},
    handleExceed(files, fileList) {
      if (this.onExceed && typeof this.onExceed == "function") {
        this.onExceed(files, fileList);
      } else {
        this.$message.warning(`当前限制最多选择${this.limit}个文件！`);
      }
    },
  },
  watch: {
    value(val) {
      this.fileList = val;
    },
    cloudType(val) {
      this.checkAndInit();
    },
  },
};
</script>
<style lang="scss" scoped>
.cloud-upload {
  ::v-deep .el-upload-list--picture-card {
    .el-upload-list__item {
      overflow: visible;
      .file-name {
        display: inline-block; /* 必须设置为块级或inline-block */
        max-width: 100%; /* 限制最大宽度 */
        white-space: nowrap; /* 禁止换行 */
        overflow: hidden; /* 隐藏溢出内容 */
        text-overflow: ellipsis; /* 显示省略号 */
        cursor: pointer;
      }
    }
  }
}
</style>
