class OssHelper {
  static instance = null;
  static externalOSS = null; // 外部传入的OSS对象
  ossClient = null;
  // 设置外部OSS对象的静态方法
  static setExternalOSS(OSS) {
    this.externalOSS = OSS;
  }

  static getInstance(config) {
    if (!this.instance) {
      if (
        config &&
        config.getTempCredential &&
        typeof config.getTempCredential == "function"
      )
        this.instance = new OssHelper(config);
    }
    return this.instance;
  }

  static destroyInstance() {
    this.instance = null;
    this.ossClient = null;
  }

  constructor(config) {
    this.initClient(config);
  }

  async initClient(config) {
    const res = await config.getTempCredential();
    const keys = ["accessKeyId", "accessKeySecret", "stsToken"];
    const isvalid = true;
    keys.forEach((key) => {
      if (!res.hasOwnProperty(key)) {
        console.error(`getTempCredential函数未返回字段${key}`);
        isvalid = false;
      }
    });
    if (!isvalid) {
      this.instance = null;
      return;
    }
    // 如果有外部传入的OSS对象，直接使用
    let OSS = OssHelper.externalOSS || window.OSS;
    this.ossClient = new OSS({
      secure: true,
      authorizationV4: true,
      region: config.region,
      accessKeyId: res.accessKeyId,
      accessKeySecret: res.accessKeySecret,
      stsToken: res.stsToken,
      bucket: config.bucket,
      refreshSTSToken: config.getTempCredential,
      refreshSTSTokenInterval: config.refreshSTSTokenInterval || 85000,
    });
  }
  // 单文件上传
  async uploadFile({
    bucket,
    region,
    key,
    file,
    sliceSize,
    chunkSize,
    onProgress,
  }) {
    try {
      // 小文件直接上传
      if (file.size < sliceSize) {
        const result = await this.ossClient.put(key, file, {
          progress: (p) => {
            if (onProgress && typeof onProgress === "function") {
              onProgress(p);
            }
          },
        });
        return {
          url: result.url,
          key: key,
          name: file.name,
          ...result,
        };
      } else {
        // 大文件分片上传
        const result = await this.ossClient.multipartUpload(key, file, {
          progress: (p, cpt) => {
            if (onProgress && typeof onProgress === "function") {
              onProgress(p);
            }
          },
          parallel: 4, // 并行上传的分片数
          partSize: chunkSize, // 分片大小
        });
        // 获取文件的签名URL
        // const url = this.ossClient.signatureUrl(key, {
        //   expires: 3600, // 1小时有效期
        // });
        const url = `https://${bucket}.${region}.aliyuncs.com/${key}`;
        return {
          url: url,
          key: key,
          name: file.name,
          ...result,
        };
      }
    } catch (error) {
      throw new Error(`阿里云OSS上传失败: ${error.message}`);
    }
  }

  // 图片加水印
  async addWatermark({ bucket, region, key, watermarkText }) {
    try {
      // 阿里云OSS图片处理通过签名URL添加参数实现
      const processedUrl = this.ossClient.signatureUrl(key, {
        expires: 3600, // 1小时有效期
        process: `image/watermark,text_${encodeURIComponent(
          watermarkText
        )},fill_ I0ZGRkZGRg,size_20,g_se,x_20,y_20`, // 水印参数
      });

      return {
        processedUrl: processedUrl,
        originalKey: key,
      };
    } catch (error) {
      throw new Error(`添加水印失败: ${error.message}`);
    }
  }
}

export default OssHelper;
