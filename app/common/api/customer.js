import { request } from './request'

// 客户池海列表
export function getCustomerList(params) {
  return request({
    url: '/customerManage/list',
    method: 'GET',
    params
  })
}

// 获取客户详情
export function getCustomerDetail(id) {
  return request({
    url: `/customerManage/queryById?id=${id}`,
    method: 'GET'
  })
}

// 更新客户名称
export function updateCustomerName(id, customerName) {
  return request({
    url: '/customerManage/edit',
    method: 'PUT',
    data: { id, customerName }
  })
}

// 回款列表
export function getBackmoneyList(params) {
  return request({
    url: '/tempProjectPaymentRecords/list',
    method: 'GET',
    params
  })
}

// 回款详情
export function getBackmoneyDetail(id) {
  return request({
    url: `/tempProjectPaymentRecords/queryById?id=${id}`,
    method: 'GET'
  })
}

// 回款延期列表
export function getPaymentDelayApplyList(params) {
  return request({
    url: '/paymentDelayApply/list',
    method: 'GET',
    params
  })
}

// 回款延期详情
export function getPaymentDelayApplyDetail(id) {
  return request({
    url: `/paymentDelayApply/queryById?id=${id}`,
    method: 'GET'
  })
}

// 导出客户列表
export function exportCustomerList(params) {
  return request({
    url: '/customerManage/exportXls',
    method: 'GET',
    params,
    responseType: 'blob'
  })
}
