<template>
  <el-dialog
    v-model="currentVisible"
    :title="fileName"
    @open="handleOpen"
    @close="handleClose"
    custom-class="file-preview-dialog"
    append-to-body
    :fullscreen="fullscreen"
    :width="dialogWidth"
  >
    <template #header>
      <div class="dialog-header">
        <span>{{ fileName }}</span>
        <el-icon
          class="preview-header-icon"
          @click.stop="fullscreen = !fullscreen"
        >
          <CopyDocument v-if="fullscreen" />
          <FullScreen v-else />
        </el-icon>
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
        crossorigin="anonymous"
      ></video>
      <audio
        controls
        :src="file.url"
        v-if="fileType == 'audio' && currentVisible"
        autoplay
        muted
        preload="auto"
        crossorigin="anonymous"
      ></audio>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { CopyDocument, FullScreen } from '@element-plus/icons-vue';
import FileHelper from '../utils/fileHelper';
import type { UploadFile } from '../types';

interface Props {
  visible: boolean;
  file: UploadFile;
  primaryColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  primaryColor: '#409eff'
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const currentVisible = ref(props.visible);
const fileType = ref('');
const fileName = ref('');
const fileRaw = ref<File | Blob | null>(null);
const pdfUrl = ref('');
const fileContent = ref('');
const loading = ref(false);
const fullscreen = ref(false);

const formattedText = computed(() => {
  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };
  const escapedText = escapeHtml(fileContent.value);
  return escapedText.replace(/\n/g, "<br>");
});

const dialogWidth = computed(() => {
  if (fileType.value === 'audio') {
    return '30%';
  } else {
    return '75%';
  }
});

const handleOpen = () => {};

const handleClose = () => {
  fullscreen.value = false;
  emit('update:visible', false);
};

const initTxtContent = () => {
  if (!fileRaw.value) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    fileContent.value = e.target?.result as string;
  };
  reader.readAsText(fileRaw.value as File);
};

const initPdfContent = () => {
  if (pdfUrl.value && pdfUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(pdfUrl.value);
  }
  if (props.file.raw && props.file.raw instanceof File) {
    pdfUrl.value = URL.createObjectURL(props.file.raw);
  } else {
    pdfUrl.value = props.file.url || '';
  }
};

const updatePrimaryColor = () => {
  const el = document.querySelector('.file-preview-dialog');
  if (el) {
    (el as HTMLElement).style.setProperty('--vue-cloud-upload-primary-color', props.primaryColor);
  }
};

watch(() => props.visible, (val) => {
  currentVisible.value = val;
});

watch(() => props.primaryColor, () => {
  updatePrimaryColor();
}, { immediate: true });

watch(() => props.file, async (val) => {
  loading.value = true;
  fileName.value = FileHelper.getFileName(val);
  fileType.value = FileHelper.getFileType(val);
  
  if (val.raw && val.raw instanceof File) {
    fileRaw.value = val.raw;
  } else if (fileType.value === 'txt' || fileType.value === 'pdf') {
    try {
      const response = await fetch(val.url || '');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      fileRaw.value = blob;
    } catch (error) {
      console.error('文件下载失败：', error);
      ElMessage.error('文件加载失败，请稍后重试');
      loading.value = false;
      return;
    }
  }
  
  switch (fileType.value) {
    case 'txt':
      initTxtContent();
      break;
    case 'pdf':
      initPdfContent();
      break;
    case 'video':
    default:
      break;
  }
  loading.value = false;
});

onMounted(() => {
  updatePrimaryColor();
});

onBeforeUnmount(() => {
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value);
    pdfUrl.value = '';
  }
});
</script>

<style lang="scss" scoped>
.file-preview-dialog {
  --vue-cloud-upload-primary-color: #409eff;
  
  .dialog-header {
    width: 100%;
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
        color: var(--vue-cloud-upload-primary-color);
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

/* 全屏状态下的样式调整 */
.file-preview-dialog.is-fullscreen .file-preview-content {
  height: calc(100vh - 100px)
}
.file-preview-dialog.is-fullscreen .file-preview-content .pdf-container {
  height: 99%;
}
.file-preview-dialog.is-fullscreen .file-preview-content video {
  height: 99%;
}
</style>
