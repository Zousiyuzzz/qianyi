import { clearLoginSession, getTenantId, getToken } from './auth'
import { API_ENV } from './config'
import signMd5Utils from './utils/signMd5Utils'

// const BASE_URL = 'http://101.200.146.164:8000/jeecg-boot'
const BASE_URL = 'http://192.168.8.197:8080/jeecg-boot'
let interceptorReady = false

function normalizeUrl(url = '') {
  if (/^https?:\/\//i.test(url)) {
    return url
  }
  const prefix = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL
  const clean = url.startsWith('/') ? url : `/${url}`
  return `${prefix}${clean}`
}

function handle401() {
  clearLoginSession()
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  if (!current || current.route !== 'pages/login/index') {
    uni.reLaunch({ url: '/pages/login/index' })
  }
}

function attachSign(url, data = {}) {
  // 如果未启用加密，仍然添加签名（根据实际需求）
  // if (!API_ENV.enableEncrypt) return {}
  return {
    'X-Sign': signMd5Utils.getSign(url, data),
    'X-TIMESTAMP': signMd5Utils.getTimestamp()
  }
}

function injectInterceptors() {
  if (interceptorReady || typeof uni.addInterceptor !== 'function') return
  interceptorReady = true
  uni.addInterceptor('request', {
    invoke(options) {
      const headers = options.header || {}
      const token = getToken()
      const tenantId = getTenantId()

      // 添加 token（只添加一次，如果 request.js 已经添加了就不再添加）
      if (token && !headers['X-Access-Token']) {
        headers['X-Access-Token'] = token
      }
      if (!headers['tenant-id']) {
        headers['tenant-id'] = tenantId || 0
      }

      // 注意：签名和时间戳不在拦截器中添加
      // 因为 request.js 中的 attachSign 会根据 enableEncrypt 决定是否添加
      // 如果 request.js 已经添加了签名，这里就不需要再添加

      options.header = headers
      options.url = url
      return options
    },
    success(res) {
      if (res.statusCode === 401) {
        handle401()
      }
      return res
    },
    fail(err) {
      return err
    }
  })
}

injectInterceptors()

export function request(options) {
  const { url, method = 'GET', data, header, timeout = 60000 } = options
  return new Promise((resolve, reject) => {
    uni.request({
      url: normalizeUrl(url),
      method,
      data,
      timeout,
      header,
      success(res) {
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
      fail(err) {
        reject(err)
      }
    })
  })
}

export const http = {
  get(url, params = {}, config = {}) {
    return request({ url, method: 'GET', data: params, ...config })
  },
  post(url, data = {}, config = {}) {
    return request({ url, method: 'POST', data, ...config })
  }
}

export { normalizeUrl }
