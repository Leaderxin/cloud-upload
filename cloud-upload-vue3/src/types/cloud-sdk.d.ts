// 云存储SDK类型声明（用于动态导入）
declare module 'cos-js-sdk-v5' {
  const COS: any;
  export = COS;
}

declare module 'ali-oss' {
  const OSS: any;
  export = OSS;
}

declare module 'esdk-obs-browserjs' {
  const ObsClient: any;
  export = ObsClient;
}