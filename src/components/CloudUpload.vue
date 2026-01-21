<template>
  <div
    :class="[
      'cloud-upload',
      'cloud-upload-' + size,
      disabled && fileList.length > 0 ? 'cloud-upload-disabled' : '',
    ]"
  >
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
      :on-preview="handlePreview"
      :on-change="onChange"
      :before-upload="onbeforeUpload"
      :before-remove="beforeRemove"
      :http-request="customUpload"
      :list-type="listType"
      v-bind="$attrs"
      v-on="$listeners"
      :disabled="disabled"
    >
      <!-- 默认插槽内容 -->
      <template v-if="!$scopedSlots.default">
        <div class="default-content" v-if="listType == 'picture-card'">
          <template v-if="!disabled">
            <i slot="default" class="el-icon-upload"></i>
            <span>点击上传</span>
          </template>
          <template v-else-if="fileList.length == 0">
            <i slot="default" class="el-icon-folder-opened"></i>
            <span>暂无文件</span>
          </template>
        </div>
        <el-button :size="size" type="primary" :disabled="disabled" v-else
          >点击上传</el-button
        >
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
            v-if="
              getPreviewConfig[getFileType(file)] && file.status == 'success'
            "
          >
            <i title="点击预览" class="el-icon-view" @click="() => handlePreview(file)"></i>
          </span>
          <span class="el-upload-list__item-delete">
            <i title="点击下载" class="el-icon-download" @click="() => handleDown(file)"></i>
          </span>
          <span
            v-if="!disabled"
            title="点击删除"
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
      :primary-color="primaryColor"
    ></FilePreview>
  </div>
</template>

