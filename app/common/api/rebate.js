import { request } from './request'

// 返点管理列表
export function getRebateList(params) {
  return request({
    url: '/rebate/list',
    method: 'GET',
    params
  })
}

// 巨量引擎模块列表
export function getOceanengineModuleList(params) {
  return request({
    url: '/oceanengine/module/list',
    method: 'GET',
    params
  })
}

