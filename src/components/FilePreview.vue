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
        <i :class="['icon',fullscreen?'el-icon-copy-document':'el-icon-full-screen']" @click="fullscreen = !fullscreen"></i>
      </div>
    </template>
    <div
      :class="[
        'file-preview-content',
        fileType == 'audio' ? 'preview-audio' : '',
      ]"
      v-loading="loading"
    >
      <div v-if="fileType == 'txt'" v-html="formattedText"></div>
      <iframe
        class="pdf-container"
        :src="pdfUrl"
        frameborder="0"
        v-if="fileType == 'pdf'"
      ></iframe>
      <video
        controls
        :src="file.url"
        v-if="fileType == 'video'"
        autoplay
        preload="auto"
        crossorigin
      ></video>
      <audio
        controls
        :src="file.url"
        v-if="fileType == 'audio'"
        autoplay
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
      return this.fileContent.replace(/\n/g, "<br>");
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
      this.pdfUrl = URL.createObjectURL(this.fileRaw);
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
          const blob = await response.blob();
          this.fileRaw = blob;
        } catch (error) {
          console.error("文件下载失败：", error);
          return;
        }
      }
      switch (this.fileType) {
        case "txt":
          this.initTxtContent();
          break;
        case "pdf":
          this.initPdfContent();
        default:
          break;
      }
      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>

.file-preview-dialog {
  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: -3px;
    .icon {
      margin-right: 20px;
      color: #909399;
      font-size: 17px;
      font-weight: 550;
      cursor: pointer;
      &:hover {
        color: #409eff;
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
      height: 100%;
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

.el-dialog__wrapper {
  overflow: hidden;
}
</style>
