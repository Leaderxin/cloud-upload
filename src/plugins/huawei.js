class ObsHelper {
  static instance = null;
  static externalOBS = null; // 外部传入的OBS对象
  obsClient = null;
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
    localStorage.removeItem("obsCpDatas");
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
    this.obsClient.initLog({
      level: "warn", // 配置日志级别
    });
  }

  // 单文件上传
  async uploadFile({ bucket, key, file, sliceSize, chunkSize, onProgress }) {
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
