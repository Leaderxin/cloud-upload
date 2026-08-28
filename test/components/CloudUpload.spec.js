import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import CloudUpload from "../../src/components/CloudUpload.vue";

// 三个平台插件的 mock Helper（记录 getInstance/destroyInstance 调用）
const mockHelpers = vi.hoisted(() => ({
  tencent: {
    default: {
      getInstance: vi.fn(() => ({})),
      waitForInitialization: vi.fn(async () => {}),
      destroyInstance: vi.fn(),
    },
  },
  huawei: {
    default: {
      getInstance: vi.fn(() => ({})),
      waitForInitialization: vi.fn(async () => {}),
      destroyInstance: vi.fn(),
    },
  },
  aliyun: {
    default: {
      getInstance: vi.fn(() => ({})),
      waitForInitialization: vi.fn(async () => {}),
      destroyInstance: vi.fn(),
    },
  },
}));

vi.mock("../../src/plugins/tencent.js", () => mockHelpers.tencent);
vi.mock("../../src/plugins/huawei.js", () => mockHelpers.huawei);
vi.mock("../../src/plugins/aliyun.js", () => mockHelpers.aliyun);

// element-ui 提供最小组件 stub（组件生命周期测试不关心渲染细节）
vi.mock("element-ui", () => ({
  Upload: { name: "ElUpload", render(h) { return h("div"); } },
  Image: { name: "ElImage", render(h) { return h("div"); } },
  Tooltip: { name: "ElTooltip", render(h) { return h("div"); } },
  Dialog: { name: "ElDialog", render(h) { return h("div"); } },
  Loading: { directive: {} },
}));

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function mountCloud(propsData) {
  return mount(CloudUpload, { propsData });
}

const baseConfig = (extra = {}) => ({
  bucket: "b",
  region: "r",
  path: "p/",
  getTempCredential: () => ({}),
  ...extra,
});

describe("CloudUpload 组件生命周期", () => {
  beforeEach(() => {
    mockHelpers.tencent.default.getInstance.mockClear();
    mockHelpers.tencent.default.destroyInstance.mockClear();
    mockHelpers.huawei.default.getInstance.mockClear();
    mockHelpers.huawei.default.destroyInstance.mockClear();
    mockHelpers.aliyun.default.getInstance.mockClear();
    mockHelpers.aliyun.default.destroyInstance.mockClear();
  });

  it("checkAndInit 幂等：同一平台只 getInstance 一次（发现 2）", async () => {
    const wrapper = mountCloud({
      cloudType: "tencent",
      cloudConfig: baseConfig(),
    });
    await flush();
    await flush();

    // 触发 cloudConfig watcher，不应再次 getInstance
    await wrapper.setProps({ cloudConfig: baseConfig({ bucket: "b2" }) });
    await flush();

    expect(mockHelpers.tencent.default.getInstance).toHaveBeenCalledTimes(1);

    wrapper.destroy();
  });

  it("beforeDestroy 只释放当前持有的平台（发现 1）", async () => {
    const wrapperA = mountCloud({
      cloudType: "tencent",
      cloudConfig: baseConfig(),
    });
    const wrapperB = mountCloud({
      cloudType: "huawei",
      cloudConfig: baseConfig({ server: "s" }),
    });
    await flush();
    await flush();

    wrapperA.destroy();
    await flush();

    expect(mockHelpers.tencent.default.destroyInstance).toHaveBeenCalledTimes(1);
    expect(mockHelpers.huawei.default.destroyInstance).toHaveBeenCalledTimes(0);

    wrapperB.destroy();
  });
});
