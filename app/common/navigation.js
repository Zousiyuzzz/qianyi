import { buildAuthedWebUrl, DEFAULT_ROUTE } from './config'
import { rememberWebRoute } from './auth'

// 原生页面路由映射
const NATIVE_PAGES = {
  // 充退处理
  '/chongtui/index': '/pages/fundTransfer/index',
  '/nonApiFundTransferRecord/list': '/pages/fundTransfer/index',
  // 客户与回款
  '/customerManager/TabCustomermanageList': '/pages/customer/index',
  '/customerManager/BackmoneyList': '/pages/customer/backmoney',
  '/customerManager/delay': '/pages/customer/delay',
  // 项目与资金池
  '/projectManager/TabProjectmanageList': '/pages/project/index',
  '/projectFundPool/TabProjectFundPoolList': '/pages/project/fundPool',
  '/projectFundPool/TabProjectFundPoolChangeLogList': '/pages/project/fundChangeLog',
  // 账户管理
  '/accountids/index': '/pages/account/index',
  '/accountSubject/index': '/pages/account/subject',
  '/fundTransferRecord/TabFundTransferRecordList': '/pages/account/flow',
  '/consume/index': '/pages/account/consume',
  // 资金管理
  '/moneyManager/Preparation': '/pages/money/arrival',
  '/moneyManager/Refund': '/pages/money/refund',
  '/projectLossRecord/index': '/pages/money/loss',
  // 素材管理
  '/materialManage/index': '/pages/material/index',
  '/materialManage/douyinViolationScoreRecord': '/pages/material/risk',
  // 返点管理
  '/mediaRebate/index': '/pages/rebate/index',
  // 渠道与代理商
  '/channelManager/ChannelList': '/pages/channel/index',
  '/advertiserInfo/TabAdvertiserInfoList': '/pages/channel/agent'
}

export function openWebView (path, title = '') {
  // 检查是否有原生页面
  if (NATIVE_PAGES[path]) {
    uni.navigateTo({ url: NATIVE_PAGES[path] })
    return
  }
  
  const target = path || DEFAULT_ROUTE
  rememberWebRoute(target)
  const url = buildAuthedWebUrl(target)
  
  // 确保URL只编码一次
  const encodedUrl = encodeURIComponent(url)
  const query = [`url=${encodedUrl}`]
  if (title) {
    query.push(`title=${encodeURIComponent(title)}`)
  }
  uni.navigateTo({ url: `/pages/webview/index?${query.join('&')}` })
}
