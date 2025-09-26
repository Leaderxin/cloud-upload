class ObsHelper {
  static instance = null;
  static externalOBS = null; // 外部传入的OBS对象
  obsClient = null;
  tempCredential = null;

  // 设置外部OBS对象的静态方法
  static setExternalOBS(OBS) {
    this.externalOBS = OBS;
  }

  static getInstance(cloudConfig) {
    if (!this.instance) {
      this.instance = new ObsHelper(cloudConfig);
    }
    return this.instance;
  }

  static destroyInstance() {
    this.instance = null;
    this.obsClient = null;
    this.tempCredential = null;
  }

  constructor(cloudConfig) {
    this.initClient(cloudConfig);
  }

  async initClient(cloudConfig) {
    // 如果有外部传入的OBS对象，直接使用
    let ObsClient = ObsHelper.externalOBS;
    // 初始化华为云OBS客户端
    this.obsClient = new ObsClient({
      access_key_id: this.tempCredential.accessKeyId,
      secret_access_key: this.tempCredential.secretAccessKey,
      security_token: this.tempCredential.securityToken,
      server: `https://obs.${this.tempCredential.region}.myhuaweicloud.com`
    });
  }

  // 单文件上传
  async uploadFile({ bucket, region, path, file, onProgress }) {
    const key = path + file.name;
    
    try {
      const result = await this.obsClient.putObject({
        Bucket: bucket,
        Key: key,
        Body: file,
        onUploadProgress: (progressEvent) => {
          if (onProgress && typeof onProgress === "function") {
            const percent = progressEvent.loaded / progressEvent.total;
            console.log(`上传进度: ${(percent * 100).toFixed(2)}%`);
            onProgress(percent);
          }
        }
      });

      if (result.CommonMsg.Status < 300) {
        return {
          Location: `https://${bucket}.obs.${region}.myhuaweicloud.com/${key}`,
          Key: key,
          Bucket: bucket,
          ETag: result.InterfaceResult.ETag
        };
      } else {
        throw new Error(`上传失败: ${result.CommonMsg.Code}`);
      }
    } catch (error) {
      throw new Error(`华为云OBS上传失败: ${error.message}`);
    }
  }

  // 批量上传
  async batchUpload({ bucket, region, path, files, onProgress }) {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await this.uploadFile({
          bucket,
          region,
          path,
          file,
          onProgress: (progress) => {
            if (onProgress && typeof onProgress === "function") {
              // 计算整体进度
              const overallProgress = (i + progress) / files.length;
              onProgress(overallProgress);
            }
          }
        });
        results.push(result);
      } catch (error) {
        results.push({ error: error.message, file: file.name });
      }
    }
    
    return results;
  }

  // 分片上传（华为云OBS支持断点续传）
  async sliceUpload({ bucket, region, path, file, sliceSize = 5 * 1024 * 1024, onProgress }) {
    const key = path + file.name;
    
    try {
      // 华为云OBS SDK会自动处理大文件分片上传
      const result = await this.obsClient.putObject({
        Bucket: bucket,
        Key: key,
        Body: file,
        onUploadProgress: (progressEvent) => {
          if (onProgress && typeof onProgress === "function") {
            const percent = progressEvent.loaded / progressEvent.total;
            console.log(`分片上传进度: ${(percent * 100).toFixed(2)}%`);
            onProgress(percent);
          }
        }
      });

      if (result.CommonMsg.Status < 300) {
        return {
          Location: `https://${bucket}.obs.${region}.myhuaweicloud.com/${key}`,
          Key: key,
          Bucket: bucket,
          ETag: result.InterfaceResult.ETag
        };
      } else {
        throw new Error(`分片上传失败: ${result.CommonMsg.Code}`);
      }
    } catch (error) {
      throw new Error(`华为云OBS分片上传失败: ${error.message}`);
    }
  }

  // 图片加水印（华为云OBS处理方式）
  async addWatermark({ bucket, region, key, watermarkText }) {
    try {
      // 华为云OBS的图片处理需要通过单独的图片处理服务
      // 这里返回带水印参数的URL
      const watermarkUrl = `https://${bucket}.obs.${region}.myhuaweicloud.com/${key}?x-image-process=image/watermark,text_${encodeURIComponent(watermarkText)},color_FFFFFF,size_20,g_se,x_20,y_20`;
      
      return {
        processedUrl: watermarkUrl,
        originalKey: key
      };
    } catch (error) {
      throw new Error(`添加水印失败: ${error.message}`);
    }
  }
}

export default ObsHelper;
