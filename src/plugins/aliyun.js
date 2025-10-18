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
    // 清理超过10天的断点记录
    try {
      const localData = localStorage.getItem("ossCptDatas");
      if (localData) {
        let ossCptDatas = JSON.parse(localData);
        const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000; // 10天前的时间戳
        ossCptDatas = ossCptDatas.filter((item) => {
          // 如果没有创建时间，则认为是旧记录，需要清理
          if (!item.createTime) {
            return false;
          }
          // 保留创建时间在10天内的记录
          return item.createTime > tenDaysAgo;
        });
        localStorage.setItem("ossCptDatas", JSON.stringify(ossCptDatas));
      }
    } catch (error) {
      console.error("清理过期断点记录失败:", error);
    }
  }

  constructor(config) {
    this.initClient(config);
  }

  async initClient(config) {
    const res = await config.getTempCredential();
    const keys = ["accessKeyId", "accessKeySecret", "stsToken"];
    let isvalid = true;
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
        let result;
        const uniqkey = `${file.name}-${file.size}-${file.lastModified}`;
        const cptData = this.getCptDataByKey(uniqkey);
        let cpt = cptData ? cptData.cpt : null;
        if (cpt) {
          // 大文件分片上传
          result = await this.ossClient.multipartUpload(cptData.name, file, {
            checkpoint: cpt,
            progress: (p, abortCheckpoint) => {
              this.setCptData(uniqkey, key ,abortCheckpoint);
              if (onProgress && typeof onProgress === "function") {
                onProgress(p);
              }
            },
            parallel: 4, // 并行上传的分片数
            partSize: chunkSize, // 分片大小
          });
        } else {
          // 大文件分片上传
          result = await this.ossClient.multipartUpload(key, file, {
            progress: (p, abortCheckpoint) => {
              this.setCptData(uniqkey,key,abortCheckpoint);
              if (onProgress && typeof onProgress === "function") {
                onProgress(p);
              }
            },
            parallel: 4, // 并行上传的分片数
            partSize: chunkSize, // 分片大小
          });
        }
        if (result.res.status == 200) {
          this.delCptData(uniqkey);
        }
        // 配置响应头实现通过URL访问时自动下载文件，并设置下载后的文件名。
        const response = {
          "content-disposition": `attachment; filename=${encodeURIComponent(
            file.name
          )}`,
        };
        // 填写Object完整路径。Object完整路径中不能包含Bucket名称。
        //const url = this.ossClient.signatureUrl(result.name, { response, expires: 3600 });
        const url = `https://${bucket}.${region}.aliyuncs.com/${result.name}`;
        return {
          url: url,
          key: result.name,
          name: file.name,
          ...result,
        };
      }
    } catch (error) {
      throw new Error(`阿里云OSS上传失败: ${error.message}`);
    }
  }
  getCptDataByKey(key) {
    let ossCptDatas = [];
    const localData = localStorage.getItem("ossCptDatas");
    if (localData) {
      ossCptDatas = JSON.parse(localData);
    }
    const index = ossCptDatas.findIndex((x) => x.key == key);
    if (index >= 0) {
      return ossCptDatas[index];
    } else {
      return null;
    }
  }
  setCptData(key,name,cpt) {
    let ossCptDatas = [];
    const localData = localStorage.getItem("ossCptDatas");
    if (localData) {
      ossCptDatas = JSON.parse(localData);
    }
    const index = ossCptDatas.findIndex((x) => x.key == key);
    if (index >= 0) {
      ossCptDatas[index].cpt = cpt;
    } else {
      ossCptDatas.push({
        key,
        name,
        cpt,
        createTime: Date.now(),
      });
    }
    localStorage.setItem("ossCptDatas", JSON.stringify(ossCptDatas));
  }
  delCptData(key) {
    let ossCptDatas = [];
    const localData = localStorage.getItem("ossCptDatas");
    if (localData) {
      ossCptDatas = JSON.parse(localData);
    }
    const index = ossCptDatas.findIndex((x) => x.key == key);
    if (index >= 0) {
      ossCptDatas.splice(index, 1);
      localStorage.setItem("ossCptDatas", JSON.stringify(ossCptDatas));
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
