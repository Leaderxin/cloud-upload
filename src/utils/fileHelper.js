
/**
 * 文件操作工具类
 */
class fileHelper {
  /**
   * 获取文件后缀名（不带点）
   * @param {File|string} file 文件对象或文件名
   * @return {string} 文件后缀
   */
  static getFileExtension(file) {
    const fileName = typeof file === 'string' ? file : file.name;
    return fileName.split('.').pop().toLowerCase();
  }

  /**
   * 获取文件大小（MB为单位）
   * @param {File} file 文件对象
   * @return {number} 文件大小MB
   */
  static getFileSizeMB(file) {
    return parseFloat((file.size / (1024 * 1024)).toFixed(2));
  }

  /**
   * 获取文件大小带单位自动转换（B/KB/MB/GB）
   * @param {File} file 文件对象
   * @return {string} 带单位的文件大小
   */
  static getFileSizeAuto(file) {
    const bytes = file.size;
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    else return (bytes / 1073741824).toFixed(2) + ' GB';
  }

  /**
   * 检查文件类型是否在允许列表中
   * @param {File} file 文件对象
   * @param {string[]} allowedTypes 允许的后缀名数组（如 ['jpg', 'png']）
   * @return {boolean} 是否允许
   */
  static checkFileType(file, allowedTypes) {
    const ext = this.getFileExtension(file);
    return allowedTypes.includes(ext);
  }

  /**
   * 生成文件预览URL（适用于图片/PDF等）
   * @param {File} file 文件对象
   * @return {Promise<string>} 预览URL
   */
  static generatePreviewURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  /**
   * 下载文件
   * @param {string} dataURL 文件数据URL
   * @param {string} fileName 下载文件名
   */
  static downloadFile(dataURL, fileName) {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// 导出工具类
export default fileHelper;
