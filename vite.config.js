import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/video-proxy': {
        target: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/video-proxy/, ''),
      },
      '/animex': {
        target: 'https://animex.wrdd.site',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/animex/, ''),
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Referer', 'https://animex.wrdd.site/')
            proxyReq.setHeader('X-Requested-With', 'XMLHttpRequest')
          })
        },
      },
    },
  },
})
