<template>
  <el-dialog
    :visible.sync="currentVisible"
    :title="fileName"
    @open="handleOpen"
    @close="handleClose"
    custom-class="file-preview-dialog"
    append-to-body
  >
    <div class="file-preview-content" v-loading="loading">
      <div v-if="fileType == 'txt'" v-html="formattedText"></div>
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
      fileContent: "",
      loading: false
    };
  },
  computed: {
    formattedText() {
      return this.fileContent.replace(/\n/g, "<br>");
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
    getFileType(file) {
      return "txt";
    },
  },
  watch: {
    visible(val) {
      this.currentVisible = val;
    },
    file: async function (val) {
      this.loading = true
      this.fileName = fileHelper.getFileName(val);
      if (val.raw && val.raw instanceof File) {
        this.fileRaw = val.raw;
      } else {
        try {
          const response = await fetch(val.url);
          const blob = await response.blob();
          this.fileRaw = blob;
        } catch (error) {
          console.error("文件下载失败：", error);
          return;
        }
      }
      this.fileType = fileHelper.getFileType(val);
      switch (this.fileType) {
        case "txt":
          this.initTxtContent();
          break;

        default:
          break;
      }
      this.loading = false
    },
  },
};
</script>

<style lang="scss" scoped>
.file-preview-dialog {
  .file-preview-content {
    max-height: 75vh;
    min-height: 40vh;
    overflow: auto;
  }
}
</style>
<style lang="css">
.file-preview-dialog > .el-dialog__body {
  padding: 20px ;
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
