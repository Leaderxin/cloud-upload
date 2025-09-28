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
    if (
      !this.instance &&
      cloudConfig.accessKeyId &&
      cloudConfig.secretAccessKey &&
      cloudConfig.server
    ) {
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
      access_key_id: cloudConfig.accessKeyId,
      secret_access_key: cloudConfig.secretAccessKey,
      server: cloudConfig.server,
    });
  }

  // 单文件上传
  async uploadFile({ bucket, key, file, sliceSize, chunkSize, onProgress }) {
    try {
      const result = await this.obsClient.putObject({
        Bucket: bucket,
        Key: key,
        SourceFile: file,
        ProgressCallback: (transferredAmount, totalAmount, totalSeconds) => {
          if (onProgress && typeof onProgress === "function") {
            onProgress(transferredAmount / totalAmount);
          }
        },
      });
      if (result.CommonMsg.Status < 300) {
        return {
          key: key,
          name: file.name,
          ...result,
        };
      } else {
        throw new Error(`上传失败: ${result.CommonMsg.Code}`);
      }
    } catch (error) {
      throw new Error(`华为云OBS上传失败: ${error.message}`);
    }
  }
  // 图片加水印（华为云OBS处理方式）
  async addWatermark({ bucket, region, key, watermarkText }) {
    try {
      // 华为云OBS的图片处理需要通过单独的图片处理服务
      // 这里返回带水印参数的URL
      const watermarkUrl = `https://${bucket}.obs.${region}.myhuaweicloud.com/${key}?x-image-process=image/watermark,text_${encodeURIComponent(
        watermarkText
      )},color_FFFFFF,size_20,g_se,x_20,y_20`;

      return {
        processedUrl: watermarkUrl,
        originalKey: key,
      };
    } catch (error) {
      throw new Error(`添加水印失败: ${error.message}`);
    }
  }
}

export default ObsHelper;
