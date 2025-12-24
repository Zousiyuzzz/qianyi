import { request } from './request'

// 素材列表
export function getMaterialList(params) {
  return request({
    url: '/materialManage/list',
    method: 'GET',
    params
  })
}

// 素材详情
export function getMaterialDetail(id) {
  return request({
    url: `/materialManage/queryById?id=${id}`,
    method: 'GET'
  })
}

// 素材风控列表（抖音违规扣分记录）
export function getMaterialRiskList(params) {
  return request({
    url: '/materialManage/list',
    method: 'GET',
    params: {
      ...params,
      // 可以通过参数筛选风控相关数据
    }
  })
}

