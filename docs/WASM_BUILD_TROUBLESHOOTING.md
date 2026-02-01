# WASM 构建故障排除指南

## 问题：安装 wasm-pack 失败 - 缺少链接器

### 错误信息
```
error: linker `link.exe` not found
  |
  = note: program not found

note: the msvc targets depend on the msvc linker but `link.exe` was not found

note: please ensure that Visual Studio 2017 or later, or Build Tools for Visual Studio were installed with the Visual C++ option.
```

### 原因分析

Rust 在 Windows 上默认使用 MSVC 工具链，需要 Microsoft Visual C++ 的链接器（link.exe）。VS Code 不包含这个工具链，需要单独安装。

---

## 解决方案

### 方案 1：安装 Visual Studio Build Tools（推荐）

这是最简单和最推荐的解决方案。

#### 步骤：

1. **下载 Visual Studio Build Tools**
   - 访问：https://visualstudio.microsoft.com/downloads/
   - 下载 "Build Tools for Visual Studio 2022"（或 2019/2017）

2. **安装 Build Tools**
   - 运行安装程序
   - 在 "工作负载" 选项卡中，选择 **"使用 C++ 的桌面开发" (Desktop development with C++)**
   - 点击 "安装"

3. **验证安装**
   ```bash
   # 检查 link.exe 是否可用
   where link.exe
   ```

4. **重新安装 wasm-pack**
   ```bash
   cargo install wasm-pack
   ```

---

### 方案 2：使用 GNU 工具链

如果您不想安装 Visual Studio Build Tools，可以使用 GNU 工具链。

#### 步骤：

1. **安装 MinGW-w64**
   - 下载：https://www.mingw-w64.org/
   - 或使用 MSYS2：https://www.msys2.org/

2. **切换 Rust 工具链**
   ```bash
   # 安装 GNU 工具链
   rustup toolchain install stable-x86_64-pc-windows-gnu
   
   # 设置为默认工具链
   rustup default stable-x86_64-pc-windows-gnu
   ```

3. **重新安装 wasm-pack**
   ```bash
   cargo install wasm-pack
   ```

---

### 方案 3：使用预编译的 wasm-pack（最快）

如果您只是想快速构建 WASM 模块，可以使用预编译的二进制文件。

#### 步骤：

1. **下载预编译的 wasm-pack**
   - 访问：https://github.com/rustwasm/wasm-pack/releases
   - 下载最新版本的 `wasm-pack-init.exe`（Windows）

2. **安装**
   ```bash
   # 运行下载的安装程序
   wasm-pack-init.exe
   ```

3. **验证安装**
   ```bash
   wasm-pack --version
   ```

---

### 方案 4：使用 cargo-binstall（推荐用于快速安装）

使用 `cargo-binstall` 可以直接下载预编译的二进制文件，无需编译。

#### 步骤：

1. **安装 cargo-binstall**
   ```bash
   cargo install cargo-binstall
   ```

2. **使用 cargo-binstall 安装 wasm-pack**
   ```bash
   cargo binstall wasm-pack
   ```

---

## 验证安装

安装完成后，验证 wasm-pack 是否正确安装：

```bash
# 检查 wasm-pack 版本
wasm-pack --version

# 应该输出类似：wasm-pack 0.14.0
```

---

## 添加 WASM 目标

安装 wasm-pack 后，还需要添加 WASM 编译目标：

```bash
rustup target add wasm32-unknown-unknown
```

---

## 构建 WASM 模块

现在可以构建 WASM 模块了：

```bash
cd wasm-watermark
wasm-pack build --target web --out-dir pkg
```

---

## 构建过程卡住或无响应

### 问题：构建命令卡在 "Checking for the Wasm target..."

**可能原因：**
1. 未添加 wasm32 编译目标
2. 首次构建需要下载和编译大量依赖，需要较长时间
3. 网络连接问题导致依赖下载缓慢

**解决方案：**

#### 1. 确认已添加 wasm32 目标

```bash
# 检查已安装的目标
rustup target list --installed

# 如果没有 wasm32-unknown-unknown，则添加它
rustup target add wasm32-unknown-unknown
```

#### 2. 首次构建需要耐心等待

首次构建 WASM 模块时，需要：
- 下载所有依赖包（可能需要 5-10 分钟）
- 编译 Rust 代码（可能需要 10-30 分钟，取决于电脑性能）
- 生成 WASM 文件

