import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/steamapi': {
        target: 'https://store.steampowered.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/steamapi/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Origin', 'https://store.steampowered.com');
            proxyReq.setHeader('Referer', 'https://store.steampowered.com');
          });
        }
      }
    }
  }
})