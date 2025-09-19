<template>
  <div :class="['cloud-upload', 'cloud-upload-' + size]">
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
        <div class="default-content" v-if="listType == 'picture-card'">
          <i slot="default" class="el-icon-upload"></i>
          <span v-show="!disabled">点击上传</span>
        </div>
        <el-button :size="size" type="primary" v-else>点击上传</el-button>
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
          v-if="getIfImage(file)"
          :preview-src-list="getPreviewList"
          :ref="getImgRef(file)"
          fit="contain"
          class="el-upload-list__item-thumbnail"
          v-loading="getFileLoading(file)"
          :element-loading-text="getFilePercent(file)"
          :src="file.url"
        ></el-image>
        <div
          v-else
          class="el-upload-list__item-thumbnail previewIcon"
          v-loading="getFileLoading(file)"
          :element-loading-text="getFilePercent(file)"
        >
          <i :class="['cloud-upload-icon', getFileIcon(file)]"></i>
        </div>
        <span class="el-upload-list__item-actions">
          <span
            class="el-upload-list__item-preview"
            v-if="getPreviewConfig[getFileType(file)]"
          >
            <i class="el-icon-view" @click="() => handlePreview(file)"></i>
          </span>
          <span class="el-upload-list__item-delete">
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
          :content="getFileName(file)"
          placement="top"
        >
          <span class="file-name" @click="() => handleDown(file)">{{
            getFileName(file)
          }}</span>
        </el-tooltip>
      </template>
    </el-upload>
    <FilePreview
      :visible.sync="previewVisible"
      :file="previewFile"
    ></FilePreview>
  </div>
</template>

