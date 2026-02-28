import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'

function getApiPort() {
  const portFile = resolve(__dirname, '../api/.api-port')
  if (existsSync(portFile)) return readFileSync(portFile, 'utf-8').trim()
  return process.env.API_PORT || '6521'
}

export default defineConfig(() => {
  const apiTarget = `http://127.0.0.1:${getApiPort()}`
  const routes = ['/playlist','/song','/search','/everyday','/rank','/user','/login','/lyric','/artist','/top','/register','/captcha']
  const proxy = Object.fromEntries(routes.map(r => [r, { target: apiTarget, changeOrigin: true }]))
  return {
    plugins: [uni()],
    resolve: { alias: { '@': resolve(__dirname, 'src') } },
    server: { port: 5174, proxy }
  }
})
