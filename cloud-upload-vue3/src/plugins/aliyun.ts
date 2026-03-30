import type { CloudConfig, UploadOptions, UploadResult } from '../types';

interface OssCptData {
  key: string;
  name: string;
  cpt: any;
  createTime: number;
}

// 阿里云OSS类型定义
declare class OSS {
  constructor(config: any);
  put(key: string, file: File, options?: any): Promise<any>;
  multipartUpload(key: string, file: File, options?: any): Promise<any>;
  signatureUrl(key: string, options?: any): string;
}

/**
 * 阿里云OSS上传助手类
 */
class OssHelper {
  private static instance: OssHelper | null = null;
  private static externalOSS: any = null;
  private static refCount = 0;
  
  private ossClient: OSS | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * 设置外部OSS对象
   */
  static setExternalOSS(OSS: any): void {
    this.externalOSS = OSS;
  }

  /**
   * 获取单例实例
   */
  static getInstance(config: CloudConfig): OssHelper | null {
    if (!this.instance) {
      if (
        config &&
        config.getTempCredential &&
        typeof config.getTempCredential === 'function'
      ) {
        this.instance = new OssHelper(config);
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
      
      // 清理超过10天的断点记录
      try {
        const localData = localStorage.getItem('ossCptDatas');
        if (localData) {
          let ossCptDatas = JSON.parse(localData) as OssCptData[];
          const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
          ossCptDatas = ossCptDatas.filter((item) => {
            if (!item.createTime) {
              return false;
            }
            return item.createTime > tenDaysAgo;
          });
          localStorage.setItem('ossCptDatas', JSON.stringify(ossCptDatas));
        }
      } catch (error) {
        console.error('清理过期断点记录失败:', error);
      }
    }
  }

  private constructor(config: CloudConfig) {
    this.initPromise = this.initClient(config);
  }

  private async initClient(config: CloudConfig): Promise<void> {
    const res = await config.getTempCredential!();
    const keys = ['accessKeyId', 'accessKeySecret', 'stsToken'];
    let isValid = true;
    keys.forEach((key) => {
      if (!res.hasOwnProperty(key)) {
        console.error(`getTempCredential函数未返回字段${key}`);
        isValid = false;
      }
    });
    if (!isValid) {
      OssHelper.instance = null;
      return;
    }
    
    // 动态导入OSS SDK
    let OSS: any;
    if (OssHelper.externalOSS) {
      OSS = OssHelper.externalOSS;
    } else {
      try {
        // @ts-ignore
        const ossModule = await import('ali-oss');
        OSS = ossModule.default || ossModule;
      } catch (error) {
        console.error('无法加载ali-oss，请确保已安装该依赖:', error);
        throw new Error('请安装ali-oss依赖: npm install ali-oss');
      }
    }
    
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

  /**
   * 单文件上传
   */
  async uploadFile(options: UploadOptions): Promise<UploadResult> {
    const { file, key, sliceSize, chunkSize, onProgress } = options;
    const bucket = (options as any).bucket;
    const region = (options as any).region;
    
    try {
      // 小文件直接上传
      if (file.size < sliceSize) {
        const result = await this.ossClient!.put(key, file, {
          progress: (p: number) => {
            if (onProgress && typeof onProgress === 'function') {
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
        let result: any;
        const uniqkey = `${file.name}-${file.size}-${file.lastModified}`;
        const cptData = this.getCptDataByKey(uniqkey);
        let cpt = cptData ? cptData.cpt : null;
        
        if (cpt) {
          // 大文件分片上传
          result = await this.ossClient!.multipartUpload(cptData!.name, file, {
            checkpoint: cpt,
            progress: (p: number, abortCheckpoint: any) => {
              this.setCptData(uniqkey, key, abortCheckpoint);
              if (onProgress && typeof onProgress === 'function') {
                onProgress(p);
              }
            },
            parallel: 4,
            partSize: chunkSize,
          });
        } else {
          // 大文件分片上传
          result = await this.ossClient!.multipartUpload(key, file, {
            progress: (p: number, abortCheckpoint: any) => {
              this.setCptData(uniqkey, key, abortCheckpoint);
              if (onProgress && typeof onProgress === 'function') {
                onProgress(p);
              }
            },
            parallel: 4,
            partSize: chunkSize,
          });
        }
        
        if (result.res.status === 200) {
          this.delCptData(uniqkey);
        }
        
        const url = `https://${bucket}.${region}.aliyuncs.com/${result.name}`;
        return {
          url: url,
          key: result.name,
          name: file.name,
          ...result,
        };
      }
    } catch (error) {
      throw new Error(`阿里云OSS上传失败: ${(error as Error).message}`);
    }
  }

  private getCptDataByKey(key: string): OssCptData | null {
    let ossCptDatas: OssCptData[] = [];
    const localData = localStorage.getItem('ossCptDatas');
    if (localData) {
      ossCptDatas = JSON.parse(localData);
    }
    const index = ossCptDatas.findIndex((x) => x.key === key);
    if (index >= 0) {
      return ossCptDatas[index];
    } else {
      return null;
    }
  }

  private setCptData(key: string, name: string, cpt: any): void {
    let ossCptDatas: OssCptData[] = [];
    const localData = localStorage.getItem('ossCptDatas');
    if (localData) {
      ossCptDatas = JSON.parse(localData);
    }
    const index = ossCptDatas.findIndex((x) => x.key === key);
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
    localStorage.setItem('ossCptDatas', JSON.stringify(ossCptDatas));
  }

  private delCptData(key: string): void {
    let ossCptDatas: OssCptData[] = [];
    const localData = localStorage.getItem('ossCptDatas');
    if (localData) {
      ossCptDatas = JSON.parse(localData);
    }
    const index = ossCptDatas.findIndex((x) => x.key === key);
    if (index >= 0) {
      ossCptDatas.splice(index, 1);
      localStorage.setItem('ossCptDatas', JSON.stringify(ossCptDatas));
    }
  }

  /**
   * 通过文件key获取地址
   */
  getFileUrlByKey(options: { key: string }): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const url = await this.ossClient!.signatureUrl(options.key, { expires: 7200 });
        resolve(url);
      } catch (error) {
        reject('获取文件地址失败！');
      }
    });
  }

}

export default OssHelper;
