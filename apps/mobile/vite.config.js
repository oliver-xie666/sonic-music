import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5174,
    proxy: {
      '/playlist': { target: 'http://127.0.0.1:6521', changeOrigin: true },
      '/song': { target: 'http://127.0.0.1:6521', changeOrigin: true },
      '/search': { target: 'http://127.0.0.1:6521', changeOrigin: true },
      '/everyday': { target: 'http://127.0.0.1:6521', changeOrigin: true },
      '/rank': { target: 'http://127.0.0.1:6521', changeOrigin: true },
      '/user': { target: 'http://127.0.0.1:6521', changeOrigin: true },
      '/login': { target: 'http://127.0.0.1:6521', changeOrigin: true },
      '/lyric': { target: 'http://127.0.0.1:6521', changeOrigin: true },
      '/artist': { target: 'http://127.0.0.1:6521', changeOrigin: true },
    }
  }
})
