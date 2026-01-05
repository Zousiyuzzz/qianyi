import { request } from './request'

// 账户列表
export function getAccountList(params) {
  return request({
    url: '/accountinfo/list',
    method: 'GET',
    params
  })
}

export function addAccount(data) {
  return request({
    url: '/accountinfo/add',
    method: 'POST',
    data
  })
}

export function updateAccount(data) {
  return request({
    url: '/accountinfo/edit',
    method: 'PUT',
    data
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

export function addAccountSubject(data) {
  return request({
    url: '/accountSubject/add',
    method: 'POST',
    data
  })
}

export function updateAccountSubject(data) {
  return request({
    url: '/accountSubject/edit',
    method: 'PUT',
    data
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

export function addSharedWallet(data) {
  return request({
    url: '/advertiserWalletInfo/add',
    method: 'POST',
    data
  })
}

export function updateSharedWallet(data) {
  return request({
    url: '/advertiserWalletInfo/edit',
    method: 'PUT',
    data
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

export function addSecondaryAgent(data) {
  return request({
    url: '/secondaryAgentInfo/add',
    method: 'POST',
    data
  })
}

export function updateSecondaryAgent(data) {
  return request({
    url: '/secondaryAgentInfo/edit',
    method: 'PUT',
    data
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

export function addAdvertiserCopy(data) {
  return request({
    url: '/advertiserCopy/add',
    method: 'POST',
    data
  })
}

export function updateAdvertiserCopy(data) {
  return request({
    url: '/advertiserCopy/edit',
    method: 'PUT',
    data
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

export function addAccountChangeRecord(data) {
  return request({
    url: '/accountProjectHistory/add',
    method: 'POST',
    data
  })
}

export function updateAccountChangeRecord(data) {
  return request({
    url: '/accountProjectHistory/edit',
    method: 'PUT',
    data
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

export function addAgentConsume(data) {
  return request({
    url: '/agentdata/add',
    method: 'POST',
    data
  })
}

export function updateAgentConsume(data) {
  return request({
    url: '/agentdata/edit',
    method: 'PUT',
    data
  })
}

