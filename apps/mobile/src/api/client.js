import { MoeAuthStore } from '@sonic-music/shared/stores/auth'
import { useSettingsStore } from '@sonic-music/shared/stores/settings'

function buildAuthHeader() {
  const auth = MoeAuthStore()
  console.log('[auth] UserInfo:', auth.UserInfo)
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
    const settings = useSettingsStore()
    // #ifdef H5
    const baseUrl = ''
    // #endif
    // #ifndef H5
    const baseUrl = settings.apiBaseUrl || import.meta.env.VITE_APP_API_URL || 'http://127.0.0.1:6521'
    // #endif
    const authHeader = buildAuthHeader()

    let finalUrl = baseUrl + url
    if (method === 'GET' && Object.keys(data).length > 0) {
      const qs = Object.entries(data).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + qs
      data = {}
    }

    uni.request({
      url: finalUrl,
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
