import { describe, it, expect, beforeEach, vi } from "vitest";
import CosHelper from "../../src/plugins/tencent.js";
import ObsHelper from "../../src/plugins/huawei.js";
import OssHelper from "../../src/plugins/aliyun.js";

const now = Math.floor(Date.now() / 1000);

// 三个 Helper 单例结构一致，参数化覆盖其生命周期逻辑
const suites = [
  {
    name: "CosHelper (tencent)",
    Helper: CosHelper,
    mockSDK: () => vi.fn(function () { return { mock: true }; }),
    validConfig: () => ({
      getTempCredential: vi.fn(async () => ({
        credentials: { tmpSecretId: "id", tmpSecretKey: "key", sessionToken: "token" },
        startTime: now,
        expiredTime: now + 3600,
      })),
    }),
    clientField: "cosClient",
  },
  {
    name: "ObsHelper (huawei)",
    Helper: ObsHelper,
    mockSDK: () => vi.fn(function () { return { initLog: vi.fn() }; }),
    validConfig: () => ({
      getTempCredential: vi.fn(async () => ({
        credential: {
          access: "a",
          secret: "s",
          securitytoken: "t",
          expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        },
      })),
    }),
    clientField: "obsClient",
  },
  {
    name: "OssHelper (aliyun)",
    Helper: OssHelper,
    mockSDK: () => vi.fn(function () { return { mock: true }; }),
    validConfig: () => ({
      getTempCredential: vi.fn(async () => ({
        accessKeyId: "id",
        accessKeySecret: "secret",
        stsToken: "token",
      })),
    }),
    clientField: "ossClient",
  },
];

for (const suite of suites) {
  describe(suite.name, () => {
    beforeEach(() => {
      // 重置单例静态状态，隔离测试
      suite.Helper.instance = null;
      suite.Helper.refCount = 0;
      suite.Helper.externalCOS = null;
      suite.Helper.externalOBS = null;
      suite.Helper.externalOSS = null;
      localStorage.clear();
    });

    it("无效配置时 getInstance 返回 null 且不增加 refCount", () => {
      const inst = suite.Helper.getInstance({});
      expect(inst).toBeNull();
      expect(suite.Helper.refCount).toBe(0);
    });

    it("有效配置时 getInstance 返回实例且 refCount 为 1", () => {
      const sdk = suite.mockSDK();
      suite.Helper.externalCOS = sdk;
      suite.Helper.externalOBS = sdk;
      suite.Helper.externalOSS = sdk;
      const inst = suite.Helper.getInstance(suite.validConfig());
      expect(inst).not.toBeNull();
      expect(suite.Helper.refCount).toBe(1);
    });

    it("destroyInstance 清理实例字段且不产生静态属性（发现 4）", async () => {
      const sdk = suite.mockSDK();
      suite.Helper.externalCOS = sdk;
      suite.Helper.externalOBS = sdk;
      suite.Helper.externalOSS = sdk;
      const inst = suite.Helper.getInstance(suite.validConfig());
      await suite.Helper.waitForInitialization();
      expect(inst[suite.clientField]).toBeTruthy(); // 初始化完成，客户端已赋值
      suite.Helper.destroyInstance();
      expect(inst[suite.clientField]).toBeNull(); // 实例字段被清理
      expect(suite.Helper[suite.clientField]).toBeUndefined(); // 未污染类静态属性
    });

    it("refCount 精确配对：多次 getInstance/destroyInstance 后归零并销毁", () => {
      const sdk = suite.mockSDK();
      suite.Helper.externalCOS = sdk;
      suite.Helper.externalOBS = sdk;
      suite.Helper.externalOSS = sdk;
      const config = suite.validConfig();
      suite.Helper.getInstance(config);
      suite.Helper.getInstance(config);
      expect(suite.Helper.refCount).toBe(2);
      suite.Helper.destroyInstance();
      expect(suite.Helper.instance).not.toBeNull();
      suite.Helper.destroyInstance();
      expect(suite.Helper.instance).toBeNull();
      expect(suite.Helper.refCount).toBe(0);
    });
  });
}
