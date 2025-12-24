import api from './index'
import { request, setToken } from './request'
import { getToken } from '../auth'

export function getUserInfo() {
  return request({ url: api.UserInfo, method: 'GET' })
}

export function logout() {
  const token = getToken()
  return request({ 
    url: api.Logout, 
    method: 'POST',
    headers: { 'X-Access-Token': token || '' }
  }).then((res) => {
    setToken('')
    return res
  })
}

