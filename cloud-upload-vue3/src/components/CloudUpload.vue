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
      :disabled="disabled"
      :key="fileList.length"
    >
      <!-- 默认插槽内容 -->
      <template v-if="!$slots.default">
        <div class="default-content" v-if="listType == 'picture-card'">
          <template v-if="!disabled">
            <el-icon><Upload /></el-icon>
            <span>点击上传</span>
          </template>
          <template v-else-if="fileList.length == 0">
            <el-icon><FolderOpened /></el-icon>
            <span>暂无文件</span>
          </template>
        </div>
        <el-button :size="size" type="primary" :disabled="disabled" v-else
          >点击上传</el-button
        >
      </template>
      <!-- 暴露所有默认插槽 -->
      <template
        v-for="(_, slotName) in $slots"
        #[slotName]="scoped"
      >
        <slot :name="slotName" v-bind="scoped" />
      </template>
      <!-- picture-card文件列表插槽默认内容 -->
      <template
        v-if="!$slots.file && listType == 'picture-card'"
        #file="{ file }"
      >
        <el-image
          v-if="getIfImage(file)"
          :preview-src-list="getPreviewList"
          :ref="(el) => setImageRef(getImgRef(file), el)"
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
            <el-icon title="点击预览" @click.stop="handlePreview(file)"><View /></el-icon>
          </span>
          <span class="el-upload-list__item-delete">
            <el-icon title="点击下载" @click.stop="handleDown(file)"><Download /></el-icon>
          </span>
          <span
            v-if="!disabled"
            title="点击删除"
            class="el-upload-list__item-delete"
          >
            <el-icon @click.stop="handleRemove(file)"><Delete /></el-icon>
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
      v-model:visible="previewVisible"
      :file="previewFile"
      :primary-color="primaryColor"
    ></FilePreview>
  </div>
</template>

<script setup lang="ts">
import '@/assets/iconfont/iconfont.css';
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { nanoid } from 'nanoid';
import {
  Upload,
  FolderOpened,
  View,
  Download,
  Delete
} from '@element-plus/icons-vue';
import FileHelper from '../utils/fileHelper';
import FilePreview from './FilePreview.vue';
import type {
  CloudUploadProps,
  CloudUploadEmits,
  
  UploadFile,
  CloudType,
  CloudConfig,
  PreviewConfig,
  FileType
} from '../types';

const props = withDefaults(defineProps<CloudUploadProps>(), {
  multiple: false,
  showFileList: true,
  drag: false,
  listType: 'picture-card',
  disabled: false,
  size: 'small',
  sliceSize: 1024 * 1024 * 10,
  chunkSize: 1024 * 1024 * 5,
  keyType: 'uuid+name',
  cloudType: 'tencent',
  primaryColor: '#409eff',
  watermarkConfig: undefined
});

const emit = defineEmits<CloudUploadEmits>();

const fileList = ref<UploadFile[]>(props.modelValue || []);
const previewVisible = ref(false);
const previewFile = ref<UploadFile>({ uid: '', name: '' });
const innerUpload = ref();
const imageRefs = ref<Record<string, any>>({});

let CosHelperInstance: any = null;
let ObsHelperInstance: any = null;
let OssHelperInstance: any = null;

const getPreviewList = computed(() => {
  let result: string[] = [];
  fileList.value.forEach((item) => {
    if (getIfImage(item) && item.url) {
      result.push(item.url);
    }
  });
  return result;
});

const getPreviewConfig = computed(() => {
  return Object.assign(
    {
      image: true,
      video: true,
      audio: true,
      word: false,
      excel: false,
      ppt: false,
      txt: true,
      pdf: true,
      rar: false,
    },
    props.previewConfig
  ) as PreviewConfig;
});

const getImgRef = (file: UploadFile) => {
  return `previewImg${getPreviewList.value.findIndex((x) => x == file.url)}`;
};

const setImageRef = (refName: string, el: any) => {
  if (el) {
    imageRefs.value[refName] = el;
  }
};

const getFileName = (val: UploadFile) => {
  return FileHelper.getFileName(val);
};

const getIfImage = (file: UploadFile) => {
  return FileHelper.getIfImage(file);
};

const getFileType = (file: UploadFile): FileType => {
  return FileHelper.getFileType(file);
};

const getFileIcon = (file: UploadFile) => {
  const type = getFileType(file);
  const iconObj: Record<string, string> = {
    image: '',
    video: 'icon-video',
    audio: 'icon-audio',
    rar: 'icon-yasuobao',
    word: 'icon-WORD',
    excel: 'icon-EXCEL',
    ppt: 'icon-ppt',
    txt: 'icon-txt',
    pdf: 'icon-Pdf',
    other: 'icon-fujian1',
  };
  return iconObj[type];
};