**建议：**
- 保持网络连接稳定
- 不要中断构建过程
- 可以使用 `--release` 标志进行优化构建（但会更慢）

```bash
# 使用 release 模式构建（更慢但性能更好）
wasm-pack build --target web --out-dir pkg --release
```

#### 3. 检查构建进度

如果构建过程看起来卡住了，可以：
- 观察终端输出，看是否有编译进度
- 检查 CPU 使用率，如果 CPU 在工作，说明正在编译
- 等待至少 30 分钟再判断是否真的卡住

#### 4. 使用国内镜像加速（如果在中国）

如果在中国，可以使用国内镜像加速依赖下载：

```bash
# 设置 Cargo 使用国内镜像
# 在 ~/.cargo/config 中添加以下内容：

[source.crates-io]
replace-with = 'ustc'

[source.ustc]
registry = "sparse+https://mirrors.ustc.edu.cn/crates.io-index/"
```

#### 5. 清理缓存重新构建

如果构建失败或卡住，可以清理缓存后重试：

```bash
# 清理 Cargo 缓存
cargo clean

# 重新构建
wasm-pack build --target web --out-dir pkg
```

#### 6. 查看详细日志

如果需要查看详细的构建日志：

```bash
# 设置详细日志级别
RUST_LOG=debug wasm-pack build --target web --out-dir pkg
```

---

## 构建成功后的输出

构建成功后，应该看到类似以下的输出：

```
[INFO]: Checking for the Wasm target...
[INFO]: Compiling to Wasm...
   Compiling wasm-watermark v0.1.0 (D:\github\cloud-upload\wasm-watermark)
    Finished release [optimized] target(s) in 2m 30s
[INFO]: Optimizing wasm binaries with `wasm-opt`...
[INFO]: Optional fields missing from Cargo.toml: 'description', 'repository', and 'license'. These are not necessary, but recommended
[INFO]: :-) Done in 3m 10s
[INFO]: Your wasm pkg is ready to publish at D:\github\cloud-upload\wasm-watermark\pkg.
```

构建完成后，会在 `pkg` 目录下生成以下文件：
- `wasm_watermark.js` - JavaScript 绑定文件
- `wasm_watermark_bg.wasm` - WebAssembly 二进制文件
- `wasm_watermark.d.ts` - TypeScript 类型定义文件
- `package.json` - NPM 包配置文件

---

## 常见问题

### Q1: 安装 Build Tools 后仍然报错？

**A:** 可能需要重启终端或重新登录，让环境变量生效。

### Q2: Build Tools 安装太大？

**A:** 可以只安装 "C++ build tools" 组件，不需要安装完整的 Visual Studio。

### Q3: 使用 GNU 工具链会有兼容性问题吗？

**A:** 对于 WASM 编译，GNU 工具链完全兼容，不会有问题。

### Q4: 如何检查当前使用的工具链？

**A:** 运行以下命令：
```bash
rustup show
```

查看 `default host` 和 `installed toolchains` 部分。

---

## 推荐方案总结

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| 方案 1：Build Tools | 官方推荐，兼容性最好 | 安装包较大 | ⭐⭐⭐⭐⭐ |
| 方案 2：GNU 工具链 | 轻量级，无需额外安装 | 可能与其他工具冲突 | ⭐⭐⭐⭐ |
| 方案 3：预编译二进制 | 最快，无需编译 | 需要手动下载 | ⭐⭐⭐ |
| 方案 4：cargo-binstall | 快速，自动化 | 需要先安装 binstall | ⭐⭐⭐⭐ |

**对于大多数用户，推荐使用方案 1（Build Tools）或方案 4（cargo-binstall）。**

---

## 联系支持

如果以上方案都无法解决问题，请：

1. 检查 Rust 版本：`rustc --version`
2. 检查 Cargo 版本：`cargo --version`
3. 查看完整错误信息
4. 在项目 Issues 中提问

---

## 相关链接

- [Rust 官方文档 - Windows 安装](https://www.rust-lang.org/tools/install)
- [Visual Studio Build Tools 下载](https://visualstudio.microsoft.com/downloads/)
- [wasm-pack GitHub](https://github.com/rustwasm/wasm-pack)
- [Rustup 文档](https://rust-lang.github.io/rustup/)