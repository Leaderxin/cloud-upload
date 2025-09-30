class ObsHelper {
  static instance = null;
  static externalOBS = null; // 外部传入的OBS对象
  obsClient = null;
  tempCredential = null;
  accessKeyId = null;
  secretAccessKey = null;
  securityToken = null;
  server = null;

  // 设置外部OBS对象的静态方法
  static setExternalOBS(OBS) {
    this.externalOBS = OBS;
  }

  static getInstance(config) {
    if (!this.instance) {
      if (
        config &&
        ((config.accessKeyId &&
          config.secretAccessKey &&
          !config.getTempCredential) ||
          (config.getTempCredential &&
            typeof config.getTempCredential == "function"))
      )
        this.instance = new ObsHelper(config);
    }
    return this.instance;
  }

  static destroyInstance() {
    this.instance = null;
    this.obsClient = null;
    this.tempCredential = null;
    localStorage.removeItem("obsCpDatas");
    localStorage.removeItem("obsCredential");
  }

  constructor(config) {
    // 保存服务器配置
    if (config && config.server) {
      this.server = config.server;
    }

    // 检查是否提供了永久密钥
    if (config && config.accessKeyId && config.secretAccessKey) {
      this.accessKeyId = config.accessKeyId;
      this.secretAccessKey = config.secretAccessKey;
    }
    this.initClient(config);
  }

  async initClient(config) {
    // 如果有外部传入的OBS对象，直接使用
    let ObsClient = ObsHelper.externalOBS;

    // 判断是使用永久密钥还是临时凭证
    if (this.accessKeyId && this.secretAccessKey && !config.getTempCredential) {
      // 使用永久密钥创建OBS客户端
      this.obsClient = new ObsClient({
        access_key_id: this.accessKeyId,
        secret_access_key: this.secretAccessKey,
        server: this.server,
      });
    } else if (config.getTempCredential) {
      // 使用临时凭证方式
      await this.getTempCredential(config.getTempCredential);
      this.obsClient = new ObsClient({
        access_key_id: this.tempCredential.accessKeyId,
        secret_access_key: this.tempCredential.secretAccessKey,
        security_token: this.tempCredential.securityToken,
        server: this.server,
      });
    } else {
      throw new Error(
        "缺少必要的认证信息：需要提供永久密钥或getTempCredential函数"
      );
    }

    this.obsClient.initLog({
      level: "warn", // 配置日志级别
    });
  }

  async getTempCredential(getToken) {
    // 优先从localStorage获取
    let storeCredential = localStorage.getItem("obsCredential");
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
          accessKeyId: data.credentials.accessKeyId,
          secretAccessKey: data.credentials.secretAccessKey,
          securityToken: data.credentials.securityToken,
          expiredTime: data.expiredTime,
        };
        localStorage.setItem(
          "obsCredential",
          JSON.stringify(this.tempCredential)
        );
      }
    } catch (error) {
      throw new Error("获取临时凭证失败: " + error.message);
    }
  }

  isCredentialExpired(credential = this.tempCredential) {
    if (!credential) return true;
    const now = Math.floor(Date.now() / 1000);
    return now >= credential.expiredTime - 60; // 提前60秒认为过期
  }

  // 确保使用有效的凭证
  async ensureValidCredential(getTempCredential) {
    if (
      getTempCredential &&
      (!this.tempCredential || this.isCredentialExpired())
    ) {
      await this.getTempCredential(getTempCredential);
      // 重新初始化客户端
      let ObsClient = ObsHelper.externalOBS;
      this.obsClient = new ObsClient({
        access_key_id: this.tempCredential.accessKeyId,
        secret_access_key: this.tempCredential.secretAccessKey,
        security_token: this.tempCredential.securityToken,
        server: this.server,
      });
    }
  }

  // 单文件上传
  async uploadFile({
    bucket,
    key,
    file,
    sliceSize,
    chunkSize,
    onProgress,
    getTempCredential,
  }) {
    // 确保使用有效的凭证
    await this.ensureValidCredential(getTempCredential);
    if (file.size < sliceSize) {
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
    } else {
      try {
        let obsCpDatas = [];
        const localData = localStorage.getItem("obsCpDatas");
        if (localData) {
          obsCpDatas = JSON.parse(localData);
        }
        const uniqkey = `${file.name}-${file.size}-${file.lastModified}`;
        const index = obsCpDatas.findIndex((x) => x.key == uniqkey);
        const ifExist = index >= 0;
        let cp = ifExist ? obsCpDatas[index].cp : null;
        let result;
        if (cp) {
          cp.sourceFile = file;
          result = await this.obsClient.uploadFile({
            UploadCheckpoint: cp,
            ProgressCallback: (
              transferredAmount,
              totalAmount,
              totalSeconds
            ) => {
              if (onProgress && typeof onProgress === "function") {
                onProgress(transferredAmount / totalAmount);
              }
            },
            EventCallback: function (eventType, eventParam, eventResult) {
              // 处理事件响应
              if (eventType == "uploadPartSucceed") {
                const index = obsCpDatas.findIndex((x) => x.key == uniqkey);
                const partIndex = cp.parts.findIndex(
                  (x) => x.partNumber == eventParam.partNumber
                );
                cp.parts[partIndex].isCompleted = true;
                obsCpDatas[index].cp = cp;
                localStorage.setItem("obsCpDatas", JSON.stringify(obsCpDatas));
              }
            },
          });
        } else {
          result = await this.obsClient.uploadFile({
            Bucket: bucket,
            Key: key,
            SourceFile: file,
            PartSize: chunkSize,
            ProgressCallback: (
              transferredAmount,
              totalAmount,
              totalSeconds
            ) => {
              if (onProgress && typeof onProgress === "function") {
                onProgress(transferredAmount / totalAmount);
              }
            },
            ResumeCallback: function (resumeHook, uploadCheckpoint) {
              // 记录断点
              console.log("记录断点:", uploadCheckpoint);
              cp = uploadCheckpoint;
              if (ifExist) {
                obsCpDatas[index].cp = cp;
              } else {
                obsCpDatas.push({
                  key: uniqkey,
                  cp,
                });
                localStorage.setItem("obsCpDatas", JSON.stringify(obsCpDatas));
              }
            },
            EventCallback: function (eventType, eventParam, eventResult) {
              // 处理事件响应
              if (eventType == "uploadPartSucceed") {
                const index = obsCpDatas.findIndex((x) => x.key == uniqkey);
                const partIndex = cp.parts.findIndex(
                  (x) => x.partNumber == eventParam.partNumber
                );
                cp.parts[partIndex].isCompleted = true;
                obsCpDatas[index].cp = cp;
                localStorage.setItem("obsCpDatas", JSON.stringify(obsCpDatas));
              }
            },
          });
        }
        if (result.CommonMsg.Status < 300) {
          const index = obsCpDatas.findIndex((x) => x.key == uniqkey);
          obsCpDatas.splice(index, 1);
          localStorage.setItem("obsCpDatas", JSON.stringify(obsCpDatas));
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
  }
  // 图片加水印（华为云OBS处理方式）
  async addWatermark({ bucket, region, key, watermarkText }) {
    try {
      // 确保使用有效的凭证
      // 注意：这里可能需要重新获取配置信息，但在当前上下文中可能无法获取
      // 如果需要支持临时凭证的水印功能，可能需要调整调用方式

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
