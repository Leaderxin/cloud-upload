// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue2';

export default defineConfig({
  plugins: [vue()],
  server: {
    open: true, // 开发服务器启动时自动在浏览器中打开应用程序
    port: 5500, // 指定开发服务器端口
    host: 'localhost' // 指定服务器监听的 IP 地址
  },
  build: {
    outDir: 'dist', // 输出目录
    //sourcemap: 'hidden',
    lib: {
      entry: resolve(__dirname, 'src/index.js'), // 组件库的入口文件
      name: 'CloudUpload', // UMD构建时全局变量的名称
      fileName: (format) => `cloud-upload.${format}.js` // 输出文件名
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue', 'element-ui', 'cos-js-sdk-v5', 'esdk-obs-browserjs'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
          'element-ui': 'ElementUI',
          'cos-js-sdk-v5': 'COS',
          'esdk-obs-browserjs': 'OBS'
        }
      }
    },
    target:'es2015'
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/iconfont/iconfont.css";`
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // 设置别名，方便引用源文件
    },
  },
});