import { request } from './request'

// 账户列表
export function getAccountList(params) {
  return request({
    url: '/accountinfo/list',
    method: 'GET',
    params
  })
}

// 账户详情
export function getAccountDetail(id) {
  return request({
    url: `/accountinfo/queryById?id=${id}`,
    method: 'GET'
  })
}

// 账户主体列表
export function getAccountSubjectList(params) {
  return request({
    url: '/accountSubject/list',
    method: 'GET',
    params
  })
}

// 账户主体详情
export function getAccountSubjectDetail(id) {
  return request({
    url: `/accountSubject/queryById?id=${id}`,
    method: 'GET'
  })
}

// 账户流水明细
export function getAccountFlowsList(params) {
  return request({
    url: '/capitalFlow/list',
    method: 'GET',
    params
  })
}

// 账户消耗明细
export function getAccountConsumptionList(params) {
  return request({
    url: '/accountinfo/queryListByConsume',
    method: 'GET',
    params
  })
}

