/**
 * 云平台类型
 */
export type CloudType = 'tencent' | 'huawei' | 'aliyun';

/**
 * 文件列表类型
 */
export type ListType = 'text' | 'picture' | 'picture-card';

/**
 * 组件尺寸
 */
export type SizeType = 'medium' | 'small' | 'mini';

/**
 * 文件Key生成类型
 */
export type KeyType = 'uuid' | 'name' | 'uuid+name';

/**
 * 文件类型
 */
export type FileType = 'image' | 'video' | 'audio' | 'word' | 'excel' | 'ppt' | 'txt' | 'pdf' | 'rar' | 'other';

/**
 * 云配置接口
 */
export interface CloudConfig {
  /** 桶名 */
  bucket: string;
  /** 地域 */
  region: string;
  /** 上传目录 (Vue3推荐使用) */
  dir?: string;
  /** 上传目录 (Vue2兼容，与dir二选一) */
  path?: string;
  /** 腾讯云永久密钥 */
  secretId?: string;
  /** 腾讯云永久密钥 */
  secretKey?: string;
  /** 华为云永久密钥 */
  accessKeyId?: string;
  /** 华为云永久密钥 */
  secretAccessKey?: string;
  /** 华为云服务器地址 */
  server?: string;
  /** 获取临时凭证函数 */
  getTempCredential?: () => Promise<any>;
  /** 阿里云临时凭证刷新间隔 */
  refreshSTSTokenInterval?: number;
}

/**
 * 预览配置接口
 */
export interface PreviewConfig {
  image?: boolean;
  video?: boolean;
  audio?: boolean;
  word?: boolean;
  excel?: boolean;
  ppt?: boolean;
  txt?: boolean;
  pdf?: boolean;
  rar?: boolean;
  other?: boolean;
}

/**
 * 上传文件接口
 */
export interface UploadFile {
  uid: string;
  name: string;
  url?: string;
  status?: 'ready' | 'uploading' | 'success' | 'error';
  percentage?: number;
  raw?: File;
  key?: string;
  response?: any;
}

/**
 * 上传选项接口
 */
export interface UploadOptions {
  file: File;
  key: string;
  chunkSize: number;
  sliceSize: number;
  onProgress?: (percent: number) => void;
}

/**
 * 上传结果接口
 */
export interface UploadResult {
  url: string;
  key: string;
  name: string;
  [key: string]: any;
}

/**
 * 云存储助手接口
 */
export interface CloudHelper {
  uploadFile(options: UploadOptions): Promise<UploadResult>;
  getFileUrlByKey(options: { bucket: string; region: string; key: string }): Promise<string>;
}

/**
 * 组件Props接口
 */
export interface CloudUploadProps {
  multiple?: boolean;
  showFileList?: boolean;
  drag?: boolean;
  accept?: string;
  listType?: ListType;
  disabled?: boolean;
  limit?: number;
  maxSize?: number;
  size?: SizeType;
  sliceSize?: number;
  chunkSize?: number;
  keyType?: KeyType;
  customKey?: (file: File) => string;
  cloudType?: CloudType;
  cloudConfig: CloudConfig;
  previewConfig?: PreviewConfig;
  modelValue?: UploadFile[];
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  beforeRemove?: (file: UploadFile, fileList: UploadFile[]) => boolean | Promise<boolean>;
  onExceed?: (files: File[], fileList: UploadFile[]) => void;
  onPreview?: (file: UploadFile) => void;
  onChange?: (file: UploadFile, fileList: UploadFile[]) => void;
  primaryColor?: string;
}

/**
 * 组件Emits接口
 */
export interface CloudUploadEmits {
  (e: 'update:modelValue', value: UploadFile[]): void;
  (e: 'exceed', files: File[], fileList: UploadFile[]): void;
  (e: 'preview', file: UploadFile): void;
  (e: 'remove', file: UploadFile, fileList: UploadFile[]): void;
  (e: 'change', file: UploadFile, fileList: UploadFile[]): void;
  (e: 'progress', percent: number, file: File): void;
  (e: 'success', response: any, file: UploadFile, fileList: UploadFile[]): void;
  (e: 'error', error: Error, file: UploadFile, fileList: UploadFile[]): void;
}
