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
    const fileName = typeof file === "string" ? file : file.name;
    return fileName.split(".").pop().toLowerCase();
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
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
    else return (bytes / 1073741824).toFixed(2) + " GB";
  }

  /**
   * 检查文件类型是否在允许列表中
   * @param {File} file 文件对象
   * @param {string[]} allowedTypes 允许的后缀名数组（如 ['jpg', 'png']）
   * @return {boolean} 是否允许
   */
  static checkFileType(file, allowedTypes) {
    const ext = fileHelper.getFileExtension(file);
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
   * 通用文件下载方法
   * @param {string} url - 文件下载地址
   * @param {string} [filename] - 可选自定义文件名
   */
  static downloadFile(url, filename) {
    // 未传文件名时从URL提取最后部分作为文件名
    const finalFilename =
      filename || url.substring(url.lastIndexOf("/") + 1).split("?")[0];
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        // 创建临时下载链接
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = finalFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      })
      .catch((error) => console.error("下载失败:", error));
  }
  /**
   * 获取文件分类
   * @param {Object} file - 文件对象
   */
  static getFileType(file){
    debugger
    let prefix = "";
      if (file.name && file.name != "") {
        prefix = fileHelper.getFileExtension(file);
      } else {
        if (!file.url) return "other";
        prefix = fileHelper.getFileExtension(file.url);
      }
      if (fileHelper.getIfImage(file)) {
        return "image";
      }
      let result = "";
      switch (prefix) {
        case "doc":
        case "docx":
          result = "word";
          break;
        case "pdf":
          result = "pdf";
          break;
        case "ppt":
        case "pptx":
          result = "ppt";
          break;
        case "xls":
        case "xlsx":
        case "csv":
          result = "excel";
          break;
        case "rar":
        case "zip":
        case "7z":
        case "gzip":
        case "tar":
          result = "rar";
          break;
        case "mp4":
        case "webm":
        case "ogg":
        case "mpeg":
          result = "video";
          break;
        case "mp3":
        case "aac":
        case "wav":
        case "flac":
        case "opus":
          result = "audio";
          break;
        case "txt":
          result = "txt";
          break;
        default:
          result = "other";
          break;
      }
      return result;
  }
  /**
   * 判断文件是否为图片
   * @param {Object} file - 文件对象
   */
  static getIfImage(file){
    let prefix = "";
      if (file.name && file.name != "") {
        prefix = fileHelper.getFileExtension(file);
      } else {
        if (!file.url) return false;
        prefix = fileHelper.getFileExtension(file.url);
      }
      const images = ["png", "jpg", "jpeg", "bmp", "gif", "webp", "svg"];
      return images.some((x) => x === prefix);
  }
  /**
   * 获取文件名
   * @param {Object} file - 文件对象
   */
  static getFileName(file){
    if(file.name){
      return file.name
    }
    else if(file.url && file.url!=''){
      const decodedUrl = decodeURIComponent(file.url);
      return decodedUrl.substring(decodedUrl.lastIndexOf("/") + 1).split("?")[0]
    }
    else{
      return ''
    }
  }
}

// 导出工具类
export default fileHelper;
