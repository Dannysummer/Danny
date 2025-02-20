import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')  // 这个别名配置很重要，用于 @ 导入
    }
  },
  server: {
    proxy: {
      '/qwen': {
        target: 'https://dashscope.aliyuncs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/qwen/, '')
      }
    }
  },
  assetsInclude: ['**/*.md']  // 这个配置用于处理 .md 文件
})
