import { request, uploadFile as uniUploadFile, downloadFile as uniDownloadFile } from './request'
import signMd5Utils from '../utils/signMd5Utils'

const api = {
  user: '/mock/api/user',
  role: '/mock/api/role',
  service: '/mock/api/service',
  permission: '/mock/api/permission',
  permissionNoPager: '/mock/api/permission/no-pager'
}

export default api

export function postAction(url, parameter = {}, options = {}) {
  return request({ url, method: 'POST', data: parameter, ...options })
}

export function httpAction(url, parameter = {}, method = 'POST', options = {}) {
  return request({ url, method, data: parameter, params: method === 'GET' ? parameter : {}, ...options })
}

export function putAction(url, parameter = {}, options = {}) {
  return request({ url, method: 'PUT', data: parameter, ...options })
}

export function getAction(url, parameter = {}, options = {}) {
  return request({ url, method: 'GET', params: parameter, ...options })
}

export function deleteAction(url, parameter = {}, options = {}) {
  return request({ url, method: 'DELETE', params: parameter, ...options })
}

export function getUserList(parameter) {
  return request({ url: api.user, method: 'GET', params: parameter })
}

export function getRoleList(parameter) {
  return request({ url: api.role, method: 'GET', params: parameter })
}

export function getServiceList(parameter) {
  return request({ url: api.service, method: 'GET', params: parameter })
}

export function getPermissions(parameter) {
  return request({ url: api.permissionNoPager, method: 'GET', params: parameter })
}

export function saveService(parameter) {
  return request({ url: api.service, method: parameter.id == 0 ? 'POST' : 'PUT', data: parameter })
}

export function downFile(url, parameter = {}, method = 'get') {
  return request({
    url,
    method: method.toUpperCase(),
    data: method.toLowerCase() === 'get' ? null : parameter,
    params: method.toLowerCase() === 'get' ? parameter : {},
    responseType: 'arraybuffer',
    hideLoading: true,
    skipErrorToast: true
  })
}

export function downloadFile(url, fileName, parameter = {}) {
  return uniDownloadFile({ url, filePath: fileName, headers: attachSignHeaders(url, parameter) })
}

export function uploadAction(url, parameter = {}) {
  const { filePath, name = 'file', formData = {} } = parameter
  if (!filePath) {
    return request({
      url,
      method: 'POST',
      data: parameter,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
  return uniUploadFile({ url, filePath, name, formData })
}

export function getFileAccessHttpUrl(avatar, subStr) {
  if (!subStr) subStr = 'http'
  try {
    if (avatar && avatar.startsWith(subStr)) {
      return avatar
    } else if (avatar && avatar.length > 0 && avatar.indexOf('[') === -1) {
      return `${subStr}://${avatar.replace(/^\//, '')}`
    }
  } catch (err) {
    return
  }
}

function attachSignHeaders(url, params) {
  const sign = signMd5Utils.getSign(url, params)
  return { 'X-Sign': sign, 'X-TIMESTAMP': signMd5Utils.getTimestamp() }
}
