import { MoeAuthStore } from '@sonic-music/shared/stores/auth'
import { useSettingsStore } from '@sonic-music/shared/stores/settings'

function buildAuthHeader() {
  const auth = MoeAuthStore()
  if (!auth.UserInfo) return ''
  const parts = []
  if (auth.UserInfo.token) parts.push('token=' + encodeURIComponent(auth.UserInfo.token))
  if (auth.UserInfo.userid) parts.push('userid=' + encodeURIComponent(auth.UserInfo.userid))
  if (auth.UserInfo.dfid) parts.push('dfid=' + encodeURIComponent(auth.UserInfo.dfid))
  return parts.join(';')
}

export function request(url, method, data) {
  method = method || 'GET'
  data = data || {}
  return new Promise((resolve, reject) => {
    // H5 开发环境：baseUrl 为空，走 vite proxy（避免跨域）
    // App/真机：从 settings 读取局域网 IP
    const settings = useSettingsStore()
    // #ifdef H5
    const baseUrl = ''
    // #endif
    // #ifndef H5
    const baseUrl = settings.apiBaseUrl || import.meta.env.VITE_APP_API_URL || 'http://127.0.0.1:6521'
    // #endif
    const authHeader = buildAuthHeader()
    uni.request({
      url: baseUrl + url,
      method,
      data,
      header: Object.assign(
        { 'Content-Type': 'application/json' },
        authHeader ? { Authorization: authHeader } : {}
      ),
      success: (res) => resolve(res.data),
      fail: (err) => {
        console.error('[API Error]', url, err)
        reject(err)
      },
    })
  })
}

export const get = (url, params) => request(url, 'GET', params)
export const post = (url, data) => request(url, 'POST', data)
