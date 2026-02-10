<template>
  <el-dialog
    :visible.sync="currentVisible"
    :title="fileName"
    @open="handleOpen"
    @close="handleClose"
    custom-class="file-preview-dialog"
    append-to-body
    :fullscreen="fullscreen"
    :width="dialogWidth"
  >
    <template #title>
      <div class="dialog-header">
        <span>{{ fileName }}</span>
        <i
          :class="[
            'preview-header-icon',
            fullscreen ? 'el-icon-copy-document' : 'el-icon-full-screen',
          ]"
          @click="fullscreen = !fullscreen"
        ></i>
      </div>
    </template>
    <div
      :class="[
        'file-preview-content',
        fileType == 'audio' ? 'preview-audio' : '',
      ]"
      v-loading="loading"
    >
      <div v-if="fileType == 'txt'" v-html="formattedText" class="txt-content"></div>
      <iframe
        class="pdf-container"
        :src="pdfUrl"
        frameborder="0"
        v-if="fileType == 'pdf'"
        loading="lazy"
      ></iframe>
      <video
        ref="cloud-upload-video"
        controls
        :src="file.url"
        v-if="fileType == 'video' && currentVisible"
        autoplay
        muted
        preload="auto"
        crossorigin
      ></video>
      <audio
        controls
        :src="file.url"
        v-if="fileType == 'audio' && currentVisible"
        autoplay
        muted
        preload="auto"
        crossorigin
      ></audio>
    </div>
  </el-dialog>
</template>

<script>
import fileHelper from "../utils/fileHelper";
export default {
  props: {
    visible: {
      type: Boolean,
    },
    file: {
      type: Object,
      required: true,
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
      currentVisible: this.visible,
      fileType: "",
      fileName: "",
      fileRaw: null,
      pdfUrl: "",
      fileContent: "",
      loading: false,
      fullscreen: false,
    };
  },
  computed: {
    formattedText() {
      // 转义HTML特殊字符以防止XSS攻击
      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };
      const escapedText = escapeHtml(this.fileContent);
      return escapedText.replace(/\n/g, "<br>");
    },
    dialogWidth() {
      if (this.fileType == "audio") {
        return "30%";
      } else {
        return "75%";
      }
    },
  },
  methods: {
    handleOpen() {},
    handleClose() {
      this.$emit("update:visible", false);
    },
    initTxtContent() {
      if (!this.fileRaw) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.fileContent = e.target.result;
      };
      reader.readAsText(this.fileRaw);
    },
    initPdfContent() {
      // 释放之前的URL
      if (this.pdfUrl && this.pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.pdfUrl);
      }
      // 优先使用原始 URL，避免 Edge 对 Blob URL 的限制
      // 只有当文件是本地上传的 File 对象时才使用 Blob URL
      if (this.file.raw && this.file.raw instanceof File) {
        this.pdfUrl = URL.createObjectURL(this.fileRaw);
      } else {
        this.pdfUrl = this.file.url;
      }
    },
  },
  watch: {
    visible(val) {
      this.currentVisible = val;
    },
    file: async function (val) {
      this.loading = true;
      this.fileName = fileHelper.getFileName(val);
      this.fileType = fileHelper.getFileType(val);
      if (val.raw && val.raw instanceof File) {
        this.fileRaw = val.raw;
      } else if (this.fileType == "txt" || this.fileType == "pdf") {
        try {
          const response = await fetch(val.url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const blob = await response.blob();
          this.fileRaw = blob;
        } catch (error) {
          console.error("文件下载失败：", error);
          this.$message.error('文件加载失败，请稍后重试');
          this.loading = false;
          return;
        }
      }
      switch (this.fileType) {
        case "txt":
          this.initTxtContent();
          break;
        case "pdf":
          this.initPdfContent();
          break;
        case "video":
        default:
          break;
      }
      this.loading = false;
    },
  },
  beforeDestroy() {
    // 释放Blob URL以防止内存泄漏
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl);
      this.pdfUrl = "";
    }
  },
};
</script>

<style lang="scss" scoped>
.file-preview-dialog {
  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .preview-header-icon {
      margin-right: 24px;
      color: #909399;
      font-size: 17px;
      font-weight: 550;
      cursor: pointer;
      &:hover {
        color: v-bind(primaryColor);
      }
    }
  }

  .file-preview-content {
    max-height: 88vh;
    min-height: 40vh;
    overflow: auto;
    .pdf-container {
      width: 100%;
      height: 65vh;
    }
    video {
      width: 100%;
      height: 99%;
    }
    .txt-content {
      white-space: pre-wrap;
      word-wrap: break-word;
      padding: 10px;
      font-family: monospace;
      line-height: 1.6;
    }
  }
  .preview-audio {
    height: auto;
    min-height: 30px;
    audio {
      width: 100%;
    }
  }
}
</style>
<style lang="css">
.file-preview-dialog > .el-dialog__body {
  padding: 20px;
  padding-top: 0px;
}
.file-preview-dialog > .el-dialog__header{
  padding: 15px;
  line-height: 1;
}
.file-preview-dialog > .el-dialog__header > .el-dialog__headerbtn{
  font-size: 20px;
  top: 13px;
  right: 15px;
  line-height: 1;
}
.file-preview-dialog {
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: calc(100% - 30px);
  max-width: calc(100% - 30px);
}
</style>
