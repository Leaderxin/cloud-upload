import type { CloudConfig, UploadOptions, UploadResult } from '../types';

interface TempCredential {
  tmpSecretId: string;
  tmpSecretKey: string;
  sessionToken: string;
  startTime: number;
  expiredTime: number;
}

interface CosCacheData {
  key: string;
  name: string;
  createTime: number;
}

interface BucketAclGrant {
  Grantee: {
    URI?: string;
  };
  Permission: string;
}

interface BucketAclData {
  Grants: BucketAclGrant[];
}

// 腾讯云COS类型定义
declare class COS {
  constructor(config: any);
  uploadFile(params: any, callback: (err: any, data: any) => void): void;
  getObjectUrl(params: any, callback: (err: any, data: any) => void): void;
  getBucketAcl(params: any, callback: (err: any, data: any) => void): void;
}

/**
 * 腾讯云COS上传助手类
 */
class CosHelper {
  private static instance: CosHelper | null = null;
  private static externalCOS: any = null;
  private static refCount = 0;
  
  private cosClient: COS | null = null;
  private tempCredential: TempCredential | null = null;
  private secretId: string | null = null;
  private secretKey: string | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * 设置外部COS对象
   */
  static setExternalCOS(COS: any): void {
    this.externalCOS = COS;
  }

  /**
   * 获取单例实例
   */
  static getInstance(config: CloudConfig): CosHelper | null {
    if (!this.instance) {
      if (
        config &&
        ((config.secretId && config.secretKey) ||
          (config.getTempCredential &&
            typeof config.getTempCredential === 'function'))
      ) {
        this.instance = new CosHelper(config);
      }
    }
    if (this.instance) {
      this.refCount++;
    }
    return this.instance;
  }

  /**
   * 等待初始化完成
   */
  static async waitForInitialization(): Promise<void> {
    if (this.instance && this.instance.initPromise) {
      await this.instance.initPromise;
    }
  }

  /**
   * 销毁实例
   */
  static destroyInstance(): void {
    this.refCount--;
    if (this.refCount <= 0) {
      this.instance = null;
      this.refCount = 0;
      localStorage.removeItem('cosCredential');
      
      // 清理超过10天的断点记录
      try {
        const localData = localStorage.getItem('cosCacheDatas');
        if (localData) {
          let cosCacheDatas = JSON.parse(localData) as CosCacheData[];
          const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
          cosCacheDatas = cosCacheDatas.filter((item) => {
            if (!item.createTime) {
              return false;
            }
            return item.createTime > tenDaysAgo;
          });
          localStorage.setItem('cosCacheDatas', JSON.stringify(cosCacheDatas));
        }
      } catch (error) {
        console.error('清理过期断点记录失败:', error);
      }
    }
  }

  private constructor(config: CloudConfig) {
    // 检查是否提供了永久密钥
    if (config && config.secretId && config.secretKey) {
      this.secretId = config.secretId;
      this.secretKey = config.secretKey;
    }
    // 初始化Promise
    this.initPromise = this.initClient(config);
  }

  private async initClient(config: CloudConfig): Promise<void> {
    // 动态导入COS SDK
    let COS: any;
    if (CosHelper.externalCOS) {
      COS = CosHelper.externalCOS;
    } else {
      try {
        // @ts-ignore
        const cosModule = await import('cos-js-sdk-v5');
        COS = cosModule.default || cosModule;
      } catch (error) {
        console.error('无法加载cos-js-sdk-v5，请确保已安装该依赖:', error);
        throw new Error('请安装cos-js-sdk-v5依赖: npm install cos-js-sdk-v5');
      }
    }
    
    if (this.secretId && this.secretKey) {
      this.cosClient = new COS({
        SecretId: this.secretId,
        SecretKey: this.secretKey,
      });
    } else {
      const getToken = config.getTempCredential;
      if (!getToken) {
        throw new Error('缺少必要的认证信息');
      }
      await this.getTempCredential(getToken);
      
      this.cosClient = new COS({
        getAuthorization: async (options: any, callback: any) => {
          try {
            if (!this.tempCredential || this.isCredentialExpired()) {
              await this.getTempCredential(getToken);
            }
            callback({
              TmpSecretId: this.tempCredential!.tmpSecretId,
              TmpSecretKey: this.tempCredential!.tmpSecretKey,
              SecurityToken: this.tempCredential!.sessionToken,
              StartTime: this.tempCredential!.startTime,
              ExpiredTime: this.tempCredential!.expiredTime,
            });
          } catch (error) {
            console.error('获取临时凭证失败:', error);
          }
        },
      });
    }
  }

  private async getTempCredential(getToken: () => Promise<any>): Promise<void> {
    // 优先从localStorage获取
    let storeCredentialStr = localStorage.getItem('cosCredential');
    let storeCredential: TempCredential | null = null;
    if (storeCredentialStr) {
      storeCredential = JSON.parse(storeCredentialStr) as TempCredential;
    }
    if (storeCredential && !this.isCredentialExpired(storeCredential)) {
      this.tempCredential = storeCredential;
      return;
    }
    
    // localStorage无有效凭证则调用接口获取
    try {
      const data = await getToken();
      if (data && typeof data === 'object') {
        this.tempCredential = {
          tmpSecretId: data.credentials.tmpSecretId,
          tmpSecretKey: data.credentials.tmpSecretKey,
          sessionToken: data.credentials.sessionToken,
          startTime: data.startTime,
          expiredTime: data.expiredTime,
        };
        localStorage.setItem(
          'cosCredential',
          JSON.stringify(this.tempCredential)
        );
      }
    } catch (error) {
      throw new Error('获取临时凭证失败: ' + (error as Error).message);
    }
  }

