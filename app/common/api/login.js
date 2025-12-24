import api from './index'
import { request, setToken, setTenant } from './request'

export function login(parameter) {
  return request({ url: api.Login, method: 'POST', data: parameter }).then((res) => {
    // token已经在登录页面通过setLoginSession保存，这里不需要重复保存
    // 但为了兼容性，仍然保存一次
    if (res?.result?.token) {
      setToken(res.result.token)
    }
    if (res?.result?.tenantId) {
      setTenant(res.result.tenantId)
    }
    return res
  })
}

export function phoneLogin(parameter) {
  return request({ url: '/sys/phoneLogin', method: 'POST', data: parameter }).then((res) => {
    if (res?.result?.token) {
      setToken(res.result.token)
    }
    if (res?.result?.tenantId) {
      setTenant(res.result.tenantId)
    }
    return res
  })
}

export function getSmsCaptcha(parameter) {
  return request({ url: api.SendSms, method: 'POST', data: parameter })
}

export function requestSmsCaptcha(parameter) {
  return getSmsCaptcha(parameter)
}

export function logout(logoutToken) {
  return request({ url: api.Logout, method: 'POST', headers: { 'X-Access-Token': logoutToken || '' } }).then((res) => {
    setToken('')
    return res
  })
}

export function thirdLogin(token, thirdType) {
  return request({
    url: `/sys/thirdLogin/getLoginUser/${token}/${thirdType}`,
    method: 'GET'
  })
}

export function forceLogout(parameter) {
  return request({ url: '/sys/online/forceLogout', method: 'POST', data: parameter })
}
