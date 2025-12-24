import { request } from './request'

// 项目管理列表
export function getProjectList(params) {
  return request({
    url: '/projectmanage/list',
    method: 'GET',
    params
  })
}

// 项目详情
export function getProjectDetail(id) {
  return request({
    url: `/projectmanage/queryById?id=${id}`,
    method: 'GET'
  })
}

// 项目资金池列表
export function getProjectFundPoolList(params) {
  return request({
    url: '/projectFundPool/list',
    method: 'GET',
    params
  })
}

// 项目资金池详情
export function getProjectFundPoolDetail(id) {
  return request({
    url: `/projectFundPool/queryById?id=${id}`,
    method: 'GET'
  })
}

// 项目资金变动明细
export function getProjectFundChangesList(params) {
  return request({
    url: '/projectFundPoolChangeLog/list',
    method: 'GET',
    params
  })
}