  private isCredentialExpired(credential: TempCredential = this.tempCredential!): boolean {
    if (!credential) return true;
    const now = Math.floor(Date.now() / 1000);
    return now >= credential.expiredTime - 60; // 提前60秒认为过期
  }

  /**
   * 单文件上传
   */
  uploadFile(options: UploadOptions): Promise<UploadResult> {
    return new Promise(async (resolve, reject) => {
      const { file, key, sliceSize, chunkSize, onProgress } = options;
      const bucket = (options as any).bucket;
      const region = (options as any).region;
      
      const isPublicRead = await this.isBucketPublicRead({ bucket, region });
      const uniqkey = `${file.name}-${file.size}-${file.lastModified}`;
      let fileKey = '';
      
      if (file.size < sliceSize) {
        fileKey = key;
      } else {
        const cosData = this.getCosDataByKey(uniqkey);
        if(cosData) fileKey = cosData.name;
        else {
          fileKey = key;
          this.setCosData(uniqkey, key);
        }
      }
      
      this.cosClient!.uploadFile(
        {
          Bucket: bucket,
          Region: region,
          Key: fileKey,
          Body: file,
          SliceSize: sliceSize,
          ChunkSize: chunkSize,
          onProgress: (progressData: any) => {
            if (onProgress && typeof onProgress === 'function') {
              onProgress(progressData.percent);
            }
          },
        },
        (err, data) => {
          if (err) reject(err);
          else {
            this.delCosData(uniqkey);
            if (isPublicRead) {
              const url = data.Location.startsWith('https://')
                ? data.Location
                : 'https://' + data.Location;
              resolve({ url: url, key: fileKey, name: file.name, ...data });
            } else {
              this.cosClient!.getObjectUrl(
                {
                  Bucket: bucket,
                  Region: region,
                  Key: fileKey,
                  Sign: true,
                },
                function (err, urlData) {
                  if (err) {
                    console.log(err);
                  } else {
                    resolve({
                      url: urlData.Url,
                      key: fileKey,
                      name: file.name,
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

  /**
   * 通过文件key获取地址
   */
  getFileUrlByKey(options: { bucket: string; region: string; key: string }): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const { bucket, region, key } = options;
      let isPublicRead = await this.isBucketPublicRead({ bucket, region });
      try {
        let param = {
          Bucket: bucket,
          Region: region,
          Key: key,
          Sign: true,
        };
        if (isPublicRead) {
          param.Sign = false;
        }
        const url = await new Promise((resolve, reject) => {
          this.cosClient!.getObjectUrl(param, (err, urlData) => {
            if (err) reject(err);
            else resolve(urlData.Url);
          });
        });
        resolve(url as string);
      } catch (error) {
        reject('获取文件地址失败！');
      }
    });
  }

  private getCosDataByKey(key: string): CosCacheData | null {
    let cosCacheDatas: CosCacheData[] = [];
    const localData = localStorage.getItem('cosCacheDatas');
    if (localData) {
      cosCacheDatas = JSON.parse(localData);
    }
    const index = cosCacheDatas.findIndex((x) => x.key === key);
    if (index >= 0) {
      return cosCacheDatas[index];
    } else {
      return null;
    }
  }

  private setCosData(key: string, name: string): void {
    let cosCacheDatas: CosCacheData[] = [];
    const localData = localStorage.getItem('cosCacheDatas');
    if (localData) {
      cosCacheDatas = JSON.parse(localData);
    }
    const index = cosCacheDatas.findIndex((x) => x.key === key);
    if (index >= 0) {
      cosCacheDatas[index].name = name;
    } else {
      cosCacheDatas.push({
        key,
        name,
        createTime: Date.now(),
      });
    }
    localStorage.setItem('cosCacheDatas', JSON.stringify(cosCacheDatas));
  }

  private delCosData(key: string): void {
    let cosCacheDatas: CosCacheData[] = [];
    const localData = localStorage.getItem('cosCacheDatas');
    if (localData) {
      cosCacheDatas = JSON.parse(localData);
    }
    const index = cosCacheDatas.findIndex((x) => x.key === key);
    if (index >= 0) {
      cosCacheDatas.splice(index, 1);
      localStorage.setItem('cosCacheDatas', JSON.stringify(cosCacheDatas));
    }
  }

  /**
   * 获取存储桶ACL（访问控制列表）
   */
  private async getBucketAcl(options: { bucket: string; region: string }): Promise<BucketAclData> {
    return new Promise((resolve, reject) => {
      this.cosClient!.getBucketAcl(
        {
          Bucket: options.bucket,
          Region: options.region,
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

  /**
   * 检查存储桶是否为公有读
   */
  private async isBucketPublicRead(options: { bucket: string; region: string }): Promise<boolean> {
    try {
      const aclData = await this.getBucketAcl(options);
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
