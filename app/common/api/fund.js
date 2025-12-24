import { request } from './request'

// 充退处理列表
export function getFundTransferRecordList(params) {
  return request({
    url: '/nonApiFundTransferRecord/list',
    method: 'GET',
    params
  })
}

// 同意充退
export function agreeFundTransfer(id) {
  return request({
    url: '/nonApiFundTransferRecord/agree',
    method: 'POST',
    data: { id }
  })
}

// 驳回充退
export function rejectFundTransfer(id) {
  return request({
    url: '/nonApiFundTransferRecord/reject',
    method: 'POST',
    data: { id }
  })
}

// 批量同意
export function batchAgreeFundTransfer(ids) {
  return request({
    url: '/nonApiFundTransferRecord/agree',
    method: 'POST',
    data: { id: ids.join(',') }
  })
}

// 批量驳回
export function batchRejectFundTransfer(ids) {
  return request({
    url: '/nonApiFundTransferRecord/reject',
    method: 'POST',
    data: { id: ids.join(',') }
  })
}

// 修改交易时间
export function updateFundTransferTime(id, createTime) {
  return request({
    url: '/nonApiFundTransferRecord/updateCreateTime',
    method: 'POST',
    data: { id, createTime }
  })
}

