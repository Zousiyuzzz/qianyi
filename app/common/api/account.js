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

// 共享钱包列表
export function getSharedWalletList(params) {
  return request({
    url: '/advertiserWalletInfo/list',
    method: 'GET',
    params
  })
}

// 子端口列表
export function getSecondaryAgentList(params) {
  return request({
    url: '/secondaryAgentInfo/list',
    method: 'GET',
    params
  })
}

// 广告主复制任务
export function getAdvertiserCopyList(params) {
  return request({
    url: '/advertiserCopy/list',
    method: 'GET',
    params
  })
}

// 账户绑定变动记录
export function getAccountChangeRecordList(params) {
  return request({
    url: '/accountProjectHistory/list',
    method: 'GET',
    params
  })
}

// 账户消耗总览
export function getAgentConsumeList(params) {
  return request({
    url: '/agentdata/list',
    method: 'GET',
    params
  })
}

