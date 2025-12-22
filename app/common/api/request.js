import qs from 'qs'
import { API_ENV, STORAGE_KEYS } from '../config'
import signMd5Utils from '../utils/signMd5Utils'

const defaultHeaders = {
  'Content-Type': 'application/json;charset=UTF-8'
}

function buildUrl(path = '') {
  const base = API_ENV.gateway || API_ENV.baseURL || ''
  if (!path) return base
  if (/^https?:\/\//i.test(path)) return path
  const normalizedBase = base.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

function attachAuth(headers = {}) {
  const token = uni.getStorageSync(STORAGE_KEYS.ACCESS_TOKEN)
  const tenantId = uni.getStorageSync(STORAGE_KEYS.TENANT_ID)
  if (token) headers['X-Access-Token'] = token
  headers['tenant-id'] = tenantId || 0
  return headers
}

function attachSign(url, data = {}) {
  if (!API_ENV.enableEncrypt) return {}
  return {
    'X-Sign': signMd5Utils.getSign(url, data),
    'X-TIMESTAMP': signMd5Utils.getTimestamp()
  }
}

function normalizeData(method, data, params) {
  if (method === 'GET' && data && Object.keys(data).length > 0) {
    return { data: null, params: data }
  }
  if (params && Object.keys(params).length) {
    return { data, params }
  }
  return { data, params: {} }
}

function showError(message) {
  uni.showToast({ title: message || '请求失败', icon: 'none', duration: 2200 })
}

function resolveResponse(res, { skipErrorToast }) {
  const { statusCode, data } = res
  if (statusCode >= 200 && statusCode < 300) {
    if (data && data.success === false && !skipErrorToast) {
      showError(data.message || '服务异常')
    }
    return data
  }
  if (!skipErrorToast) {
    showError(data?.message || `HTTP ${statusCode}`)
  }
  return Promise.reject(data)
}

export function request(options = {}) {
  const { url = '', method = 'GET', data = {}, params = {}, headers = {}, hideLoading = false, responseType = 'json', skipErrorToast = false } = options
  const finalMethod = method.toUpperCase()
  const { data: normalizedData, params: normalizedParams } = normalizeData(finalMethod, data, params)
  const finalParams = finalMethod === 'GET' ? { _t: Date.parse(new Date()) / 1000, ...normalizedParams } : normalizedParams
  const requestUrl = buildUrl(url)
  const finalHeaders = {
    ...defaultHeaders,
    ...attachAuth({ ...headers }),
    ...attachSign(url, normalizedData || finalParams || {})
  }

  const queryString = finalParams && Object.keys(finalParams).length ? `?${qs.stringify(finalParams, { arrayFormat: 'repeat' })}` : ''
  if (!hideLoading) {
    uni.showLoading({ title: '加载中', mask: true })
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${requestUrl}${queryString}`,
      method: finalMethod,
      data: normalizedData,
      header: finalHeaders,
      timeout: API_ENV.timeout,
      responseType,
      success: (res) => {
        resolve(resolveResponse(res, { skipErrorToast }))
      },
      fail: (error) => {
        if (!skipErrorToast) {
          showError(error.errMsg || '网络异常')
        }
        reject(error)
      },
      complete: () => {
        if (!hideLoading) {
          uni.hideLoading()
        }
      }
    })
  })
}

export function uploadFile({ url, filePath, name = 'file', formData = {}, headers = {}, skipErrorToast = false }) {
  const requestUrl = buildUrl(url || API_ENV.uploadUrl)
  const finalHeaders = { ...attachAuth({ ...headers }), ...attachSign(url, formData) }
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: requestUrl,
      filePath,
      name,
      formData,
      header: finalHeaders,
      timeout: API_ENV.timeout,
      success: (res) => {
        try {
          const parsed = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          resolve(resolveResponse({ statusCode: res.statusCode, data: parsed }, { skipErrorToast }))
        } catch (e) {
          if (!skipErrorToast) showError('上传解析失败')
          reject(e)
        }
      },
      fail: (error) => {
        if (!skipErrorToast) showError(error.errMsg || '上传失败')
        reject(error)
      }
    })
  })
}

export function downloadFile({ url, filePath, headers = {}, skipErrorToast = false }) {
  const requestUrl = buildUrl(url || API_ENV.downloadUrl)
  const finalHeaders = { ...attachAuth({ ...headers }), ...attachSign(url, {}) }
  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url: requestUrl,
      header: finalHeaders,
      timeout: API_ENV.timeout,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath || filePath)
        } else {
          if (!skipErrorToast) showError('下载失败')
          reject(res)
        }
      },
      fail: (error) => {
        if (!skipErrorToast) showError(error.errMsg || '下载失败')
        reject(error)
      }
    })
  })
}

export function setToken(token) {
  if (token) {
    uni.setStorageSync(STORAGE_KEYS.ACCESS_TOKEN, token)
  } else {
    uni.removeStorageSync(STORAGE_KEYS.ACCESS_TOKEN)
  }
}

export function setTenant(tenantId) {
  if (tenantId || tenantId === 0) {
    uni.setStorageSync(STORAGE_KEYS.TENANT_ID, tenantId)
  }
}
