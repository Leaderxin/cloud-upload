#!/bin/bash

# 构建WASM模块
echo "Building WASM module..."
wasm-pack build --target web --out-dir pkg

echo "Build complete!"