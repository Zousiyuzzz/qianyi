import { request } from './request'

// 渠道列表（商务人员）
export function getChannelList(params) {
  return request({
    url: '/business/list',
    method: 'GET',
    params
  })
}

// 渠道详情
export function getChannelDetail(id) {
  return request({
    url: `/business/queryById?id=${id}`,
    method: 'GET'
  })
}

// 代理商账户列表
export function getAgentAccountList(params) {
  return request({
    url: '/advertiserInfo/list',
    method: 'GET',
    params
  })
}

