class OssHelper {
  static instance = null;
  static externalOSS = null; // 外部传入的OSS对象
  ossClient = null;
  tempCredential = null;
  accessKeyId = null;
  accessKeySecret = null;
  stsToken = null;
  region = null;
  bucket = null;

  // 设置外部OSS对象的静态方法
  static setExternalOSS(OSS) {
    this.externalOSS = OSS;
  }

  static getInstance(config) {
    if (!this.instance) {
      if (
        config &&
        ((config.accessKeyId &&
          config.accessKeySecret &&
          !config.getTempCredential) ||
          (config.getTempCredential &&
            typeof config.getTempCredential == "function"))
      )
        this.instance = new OssHelper(config);
    }
    return this.instance;
  }

  static destroyInstance() {
    this.instance = null;
    this.ossClient = null;
    this.tempCredential = null;
    localStorage.removeItem("ossAliyunCredential");
  }

  constructor(config) {
    // 保存配置信息
    if (config) {
      if (config.region) {
        this.region = config.region;
      }
      if (config.bucket) {
        this.bucket = config.bucket;
      }
      // 检查是否提供了永久密钥
      if (config.accessKeyId && config.accessKeySecret) {
        this.accessKeyId = config.accessKeyId;
        this.accessKeySecret = config.accessKeySecret;
      }
    }
    this.initClient(config);
  }

  async initClient(config) {
    // 如果有外部传入的OSS对象，直接使用
    let OSS = OssHelper.externalOSS || window.OSS;

    // 判断是使用永久密钥还是临时凭证
    if (this.accessKeyId && this.accessKeySecret && !config.getTempCredential) {
      // 使用永久密钥创建OSS客户端
      this.ossClient = new OSS({
        secure: true,
        authorizationV4: true,
        region: this.region,
        accessKeyId: this.accessKeyId,
        accessKeySecret: this.accessKeySecret,
        bucket: this.bucket,
      });
    } else if (config.getTempCredential) {
      // 使用临时凭证方式
      await this.getTempCredential(config.getTempCredential);
      this.ossClient = new OSS({
        secure: true,
        authorizationV4: true,
        region: this.region,
        accessKeyId: this.tempCredential.accessKeyId,
        accessKeySecret: this.tempCredential.accessKeySecret,
        stsToken: this.tempCredential.stsToken,
        bucket: this.bucket,
        //refreshSTSToken: ()=>
      });
    } else {
      throw new Error(
        "缺少必要的认证信息：需要提供永久密钥或getTempCredential函数"
      );
    }
  }

  async getTempCredential(getToken) {
    // 优先从localStorage获取
    let storeCredential = localStorage.getItem("ossAliyunCredential");
    if (storeCredential) {
      storeCredential = JSON.parse(storeCredential);
    }
    if (storeCredential && !this.isCredentialExpired(storeCredential)) {
      this.tempCredential = storeCredential;
      return;
    }
    // localStorage无有效凭证则调用接口获取
    try {
      const data = await getToken();
      if (data && typeof data == "object") {
        this.tempCredential = {
          accessKeyId: data.AccessKeyId,
          accessKeySecret: data.AccessKeySecret,
          stsToken: data.SecurityToken,
          expiration: data.Expiration,
        };
        localStorage.setItem(
          "ossAliyunCredential",
          JSON.stringify(this.tempCredential)
        );
      }
    } catch (error) {
      throw new Error("获取临时凭证失败: " + error.message);
    }
  }

  isCredentialExpired(credential = this.tempCredential) {
    if (!credential) return true;
    const now = new Date().getTime();
    const expireTime = new Date(credential.expiration).getTime();
    return now >= expireTime - 60 * 1000; // 提前60秒认为过期
  }

  // 确保使用有效的凭证
  async ensureValidCredential(getTempCredential) {
    if (
      getTempCredential &&
      (!this.tempCredential || this.isCredentialExpired())
    ) {
      await this.getTempCredential(getTempCredential);
      // 重新初始化客户端
      let OSS = OssHelper.externalOSS || window.OSS;
      this.ossClient = new OSS({
        region: this.region,
        accessKeyId: this.tempCredential.accessKeyId,
        accessKeySecret: this.tempCredential.accessKeySecret,
        stsToken: this.tempCredential.stsToken,
        bucket: this.bucket,
      });
    }
  }

  // 单文件上传
  async uploadFile({
    bucket,
    key,
    file,
    sliceSize = 1024 * 1024, // 1MB
    chunkSize = 1024 * 1024, // 1MB
    onProgress,
    getTempCredential,
  }) {
    // 确保使用有效的凭证
    await this.ensureValidCredential(getTempCredential);
    try {
      // 小文件直接上传
      if (file.size < sliceSize) {
        debugger
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
          progress: (p, checkpoint) => {
            if (onProgress && typeof onProgress === "function") {
              onProgress(p);
            }
          },
          meta: {
            year: 2025,
            people: "aliyun",
          },
          parallel: 4, // 并行上传的分片数
          partSize: chunkSize, // 分片大小
        });

        // 获取文件的签名URL
        const url = this.ossClient.signatureUrl(key, {
          expires: 3600, // 1小时有效期
        });

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