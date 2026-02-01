#!/bin/bash

# 构建WASM模块（使用 release 模式以获得最小体积）
echo "Building WASM module in release mode..."
wasm-pack build --release --target web --out-dir pkg

echo "Build complete!"