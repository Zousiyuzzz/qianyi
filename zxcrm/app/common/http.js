import { clearLoginSession, getTenantId, getToken } from './auth'

const BASE_URL = 'http://101.200.146.164:8000/jeecg-boot'
let interceptorReady = false

function normalizeUrl (url = '') {
  if (/^https?:\/\//i.test(url)) {
    return url
  }
  const prefix = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL
  const clean = url.startsWith('/') ? url : `/${url}`
  return `${prefix}${clean}`
}

function handle401 () {
  clearLoginSession()
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  if (!current || current.route !== 'pages/login/index') {
    uni.reLaunch({ url: '/pages/login/index' })
  }
}

function injectInterceptors () {
  if (interceptorReady || typeof uni.addInterceptor !== 'function') return
  interceptorReady = true
  uni.addInterceptor('request', {
    invoke (options) {
      const headers = options.header || {}
      const token = getToken()
      const tenantId = getTenantId()
      if (token) {
        headers['X-Access-Token'] = token
      }
      headers['tenant-id'] = tenantId || 0
      options.header = headers
      options.url = normalizeUrl(options.url)
      return options
    },
    success (res) {
      if (res.statusCode === 401) {
        handle401()
      }
      return res
    },
    fail (err) {
      return err
    }
  })
}

injectInterceptors()

export function request (options) {
  const { url, method = 'GET', data, header, timeout = 60000 } = options
  return new Promise((resolve, reject) => {
    uni.request({
      url: normalizeUrl(url),
      method,
      data,
      timeout,
      header,
      success (res) {
        const payload = res.data
        if (res.statusCode === 401 || (payload && payload.code === 401)) {
          handle401()
          reject(payload || { message: '登录已过期' })
          return
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(payload)
          return
        }
        // 部分接口在状态码为 200 但业务码不为 200 时，需要调用方自行判断
        reject(payload || { message: res.errMsg || '请求失败', statusCode: res.statusCode })
      },
      fail (err) {
        reject(err)
      }
    })
  })
}

export const http = {
  get (url, params = {}, config = {}) {
    return request({ url, method: 'GET', data: params, ...config })
  },
  post (url, data = {}, config = {}) {
    return request({ url, method: 'POST', data, ...config })
  }
}

export { normalizeUrl }
