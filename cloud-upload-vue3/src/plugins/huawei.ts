import type { CloudConfig, UploadOptions, UploadResult } from '../types';

interface TempCredential {
  accessKeyId: string;
  secretAccessKey: string;
  securityToken: string;
  expiredTime: string;
}

interface ObsCpData {
  key: string;
  cp: any;
  createTime: number;
}

// 华为云OBS类型定义
declare class ObsClient {
  constructor(config: any);
  putObject(params: any): Promise<any>;
  uploadFile(params: any): Promise<any>;
  getObject(params: any): Promise<any>;
  initLog(params: any): void;
}

/**
 * 华为云OBS上传助手类
 */
class ObsHelper {
  private static instance: ObsHelper | null = null;
  private static externalOBS: any = null;
  private static refCount = 0;
  
  private obsClient: ObsClient | null = null;
  private tempCredential: TempCredential | null = null;
  private accessKeyId: string | null = null;
  private secretAccessKey: string | null = null;
  private server: string | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * 设置外部OBS对象
   */
  static setExternalOBS(OBS: any): void {
    this.externalOBS = OBS;
  }

  /**
   * 获取单例实例
   */
  static getInstance(config: CloudConfig): ObsHelper | null {
    if (!this.instance) {
      if (
        config &&
        ((config.accessKeyId && config.secretAccessKey && !config.getTempCredential) ||
          (config.getTempCredential && typeof config.getTempCredential === 'function'))
      ) {
        this.instance = new ObsHelper(config);
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
      localStorage.removeItem('obsCredential');
      
      // 清理超过10天的断点记录
      try {
        const localData = localStorage.getItem('obsCpDatas');
        if (localData) {
          let obsCpDatas = JSON.parse(localData) as ObsCpData[];
          const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
          obsCpDatas = obsCpDatas.filter((item) => {
            if (!item.createTime) {
              return false;
            }
            return item.createTime > tenDaysAgo;
          });
          localStorage.setItem('obsCpDatas', JSON.stringify(obsCpDatas));
        }
      } catch (error) {
        console.error('清理过期断点记录失败:', error);
      }
    }
  }

  private constructor(config: CloudConfig) {
    if (config && config.server) {
      this.server = config.server;
    }
    
    if (config && config.accessKeyId && config.secretAccessKey) {
      this.accessKeyId = config.accessKeyId;
      this.secretAccessKey = config.secretAccessKey;
    }
    
    this.initPromise = this.initClient(config);
  }

  private async initClient(config: CloudConfig): Promise<void> {
    // 动态导入OBS SDK
    let ObsClient: any;
    if (ObsHelper.externalOBS) {
      ObsClient = ObsHelper.externalOBS;
    } else {
      try {
        // @ts-ignore
        const obsModule = await import('esdk-obs-browserjs');
        ObsClient = obsModule.default || obsModule;
      } catch (error) {
        console.error('无法加载esdk-obs-browserjs，请确保已安装该依赖:', error);
        throw new Error('请安装esdk-obs-browserjs依赖: npm install esdk-obs-browserjs');
      }
    }

    if (this.accessKeyId && this.secretAccessKey && !config.getTempCredential) {
      this.obsClient = new ObsClient({
        access_key_id: this.accessKeyId,
        secret_access_key: this.secretAccessKey,
        server: this.server,
      });
    } else if (config.getTempCredential) {
      await this.getTempCredential(config.getTempCredential);
      this.obsClient = new ObsClient({
        access: this.tempCredential!.accessKeyId,
        secret: this.tempCredential!.secretAccessKey,
        security_token: this.tempCredential!.securityToken,
        server: this.server,
      });
    } else {
      throw new Error('缺少必要的认证信息：需要提供永久密钥或getTempCredential函数');
    }

    this.obsClient?.initLog({
      level: 'warn',
    });
  }

  private async getTempCredential(getToken: () => Promise<any>): Promise<void> {
    let storeCredentialStr = localStorage.getItem('obsCredential');
    let storeCredential: TempCredential | null = null;
    if (storeCredentialStr) {
      storeCredential = JSON.parse(storeCredentialStr) as TempCredential;
    }
    if (storeCredential && !this.isCredentialExpired(storeCredential)) {
      this.tempCredential = storeCredential;
      return;
    }
    
    try {
      const data = await getToken();
      if (data && typeof data === 'object') {
        this.tempCredential = {
          accessKeyId: data.credential.access,
          secretAccessKey: data.credential.secret,
          securityToken: data.credential.securitytoken,
          expiredTime: data.credential.expires_at,
        };
        localStorage.setItem('obsCredential', JSON.stringify(this.tempCredential));
      }
    } catch (error) {
      throw new Error('获取临时凭证失败: ' + (error as Error).message);
    }
  }

  private isCredentialExpired(credential: TempCredential = this.tempCredential!): boolean {
    if (!credential) return true;
    const now = Date.now();
    const expireTime = Date.parse(credential.expiredTime);
    return now >= expireTime - 60 * 1000;
  }

  /**
   * 确保使用有效的凭证
   */
  private async ensureValidCredential(getTempCredential?: () => Promise<any>): Promise<void> {
    if (getTempCredential && (!this.tempCredential || this.isCredentialExpired())) {
      await this.getTempCredential(getTempCredential);
      let ObsClient = ObsHelper.externalOBS || (window as any).ObsClient;
      this.obsClient = new ObsClient({
        access: this.tempCredential!.accessKeyId,
        secret: this.tempCredential!.secretAccessKey,
        security_token: this.tempCredential!.securityToken,
        server: this.server,
      });
    }
  }

  /**
   * 单文件上传
   */
  async uploadFile(options: UploadOptions): Promise<UploadResult> {
    const { file, key, sliceSize, chunkSize, onProgress } = options;
    const bucket = (options as any).bucket;
    const getTempCredential = (options as any).getTempCredential;
    
    await this.ensureValidCredential(getTempCredential);
    
    if (file.size < sliceSize) {
      try {
        const result = await this.obsClient!.putObject({
          Bucket: bucket,
          Key: key,
          SourceFile: file,
          ProgressCallback: (transferredAmount: number, totalAmount: number) => {
            if (onProgress && typeof onProgress === 'function') {
              onProgress(transferredAmount / totalAmount);
            }
          },
        });
        
        if (result.CommonMsg.Status < 300) {
          const down_result = await this.obsClient!.getObject({
            Bucket: bucket,
            Key: key,
            SaveByType: 'file',
          });
          let url = '';
          if (down_result.CommonMsg.Status < 300 && down_result.InterfaceResult) {
            url = down_result.InterfaceResult.Content.SignedUrl;
          } else {
            throw new Error(`附件url获取失败: ${down_result.CommonMsg.Code}`);
          }
          return {
            url,
            key: key,
            name: file.name,
            ...result,
          };
        } else {
          throw new Error(`上传失败: ${result.CommonMsg.Code}`);
        }
      } catch (error) {
        throw new Error(`华为云OBS上传失败: ${(error as Error).message}`);
      }
    } else {
      try {
        let obsCpDatas: ObsCpData[] = [];
        const localData = localStorage.getItem('obsCpDatas');
        if (localData) {
          obsCpDatas = JSON.parse(localData);
        }
        const uniqkey = `${file.name}-${file.size}-${file.lastModified}`;
        const index = obsCpDatas.findIndex((x) => x.key === uniqkey);
        const ifExist = index >= 0;
        let cp = ifExist ? obsCpDatas[index].cp : null;
        let result: any;
        
        if (cp) {
          cp.sourceFile = file;
          result = await this.obsClient!.uploadFile({
            UploadCheckpoint: cp,
            ProgressCallback: (transferredAmount: number, totalAmount: number) => {
              if (onProgress && typeof onProgress === 'function') {
                onProgress(transferredAmount / totalAmount);
              }
            },
            EventCallback: function (eventType: string, eventParam: any, eventResult: any) {
              if (eventType === 'uploadPartSucceed') {
                const index = obsCpDatas.findIndex((x) => x.key === uniqkey);
                const partIndex = cp.parts.findIndex((x: any) => x.partNumber === eventParam.partNumber);
                cp.parts[partIndex].isCompleted = true;
                obsCpDatas[index].cp = cp;
                localStorage.setItem('obsCpDatas', JSON.stringify(obsCpDatas));
              }
            },
          });
        } else {
          result = await this.obsClient!.uploadFile({
            Bucket: bucket,
            Key: key,
            SourceFile: file,
            PartSize: chunkSize,
            ProgressCallback: (transferredAmount: number, totalAmount: number) => {
              if (onProgress && typeof onProgress === 'function') {
                onProgress(transferredAmount / totalAmount);
              }
            },
            ResumeCallback: function (resumeHook: any, uploadCheckpoint: any) {
              cp = uploadCheckpoint;
              if (ifExist) {
                obsCpDatas[index].cp = cp;
              } else {
                obsCpDatas.push({
                  key: uniqkey,
                  cp,
                  createTime: Date.now(),
                });
                localStorage.setItem('obsCpDatas', JSON.stringify(obsCpDatas));
              }
            },
            EventCallback: function (eventType: string, eventParam: any, eventResult: any) {
              if (eventType === 'uploadPartSucceed') {
                const index = obsCpDatas.findIndex((x) => x.key === uniqkey);
                const partIndex = cp.parts.findIndex((x: any) => x.partNumber === eventParam.partNumber);
                cp.parts[partIndex].isCompleted = true;
                obsCpDatas[index].cp = cp;
                localStorage.setItem('obsCpDatas', JSON.stringify(obsCpDatas));
              }
            },
          });
        }
        
        if (result.CommonMsg.Status < 300) {
          const index = obsCpDatas.findIndex((x) => x.key === uniqkey);
          obsCpDatas.splice(index, 1);
          localStorage.setItem('obsCpDatas', JSON.stringify(obsCpDatas));
          
          const down_result = await this.obsClient!.getObject({
            Bucket: bucket,
            Key: result.InterfaceResult.Key,
            SaveByType: 'file',
          });
          let url = '';
          if (down_result.CommonMsg.Status < 300 && down_result.InterfaceResult) {
            url = down_result.InterfaceResult.Content.SignedUrl;
          } else {
            throw new Error(`附件url获取失败: ${down_result.CommonMsg.Code}`);
          }
          return {
            url,
            key: result.InterfaceResult.Key,
            name: file.name,
            ...result,
          };
        } else {
          throw new Error(`上传失败: ${result.CommonMsg.Code}`);
        }
      } catch (error) {
        throw new Error(`华为云OBS上传失败: ${(error as Error).message}`);
      }
    }
  }

  /**
   * 通过文件key获取地址
   */
  getFileUrlByKey(options: { bucket: string; key: string }): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const down_result = await this.obsClient!.getObject({
          Bucket: options.bucket,
          Key: options.key,
          SaveByType: 'file',
        });
        if (down_result.CommonMsg.Status < 300 && down_result.InterfaceResult) {
          const url = down_result.InterfaceResult.Content.SignedUrl;
          resolve(url);
        } else {
          reject(`附件url获取失败: ${down_result.CommonMsg.Code}`);
        }
      } catch (error) {
        reject('获取文件地址失败！');
      }
    });
  }

}

export default ObsHelper;