<script>
import "@/assets/iconfont/iconfont.css";
import Vue from "vue";
import fileHelper from "../utils/fileHelper";
import { Upload, Loading, Image, Tooltip, Dialog } from "element-ui";
import FilePreview from "./FilePreview.vue";
import { nanoid } from "nanoid";
let CosHelper = null;
let ObsHelper = null;
let OssHelper = null;
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
      validator: (value) => {
        const params = ["text", "picture", "picture-card"];
        if (!params.includes(value)) {
          console.error(
            `listType参数必须是以下值之一: ${params.join(", ")}\n` +
              `当前值: "${value}"将回退到默认值"picture-card"`
          );
          return false;
        }
        return true;
      },
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
      validator: (value) => {
        const params = ["medium", "small", "mini"];
        if (!params.includes(value)) {
          console.error(
            `size参数必须是以下值之一: ${params.join(", ")}\n` +
              `当前值: "${value}"将回退到默认值"small"`
          );
          return false;
        }
        return true;
      },
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
     * 对象存储桶中文件的key配置
     */
    keyType: {
      type: String,
      default: "uuid+name",
      validator: (value) => {
        const params = ["uuid", "name", "uuid+name"];
        if (!params.includes(value)) {
          console.error(
            `fileKey参数必须是以下值之一: ${params.join(", ")}\n` +
              `当前值: "${value}"将回退到默认值"uuid+name"`
          );
          return false;
        }
        return true;
      },
    },
    /**
     * 自定义函数生成上传文件key
     */
    customKey:{
      type: Function,
      required: false
    },
    /**
     * 使用的云平台类型 tencent腾讯云桶
     */
    cloudType: {
      type: String,
      default: "tencent",
      validator: (value) => {
        const params = ["tencent", "huawei", "aliyun"];
        if (!params.includes(value)) {
          console.error(
            `cloudType参数必须是以下值之一: ${params.join(", ")}\n` +
              `当前值: "${value}"将回退到默认值"tencent"`
          );
          return false;
        }
        return true;
      },
    },
    /**
     * 云平台配置参数，包含桶名，地域，上传目录，凭证获取等
     */
    cloudConfig: {
      type: Object,
      required: true,
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
      default: () => [],
    },
    /**
     * 上传文件之前的钩子，参数为上传的文件，若返回 false 或者返回 Promise 且被 reject，则停止上传。
     */
    beforeUpload: {
      type: Function,
      required: false,
    },
    /**
     * 删除文件之前的钩子，参数为上传的文件和文件列表，若返回 false 或者返回 Promise 且被 reject，则停止删除
     */
    beforeRemove: {
      type: Function,
      required: false,
    },
    /**
     * 文件超出个数限制时的钩子
     */
    onExceed: {
      type: Function,
      required: false,
    },
    /**
     * 点击文件列表中已上传的文件时的钩子
     */
    onPreview: {
      type: Function,
      required: false,
    },
    /**
     * 文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
     */
    onChange: {
      type: Function,
      required: false,
    },
    /**
     * 主题色，默认为 #409eff
     */
    primaryColor: {
      type: String,
      default: '#409eff',
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
        if (this.getIfImage(item) && item.url) {
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
    this.checkAndInit(this.cloudConfig);
  },
  beforeDestroy() {
    if (CosHelper) CosHelper.destroyInstance();
    if (ObsHelper) ObsHelper.destroyInstance();
    if (OssHelper) OssHelper.destroyInstance();
  },
  methods: {
    /**
     * 检查关键props传入是否规范并初始化上传实例
     */
    async checkAndInit(cloudConfig) {
      //检查关键参数传入
      const typeList = ["tencent", "huawei", "aliyun"];
      if (!this.cloudType) {
        console.warn("未设置云平台类型cloudType!");
      } else if (!typeList.includes(this.cloudType)) {
        console.warn(`云平台类型cloudType设置错误，应为${typeList.join("/")}`);
      }
      switch (this.cloudType) {
        case "tencent":
          CosHelper = (await import("../plugins/tencent")).default;
          CosHelper.getInstance(cloudConfig);
          // 等待腾讯云初始化完成
          await CosHelper.waitForInitialization();
          break;
        case "huawei":
          ObsHelper = (await import("../plugins/huawei")).default;
          ObsHelper.getInstance(cloudConfig);
          // 等待华为云初始化完成
          await ObsHelper.waitForInitialization();
          break;
        case "aliyun":
          OssHelper = (await import("../plugins/aliyun")).default;
          OssHelper.getInstance(cloudConfig);
          // 等待阿里云初始化完成
          await OssHelper.waitForInitialization();
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
      if (!file.url) return true;
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
        } else if (item.percentage == 1) {
          return `上传完成`;
        } else {
          return "加载中";
        }
      } else {
        return "";
      }
    },
    // 自定义上传方法
    async customUpload(options) {
      const { file, onProgress, onSuccess, onError } = options;
      let key = this.generateKey(file);
      const uploadConfig = {
        file,
        key,
        chunkSize: this.chunkSize,
        sliceSize: this.sliceSize,
        ...this.cloudConfig,
        onProgress: (percent) => {
          if (process.env.NODE_ENV === 'development') {
            console.log("当前进度:", percent);
          }
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
              this.handleUploadSuccess(result, file);
            }
            break;
          case "huawei":
            result = await ObsHelper.getInstance().uploadFile(uploadConfig);
            if (result.CommonMsg.Status == 200) {
              this.handleUploadSuccess(result, file);
            }
            break;
          case "aliyun":
            result = await OssHelper.getInstance().uploadFile(uploadConfig);
            if (result.url) {
              this.handleUploadSuccess(result, file);
            }
            break;
          default:
            throw new Error(`Unsupported cloudType: ${this.cloudType}`);
        }
        onSuccess(result, file);
        this.$emit("input", this.fileList);
        this.$emit("success", result, file);
      } catch (error) {
        console.error('上传失败:', error);
        const enhancedError = {
          message: error.message || '上传失败',
          code: error.code,
          file: file.name,
          cloudType: this.cloudType
        };
        onError(enhancedError, file);
        this.$emit("error", enhancedError, file);
      }
    },
    /**
     * 处理上传成功后的文件列表更新
     */
    handleUploadSuccess(result, file) {
      const index = this.$refs.innerUpload.uploadFiles.findIndex(
        (x) => x.uid == file.uid
      );
      if (index >= 0) {
        let item = this.$refs.innerUpload.uploadFiles[index];
        const fileresult = Object.assign(item, {
          url: result.url,
          key: result.key,
          result,
        });
        this.$refs.innerUpload.uploadFiles.splice(index, 1, fileresult);
        this.fileList = [...this.$refs.innerUpload.uploadFiles];
      }
    },
    generateKey(file) {
      let fileKey = "";
      if (typeof this.customKey === 'function') {
        fileKey = this.customKey(file);
        if (fileKey) {
          return `${this.cloudConfig.path}${fileKey}`;
        }
      }
      const name = file.name;
      switch (this.keyType) {
        case "name":
          fileKey = `${this.cloudConfig.path}${name}`;
          break;
        case "uuid":
          const extention = fileHelper.getFileExtension(name);
          fileKey = `${this.cloudConfig.path}${nanoid()}.${extention}`;
          break;
        case "uuid+name":
          fileKey = `${this.cloudConfig.path}${nanoid()}/${name}`;
          break;
        default:
          break;
      }
      return fileKey;
    },
    onbeforeUpload(file) {
      if (this.beforeUpload && typeof this.beforeUpload == "function") {
        return this.beforeUpload(file);
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
      this.$emit("remove", file);
    },
    handlePreview(file) {
      if (this.onPreview && typeof this.onPreview == "function") {
        this.onPreview(file);
      } else {
        const type = this.getFileType(file);
        if (type == "image") {
          const ref = this.getImgRef(file);
          this.$refs[ref].clickHandler();
        } else {
          this.previewFile = file;
          this.previewVisible = true;
        }
      }
    },
    handleDown(file) {
      // var downloadUrl =
      //   file.url +
      //   (file.url.indexOf("?") > -1 ? "&" : "?") +
      //   "response-content-disposition=attachment"; // 补充强制下载的参数
      // window.open(downloadUrl);
      this.$message.success("文件开始下载，请稍等！");
      const name = fileHelper.getFileName(file);
      fileHelper.downloadFile(file.url, name);
    },
    handleExceed(files, fileList) {
      if (this.onExceed && typeof this.onExceed == "function") {
        this.onExceed(files, fileList);
      } else {
        this.$message.warning(`当前限制最多选择${this.limit}个文件！`);
      }
    },
    async getFileUrls() {
      const promises = this.fileList.map(async (file, index) => {
        if (!file.url || file.url == "") {
          if (!file.key || file.key == "") {
            console.error("v-model传入文件key为空，无法获取文件地址！");
            return;
          }
          try {
            let url;
            switch (this.cloudType) {
              case "tencent":
                url = await CosHelper.getInstance().getFileUrlByKey({
                  key: file.key,
                  ...this.cloudConfig,
                });
                break;
              case "huawei":
                if (ObsHelper) {
                  url = await ObsHelper.getInstance().getFileUrlByKey({
                    key: file.key,
                    ...this.cloudConfig,
                  });
                }
                break;
              case "aliyun":
                if (OssHelper) {
                  url = await OssHelper.getInstance().getFileUrlByKey({
                    key: file.key,
                    ...this.cloudConfig,
                  });
                }
                break;
              default:
                break;
            }
            if (url) {
              file.url = url;
              this.$set(this.fileList, index, { ...file });
            }
          } catch (error) {
            console.error(`获取文件URL失败 (${file.key}):`, error);
          }
        }
      });
      await Promise.all(promises);
    },
    getFileNames() {
      for (let i = 0; i < this.fileList.length; i++) {
        const file = this.fileList[i];
        if (!file.name || file.name == "") {
          if (file.key && file.key != "") {
            const name = fileHelper.getFileName(file);
            file.name = name;
          }
        }
      }
    },
  },
  watch: {
    cloudType(val) {
      this.checkAndInit(this.cloudConfig);
    },
    cloudConfig: {
      deep: true,
      handler(val) {
        this.checkAndInit(val);
      },
    },
    value: {
      immediate: true,
      async handler(val) {
        this.fileList = val;
        if (
          this.fileList.some(
            (x) => (!x.url || x.url == "") && x.key && x.key != ""
          )
        ) {
          await this.checkAndInit(this.cloudConfig);
          await this.getFileUrls();
        }
        if (this.fileList.some((x) => !x.name || x.name == "")) {
          this.getFileNames();
        }
      },
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
      color: v-bind(primaryColor);

      i {
        color: v-bind(primaryColor);
      }
    }
  }

  ::v-deep .el-upload-dragger {
    width: 100%;
    height: 100%;
    border: none;

    .el-icon-upload {
      font-size: 28px;
      line-height: 1;
      margin: 0;
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
          color: v-bind(primaryColor);
          background-color: #fff;
          padding: 3px;
          border-radius: 50%;
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

.cloud-upload-disabled {
  ::v-deep .el-upload--picture-card {
    display: none;
  }
}
</style>
