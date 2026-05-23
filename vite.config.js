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
      '/consumet': {
        target: 'https://consumet-api.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/consumet/, ''),
      },
      '/allanime-proxy.php': {
        target: 'https://api.salidumay.com',
        changeOrigin: true,
      },
      '/yugen-proxy.php': {
        target: 'https://api.salidumay.com',
        changeOrigin: true,
      },
      '/animepahe-proxy.php': {
        target: 'https://animepahe.ru',
        changeOrigin: true,
        rewrite: () => '',
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq, req) => {
            const qs = req.url.split('?')[1] || ''
            proxyReq.path = '/api?' + qs
            proxyReq.setHeader('Referer', 'https://animepahe.ru/')
            proxyReq.setHeader('X-Requested-With', 'XMLHttpRequest')
          })
        },
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