<script>
import "@/assets/iconfont/iconfont.css";
import "@/assets/iconfont/iconfont.js";
import Vue from "vue";
import CosHelper from "../plugins/tencent";
import fileHelper from "../utils/fileHelper";
import { Upload, Loading, Image, Tooltip, Dialog } from "element-ui";
import FilePreview from "./FilePreview.vue";
Vue.component("el-upload", Upload);
Vue.component("el-image", Image);
Vue.component("el-tooltip", Tooltip);
Vue.component("el-dialog", Dialog);
Vue.use(Loading.directive);
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
     * 默认ui组件大小 medium / small / mini
     */
    size: {
      type: String,
      default: "small",
    },
    /**
     * 触发分块上传的阈值 默认10Mb
     */
    sliceSize: {
      type: Number,
      default: 1024 * 1024 * 10,
    },
    /**
     * 分块大小，默认5MB，非必须
     */
    chunkSize: {
      type: Number,
      default: 1024 * 1024 * 5,
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
     * 附件预览/在线查看配置
     */
    previewConfig: {
      type: Object,
      required: false,
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
      previewUrl: "",
      previewVisible: false,
      previewFile: {},
    };
  },
  computed: {
    getPreviewList() {
      let result = [];
      this.fileList.forEach((item) => {
        if (this.getIfImage(item)) {
          result.push(item.url);
        }
      });
      return result;
    },
    getPreviewConfig() {
      return Object.assign(
        {
          image: true, //图片附件默认开启预览
          video: true, //视频附件默认不开启预览
          audio: true, //音频附件默认不开启预览
          word: false, //word
          excel: false, //excel
          ppt: false, //ppt
          txt: true, //txt
          pdf: true, //pdf
          rar: false, //压缩包
        },
        this.previewConfig
      );
    },
  },
  created() {
    this.checkAndInit();
  },
  beforeDestroy(){
    CosHelper.destroyInstance()
  },
  methods: {
    /**
     * 检查关键props传入是否规范并初始化上传实例
     */
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
    getImgRef(file) {
      return `previewImg${this.getPreviewList.findIndex((x) => x == file.url)}`;
    },
    getFileName(val) {
      return fileHelper.getFileName(val);
    },
    getIfImage(file) {
      return fileHelper.getIfImage(file);
    },
    getFileType(file) {
      return fileHelper.getFileType(file);
    },
    getFileIcon(file) {
      const type = this.getFileType(file);
      const iconObj = {
        image: "",
        video: "icon-video",
        audio: "icon-audio",
        rar: "icon-yasuobao",
        word: "icon-WORD",
        excel: "icon-EXCEL",
        ppt: "icon-ppt",
        txt: "icon-txt",
        pdf: "icon-Pdf",
        other: "icon-fujian1",
      };
      return iconObj[type];
    },
    getFileLoading(file) {
      if (!this.$refs.innerUpload?.uploadFiles) return false;
      const item = this.$refs.innerUpload.uploadFiles.find(
        (x) => x.uid == file.uid || x.url == file.url
      );
      if (item) {
        if (item.percentage && item.percentage < 1) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    getFilePercent(file) {
      if (!this.$refs.innerUpload?.uploadFiles) return "";
      const item = this.$refs.innerUpload.uploadFiles.find(
        (x) => x.uid == file.uid || x.url == file.url
      );
      if (item) {
        if (item.percentage && item.percentage < 1) {
          return `上传中${Math.round(item.percentage * 1000) / 10}%`;
        } else {
          return `上传完成`;
        }
      } else {
        return "";
      }
    },
    // 自定义上传方法
    async customUpload(options) {
      const { file, onProgress, onSuccess, onError } = options;
      const uploadConfig = {
        file,
        chunkSize: this.chunkSize,
        sliceSize: this.sliceSize,
        ...this.cloudConfig,
        onProgress: (percent) => {
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
              const index = this.$refs.innerUpload.uploadFiles.findIndex(
                (x) => x.uid == file.uid
              )
              let item = this.$refs.innerUpload.uploadFiles[index];
              const fileresult = Object.assign(item, {
                url: result.Location.startsWith("https://")
                  ? result.Location
                  : "https://" + result.Location,
                cosResult: result,
              });
              this.$refs.innerUpload.uploadFiles.splice(index,1,fileresult)
              this.fileList = this.$refs.innerUpload.uploadFiles
            }
            break;
          case "volcengine":
            result = await tencentUpload(uploadConfig);
            break;
          default:
            throw new Error(`Unsupported cloudType: ${this.cloudType}`);
        }
        onSuccess(result, file);
        this.$emit("success", result, file);
        this.$emit("input",this.fileList)
      } catch (error) {
        onError(error, file);
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
      const type = this.getFileType(file);
      if (type == "image") {
        const ref = this.getImgRef(file);
        this.$refs[ref].clickHandler();
      } else {
        this.previewFile = file;
        this.previewVisible = true;
      }
    },
    handleDown(file) {
      this.$message.success('文件开始下载，请稍等！')
      fileHelper.downloadFile(file.url, file.name);
    },
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
  components: {
    FilePreview,
  },
};
</script>
<style lang="scss" scoped>
.cloud-upload {
  .default-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    span {
      display: block;
      line-height: 18px;
    }
    color: #606266;
    &:hover,
    &:focus {
      color: #409eff;
      i {
        color: #409eff;
      }
    }
  }
  ::v-deep .el-upload-list--picture-card {
    .el-upload-list__item {
      overflow: visible;
      .el-upload-list__item-thumbnail {
        display: block;
        .el-loading-spinner {
          margin-top: 0px;
          transform: translateY(-50%);
        }
      }
      .el-upload-list__item-actions {
        i:hover {
          color: #409eff;
        }
      }
      .previewIcon {
        display: flex;
        justify-content: center;
        align-items: center;
        .cloud-upload-icon {
          font-size: 50px;
        }
      }
      .file-name {
        display: inline-block;
        /* 必须设置为块级或inline-block */
        max-width: 100%;
        /* 限制最大宽度 */
        white-space: nowrap;
        /* 禁止换行 */
        overflow: hidden;
        /* 隐藏溢出内容 */
        text-overflow: ellipsis;
        /* 显示省略号 */
        cursor: pointer;
      }
    }
  }
}
.cloud-upload-small {
  ::v-deep .el-upload-list--picture-card {
    .el-upload-list__item {
      width: 118px;
      height: 118px;
      .previewIcon {
        .cloud-upload-icon {
          font-size: 40px;
        }
      }
    }
  }
  ::v-deep .el-upload--picture-card {
    width: 118px;
    height: 118px;
  }
}
.cloud-upload-mini {
  ::v-deep .el-upload-list--picture-card {
    .el-upload-list__item {
      width: 94px;
      height: 94px;
      .previewIcon {
        .cloud-upload-icon {
          font-size: 32px;
        }
      }
    }
  }
  ::v-deep .el-upload--picture-card {
    width: 94px;
    height: 94px;
  }
}
</style>
