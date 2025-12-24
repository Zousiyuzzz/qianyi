import { request } from './request'

// 客户到账列表（项目备款记录）
export function getCustomerArrivalList(params) {
  return request({
    url: '/projectFundReserve/list',
    method: 'GET',
    params
  })
}

// 客户退款列表（客户付款记录）
export function getCustomerRefundList(params) {
  return request({
    url: '/customerPaymentRecord/list',
    method: 'GET',
    params
  })
}

// 到账记录（银行侧 - 招行交易记录）
export function getBankTransactionList(params) {
  return request({
    url: '/cmbTransactionRecord/list',
    method: 'GET',
    params
  })
}

// 银行转账列表（招行转账记录）
export function getBankTransferList(params) {
  return request({
    url: '/cmbPaymentTransferRecord/list',
    method: 'GET',
    params
  })
}

// 项目损失列表
export function getProjectLossList(params) {
  return request({
    url: '/projectLossRecord/list',
    method: 'GET',
    params
  })
}

