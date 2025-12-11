// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        suppressWarnings: true,
        suppressErrors: true,
        logLevel: 'silent',
        type: 'module'
      },
      workbox: {
        // 缓存策略配置
        runtimeCaching: [
          {
            // 匹配所有API请求
            urlPattern: /^\/api\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 1
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // 匹配所有静态资源
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|js|css|woff2)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7
              }
            }
          },
          {
            // 匹配导航请求（HTML）
            urlPattern: /\/$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 1天
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Sonic Music',
        short_name: 'Sonic',
        description: 'A modern cross-platform music player with multi-source support',
        theme_color: '#3B82F6',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        display_override: [
          "window-controls-overlay",
          "standalone",
          "minimal-ui",
          "browser"
        ],
        icons: [
          {
            src: '/assets/images/logo.png',
            sizes: '256x256',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: '',
  server: {
    host: true,
    port: 8080,
    strictPort: false, // 端口被占用时自动尝试下一个可用端口
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  }
});