import type { UploadFile, FileType } from '../types';

/**
 * 文件操作工具类
 */
export class FileHelper {
  /**
   * 获取文件后缀名（不带点）
   * @param file 文件对象或文件名
   * @return 文件后缀
   */
  static getFileExtension(file: File | string): string {
    const fileName = typeof file === 'string' ? file : file.name;
    return fileName.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * 获取文件大小（MB为单位）
   * @param file 文件对象
   * @return 文件大小MB
   */
  static getFileSizeMB(file: File): number {
    return parseFloat((file.size / (1024 * 1024)).toFixed(2));
  }

  /**
   * 获取文件大小带单位自动转换（B/KB/MB/GB）
   * @param file 文件对象
   * @return 带单位的文件大小
   */
  static getFileSizeAuto(file: File): string {
    const bytes = file.size;
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    else return (bytes / 1073741824).toFixed(2) + ' GB';
  }

  /**
   * 检查文件类型是否在允许列表中
   * @param file 文件对象
   * @param allowedTypes 允许的后缀名数组（如 ['jpg', 'png']）
   * @return 是否允许
   */
  static checkFileType(file: File, allowedTypes: string[]): boolean {
    const ext = this.getFileExtension(file);
    return allowedTypes.includes(ext);
  }

  /**
   * 生成文件预览URL（适用于图片/PDF等）
   * @param file 文件对象
   * @return 预览URL
   */
  static generatePreviewURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  /**
   * 通用文件下载方法
   * @param url - 文件下载地址
   * @param filename - 可选自定义文件名
   */
  static downloadFile(url: string, filename?: string): void {
    // 未传文件名时从URL提取最后部分作为文件名
    let finalFilename = '';
    if (filename) {
      finalFilename = filename;
    } else {
      const decodedUrl = decodeURIComponent(url);
      finalFilename = decodedUrl
        .substring(decodedUrl.lastIndexOf('/') + 1)
        .split('?')[0];
    }
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        // 创建临时下载链接
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = finalFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      })
      .catch((error) => console.error('下载失败:', error));
  }

  /**
   * 获取文件分类
   * @param file - 文件对象
   */
  static getFileType(file: UploadFile): FileType {
    let prefix = '';
    if (file.name && file.name !== '') {
      prefix = this.getFileExtension(file.name);
    } else {
      if (!file.url) return 'other';
      prefix = this.getFileExtension(file.url);
    }
    if (this.getIfImage(file)) {
      return 'image';
    }
    let result: FileType = 'other';
    switch (prefix) {
      case 'doc':
      case 'docx':
        result = 'word';
        break;
      case 'pdf':
        result = 'pdf';
        break;
      case 'ppt':
      case 'pptx':
        result = 'ppt';
        break;
      case 'xls':
      case 'xlsx':
      case 'csv':
        result = 'excel';
        break;
      case 'rar':
      case 'zip':
      case '7z':
      case 'gzip':
      case 'tar':
        result = 'rar';
        break;
      case 'mp4':
      case 'webm':
      case 'ogg':
      case 'mpeg':
        result = 'video';
        break;
      case 'mp3':
      case 'aac':
      case 'wav':
      case 'flac':
      case 'opus':
        result = 'audio';
        break;
      case 'txt':
        result = 'txt';
        break;
      default:
        result = 'other';
        break;
    }
    return result;
  }

  /**
   * 判断文件是否为图片
   * @param file - 文件对象
   */
  static getIfImage(file: UploadFile): boolean {
    let prefix = '';
    if (file.name && file.name !== '') {
      prefix = this.getFileExtension(file.name);
    } else if (file.key) {
      prefix = this.getFileExtension(file.key);
    } else if (file.url) {
      prefix = this.getFileExtension(file.url);
    } else {
      return false;
    }
    const images = ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'svg'];
    return images.some((x) => x === prefix);
  }

  /**
   * 获取文件名
   * @param file - 文件对象
   */
  static getFileName(file: UploadFile): string {
    if (file.name) {
      return file.name;
    } else if (file.key && file.key !== '') {
      return file.key.substring(file.key.lastIndexOf('/') + 1).split('?')[0];
    } else if (file.url && file.url !== '') {
      const decodedUrl = decodeURIComponent(file.url);
      return decodedUrl
        .substring(decodedUrl.lastIndexOf('/') + 1)
        .split('?')[0];
    } else {
      return '';
    }
  }
}

export default FileHelper;
