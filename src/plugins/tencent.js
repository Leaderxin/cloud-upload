class CosHelper {
  static instance = null;
  static externalCOS = null; // 外部传入的COS对象
  cosClient = null;
  tempCredential = null;

  // 设置外部COS对象的静态方法
  static setExternalCOS(COS) {
    this.externalCOS = COS;
  }

  static getInstance(getToken) {
    if (!this.instance) {
      this.instance = new CosHelper(getToken);
    }
    return this.instance;
  }

  static destroyInstance() {
    this.instance = null;
    this.cosClient = null;
    this.tempCredential = null;
    localStorage.removeItem("cosCredential");
  }

  constructor(getToken) {
    this.initClient(getToken);
  }

  async initClient(getToken) {
    // 如果有外部传入的COS对象，直接使用
    let COS = CosHelper.externalCOS;
    await this.getTempCredential(getToken);
    this.cosClient = new COS({
      getAuthorization: async (options, callback) => {
        try {
          if (!this.tempCredential || this.isCredentialExpired()) {
            await this.getTempCredential(getToken);
          }
          callback({
            TmpSecretId: this.tempCredential.tmpSecretId,
            TmpSecretKey: this.tempCredential.tmpSecretKey,
            SecurityToken: this.tempCredential.sessionToken,
            StartTime: this.tempCredential.startTime,
            ExpiredTime: this.tempCredential.expiredTime,
          });
        } catch (error) {
          console.error("获取临时凭证失败:", error);
        }
      },
    });
  }

  async getTempCredential(getToken) {
    // 优先从localStorage获取
    let storeCredential = localStorage.getItem("cosCredential");
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
          tmpSecretId: data.credentials.tmpSecretId,
          tmpSecretKey: data.credentials.tmpSecretKey,
          sessionToken: data.credentials.sessionToken,
          startTime: data.startTime,
          expiredTime: data.expiredTime,
        };
        localStorage.setItem(
          "cosCredential",
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

  // 单文件上传
  uploadFile({ bucket, region, key ,file, sliceSize, chunkSize, onProgress }) {
    return new Promise(async (resolve, reject) => {
      const isPublicRead = await this.isBucketPublicRead({ bucket, region });
      this.cosClient.uploadFile(
        {
          Bucket: bucket,
          Region: region,
          Key: key,
          Body: file,
          SliceSize: sliceSize, // 触发分块上传的阈值，超过5MB使用分块上传，默认 1MB，非必须
          ChunkSize: chunkSize, // 分块大小，默认 1MB，非必须
          onProgress: (progressData) => {
            console.log(`上传进度: ${progressData.percent * 100}%`);
            if (onProgress && typeof onProgress == "function") {
              onProgress(progressData.percent);
            }
          },
        },
        (err, data) => {
          if (err) reject(err);
          else {
            if (isPublicRead) {
              const url = data.Location.startsWith("https://")
                ? data.Location
                : "https://" + data.Location;
              resolve({ url: url, key: key, name:file.name ,...data });
            } else {
              this.cosClient.getObjectUrl(
                {
                  Bucket: bucket,
                  Region: region,
                  Key: key,
                  Sign: true,
                },
                function (err, urlData) {
                  if (err) {
                    console.log(err);
                  } else {
                    resolve({
                      url: urlData.Url,
                      key: key,
                      name:file.name,
                      ...data,
                    });
                  }
                }
              );
            }
          }
        }
      );
    });
  }

  // 图片加水印
  async addWatermark({ bucket, region, key, watermarkText }) {
    const params = {
      Bucket: bucket,
      Region: region,
      Key: key,
      PicOperations: JSON.stringify({
        is_pic_info: 1,
        rules: [
          {
            fileid: `watermark_${key}`,
            rule: `watermark/2/text/${encodeURIComponent(
              watermarkText
            )}/fill/IzAwMDAwMA/fontsize/20/dissolve/50/gravity/southeast/dx/20/dy/20`,
          },
        ],
      }),
    };

    return new Promise((resolve, reject) => {
      this.cosClient.ciPutObjectFromLocalFile(params, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  // 获取存储桶ACL（访问控制列表）
  async getBucketAcl({ bucket, region }) {
    return new Promise((resolve, reject) => {
      this.cosClient.getBucketAcl(
        {
          Bucket: bucket,
          Region: region,
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });
  }
  // 检查存储桶是否为公有读
  async isBucketPublicRead({ bucket, region }) {
    try {
      const aclData = await this.getBucketAcl({ bucket, region });
      return aclData.Grants.some(
        (grant) =>
          grant.Grantee.URI ===
            "http://cam.qcloud.com/groups/global/AllUsers" &&
          grant.Permission === "READ"
      );
    } catch (error) {
      console.error("检查存储桶权限失败:", error);
      return true;
    }
  }
}

export default CosHelper;
