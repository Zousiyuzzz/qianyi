export const ACCESS_TOKEN = 'Access-Token'
export const TENANT_ID = 'TENANT_ID'
export const USER_INFO = 'Login_Userinfo'
export const TOKEN_EXPIRE = 'Access-Token-Expire'
export const LAST_WEB_ROUTE = 'LAST_WEB_ROUTE'

const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000

export function setLoginSession (loginResult = {}) {
  const { token, userInfo = {}, tenantId, tenantList } = loginResult
  if (token) {
    uni.setStorageSync(ACCESS_TOKEN, token)
    uni.setStorageSync(TOKEN_EXPIRE, Date.now() + TOKEN_TTL)
  }
  if (userInfo && Object.keys(userInfo).length) {
    uni.setStorageSync(USER_INFO, userInfo)
  }
  // 优先后端返回的租户 ID，其次租户列表的第一个
  const resolvedTenantId = tenantId || (Array.isArray(tenantList) && tenantList[0] && tenantList[0].id) || userInfo.tenantId
  if (resolvedTenantId !== undefined) {
    uni.setStorageSync(TENANT_ID, resolvedTenantId)
  }
}

export function clearLoginSession () {
  uni.removeStorageSync(ACCESS_TOKEN)
  uni.removeStorageSync(TOKEN_EXPIRE)
  uni.removeStorageSync(USER_INFO)
  uni.removeStorageSync(TENANT_ID)
}

export function getToken () {
  return uni.getStorageSync(ACCESS_TOKEN)
}

export function getTenantId () {
  return uni.getStorageSync(TENANT_ID)
}

export function hasValidToken () {
  const token = getToken()
  const expireAt = uni.getStorageSync(TOKEN_EXPIRE)
  if (!token) return false
  if (!expireAt) return true
  return Date.now() < expireAt
}

export function rememberWebRoute (path) {
  if (path) {
    uni.setStorageSync(LAST_WEB_ROUTE, path)
  }
}

export function getLastWebRoute (fallback) {
  return uni.getStorageSync(LAST_WEB_ROUTE) || fallback
}