const getFileLoading = (file: UploadFile) => {
  if (!file.url) return true;
  if (!innerUpload.value?.uploadFiles) return false;
  const item = innerUpload.value.uploadFiles.find(
    (x: UploadFile) => x.uid == file.uid || x.url == file.url
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
};

const getFilePercent = (file: UploadFile) => {
  if (!innerUpload.value?.uploadFiles) return '';
  const item = innerUpload.value.uploadFiles.find(
    (x: UploadFile) => x.uid == file.uid || x.url == file.url
  );
  if (item) {
    if (item.percentage && item.percentage < 1) {
      return `上传中${Math.round(item.percentage * 1000) / 10}%`;
    } else if (item.percentage == 1) {
      return `上传完成`;
    } else {
      return '加载中';
    }
  } else {
    return '';
  }
};

const checkAndInit = async (cloudConfig: CloudConfig) => {
  const typeList: CloudType[] = ['tencent', 'huawei', 'aliyun'];
  if (!props.cloudType) {
    console.warn('未设置云平台类型cloudType!');
  } else if (!typeList.includes(props.cloudType)) {
    console.warn(`云平台类型cloudType设置错误，应为${typeList.join('/')}`);
  }
  
  switch (props.cloudType) {
    case 'tencent':
      {
        const module = await import('../plugins/tencent');
        const CosHelper = module.default;
        CosHelperInstance = CosHelper.getInstance(cloudConfig);
        if (CosHelperInstance) {
          await CosHelper.waitForInitialization();
        }
      }
      break;
    case 'huawei':
      {
        const module = await import('../plugins/huawei');
        const ObsHelper = module.default;
        ObsHelperInstance = ObsHelper.getInstance(cloudConfig);
        if (ObsHelperInstance) {
          await ObsHelper.waitForInitialization();
        }
      }
      break;
    case 'aliyun':
      {
        const module = await import('../plugins/aliyun');
        const OssHelper = module.default;
        OssHelperInstance = OssHelper.getInstance(cloudConfig);
        if (OssHelperInstance) {
          await OssHelper.waitForInitialization();
        }
      }
      break;
    default:
      break;
  }
};

const generateKey = (file: File): string => {
  if (props.customKey && typeof props.customKey === 'function') {
    const customKey = props.customKey(file);
    if (customKey) {
      return `${props.cloudConfig.path || props.cloudConfig.dir || ''}${customKey}`;
    }
  }
  
  const name = file.name;
  const path = props.cloudConfig.path || props.cloudConfig.dir || '';
  
  switch (props.keyType) {
    case 'name':
      return `${path}${name}`;
    case 'uuid':
      const extention = FileHelper.getFileExtension(name);
      return `${path}${nanoid()}.${extention}`;
    case 'uuid+name':
    default:
      return `${path}${nanoid()}/${name}`;
  }
};

const customUpload = async (options: any) => {
  const { file, onProgress, onSuccess, onError } = options;
  let key = generateKey(file);
  const uploadConfig = {
    file: file,
    key,
    chunkSize: props.chunkSize,
    sliceSize: props.sliceSize,
    ...props.cloudConfig,
    onProgress: (percent: number) => {
      if (process.env.NODE_ENV === 'development') {
        console.log("当前进度:", percent);
      }
      onProgress({ percent });
      emit('progress', percent, file);
    },
  };

  try {
    let result: any;
    switch (props.cloudType) {
      case 'tencent':
        result = await CosHelperInstance.uploadFile(uploadConfig);
        if (result.statusCode == 200) {
          handleUploadSuccess(result, file);
        }
        break;
      case 'huawei':
        result = await ObsHelperInstance.uploadFile(uploadConfig);
        if (result.CommonMsg.Status == 200) {
          handleUploadSuccess(result, file);
        }
        break;
      case 'aliyun':
        result = await OssHelperInstance.uploadFile(uploadConfig);
        if (result.url) {
          handleUploadSuccess(result, file);
        }
        break;
      default:
        throw new Error('不支持的云平台类型');
    }
    
    onSuccess(result);
    emit('success', result, file, fileList.value);
  } catch (error) {
    const enhancedError = new Error(error instanceof Error ? error.message : '上传失败');
    (enhancedError as any).code = (error as any)?.code;
    (enhancedError as any).file = file.name;
    (enhancedError as any).cloudType = props.cloudType;
    onError(enhancedError);
    emit('error', enhancedError, file, fileList.value);
  }
};

const handleUploadSuccess = (result: any, file: File) => {
  if (!innerUpload.value?.uploadFiles) return;
  const index = innerUpload.value.uploadFiles.findIndex(
    (x: UploadFile) => x.raw === file
  );
  if (index >= 0) {
    let item = innerUpload.value.uploadFiles[index];
    const fileresult = Object.assign(item, {
      url: result.url,
      key: result.key,
      result,
    });
    innerUpload.value.uploadFiles.splice(index, 1, fileresult);
    fileList.value = [...innerUpload.value.uploadFiles];
    emit('update:modelValue', fileList.value);
  }
};



const handleExceed = (files: File[], fileList: UploadFile[]) => {
  emit('exceed', files, fileList);
};

const handleRemove = (file: UploadFile) => {
  fileList.value = fileList.value.filter(
    (item) => item.uid !== file.uid && item.url !== file.url
  );
  // 同步更新innerUpload的uploadFiles
  if (innerUpload.value?.uploadFiles) {
    innerUpload.value.uploadFiles = innerUpload.value.uploadFiles.filter(
      (x: UploadFile) => x.uid !== file.uid && x.url !== file.url
    );
  }
  emit('update:modelValue', fileList.value);
  emit('remove', file, fileList.value);
  
  // 强制更新视图
  nextTick(() => {
    if (innerUpload.value) {
      innerUpload.value.$forceUpdate?.();
    }
  });
};

const handlePreview = (file: UploadFile) => {
  // 如果有自定义的onPreview回调，优先使用
  if (props.onPreview && typeof props.onPreview === 'function') {
    props.onPreview(file);
  } else {
    const type = getFileType(file);
    if (type === 'image') {
      // 对于图片文件，使用el-image的预览功能
      const refName = getImgRef(file);
      const imageRef = imageRefs.value[refName];
      if (imageRef && imageRef.clickHandler) {
        imageRef.clickHandler();
      }
    } else {
      // 对于其他文件类型，使用FilePreview弹框
      previewFile.value = file;
      previewVisible.value = true;
    }
  }
  emit('preview', file);
};

const handleDown = (file: UploadFile) => {
  if (file.url) {
    FileHelper.downloadFile(file.url, file.name);
  }
};

const onChange = (file: UploadFile, fileList: UploadFile[]) => {
  emit('change', file, fileList);
};

const onbeforeUpload = (file: File) => {
  if (props.maxSize && file.size > props.maxSize * 1024 * 1024) {
    console.error(`文件大小不能超过 ${props.maxSize}MB`);
    return false;
  }
  
  if (props.beforeUpload) {
    return props.beforeUpload(file);
  }
  
  return true;
};

const beforeRemove = (file: UploadFile, fileList: UploadFile[]) => {
  if (props.beforeRemove) {
    return props.beforeRemove(file, fileList);
  }
  return true;
};

const updatePrimaryColor = () => {
  const el = document.querySelector('.cloud-upload');
  if (el) {
    (el as HTMLElement).style.setProperty('--vue-cloud-upload-primary-color', props.primaryColor);
  }
};

watch(() => props.modelValue, (val) => {
  if (val) {
    fileList.value = val;
  }
});

watch(() => props.primaryColor, () => {
  updatePrimaryColor();
});

onMounted(async () => {
  await checkAndInit(props.cloudConfig);
  updatePrimaryColor();
});

onBeforeUnmount(async () => {
  if (CosHelperInstance) {
    const module = await import('../plugins/tencent');
    const helper = module.default;
    if (helper) {
      helper.destroyInstance();
    }
  }
  if (ObsHelperInstance) {
    const module = await import('../plugins/huawei');
    const helper = module.default;
    if (helper) {
      helper.destroyInstance();
    }
  }
  if (OssHelperInstance) {
    const module = await import('../plugins/aliyun');
    const helper = module.default;
    if (helper) {
      helper.destroyInstance();
    }
  }
});
</script>

<style lang="scss" scoped>
.cloud-upload {
  --vue-cloud-upload-primary-color: #409eff;
  
  &.cloud-upload-disabled {
    opacity: 0.6;
    pointer-events: none;
  }
  
  .default-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    
    i {
      font-size: 48px;
      color: var(--vue-cloud-upload-primary-color);
      margin-bottom: 10px;
    }
    
    span {
      font-size: 14px;
      color: #606266;
    }
  }
  
  .previewIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    
    i {
      font-size: 48px;
      color: #909399;
    }
  }
  
  .file-name {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 5px 10px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    font-size: 12px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
  }
}
</style>
