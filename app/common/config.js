import { getTenantId, getToken } from './auth'

export const THEME_COLOR = '#2e87ff'
export const THEME_GRADIENT = 'linear-gradient(135deg, #2e87ff 0%, #4ca1ff 40%, #7ecbff 100%)'
export const H5_BASE_URL = process.env.VUE_APP_H5_BASE_URL || 'http://localhost:8080/#'
export const DEFAULT_ROUTE = '/dashboard/analysis'

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '__zxcrm_access_token__',
  TENANT_ID: '__zxcrm_tenant_id__'
}

export const API_ENV = {
  baseURL: process.env.VUE_APP_APP_API_BASE_URL || process.env.VUE_APP_API_BASE_URL || '',
  gateway: process.env.VUE_APP_GATEWAY || '',
  timeout: Number(process.env.VUE_APP_REQUEST_TIMEOUT || 60000),
  enableEncrypt: String(process.env.VUE_APP_ENABLE_ENCRYPT || 'false') === 'true',
  uploadUrl: process.env.VUE_APP_UPLOAD_URL || '/sys/common/upload',
  downloadUrl: process.env.VUE_APP_DOWNLOAD_URL || '/sys/common/download'
}

export const MODULE_GROUPS = [
  {
    key: 'dashboard',
    title: '报表看板',
    description: '分析报表、汇总/渠道/销售/利润视图及个人工作台。',
    modules: [
      { title: '分析报表', path: '/dashboard/analysis', desc: '投放效果与经营趋势分析。' },
      { title: '汇总报表', path: '/totalCharts', desc: '汇总视图（隐藏菜单亦可直接打开）。' },
      { title: '渠道报表', path: '/channelCharts', desc: '渠道维度投放表现。' },
      { title: '销售报表', path: '/salesCharts', desc: '销售趋势与贡献度。' },
      { title: '利润菜单', path: '/lirunCharts', desc: '利润视图与经营健康度。' },
      { title: '工作台', path: '/dashboard/workplace', desc: '个人工作台及常用卡片入口。' }
    ]
  },
  {
    key: 'oa',
    title: '审批中心',
    description: '移动端审批任务和发起入口，复用 Web 审批流。',
    modules: [
      { title: '审批中心', path: '/OA/index', desc: '统一审批收件箱与发起列表。' }
    ]
  },
  {
    key: 'customer',
    title: '客户列表',
    description: '客户池海、回款管理与延期审批。',
    modules: [
      { title: '客户池海', path: '/customerManager/TabCustomermanageList', desc: '客户主数据与跟进。' },
      { title: '客户回款', path: '/customerManager/BackmoneyList', desc: '回款登记、核销与审批。' },
      { title: '回款延期', path: '/customerManager/delay', desc: '回款延期申请与处理。' }
    ]
  },
  {
    key: 'project',
    title: '项目列表',
    description: '项目全链路、资金池及机器人配置。',
    modules: [
      { title: '项目管理', path: '/projectManager/TabProjectmanageList', desc: '项目立项、进度与协作。' },
      { title: '项目资金池', path: '/projectFundPool/TabProjectFundPoolList', desc: '资金池余额与分配。' },
      { title: '项目资金变动明细', path: '/projectFundPool/TabProjectFundPoolChangeLogList', desc: '资金变动流水追踪。' },
      { title: '返点政策模板', path: '/customerManager/CustomerRetabeTemplate', desc: '返点政策模板配置。' },
      { title: '微信机器人配置', path: '/projectManager/wechatConfig', desc: '消息机器人与通知。' }
    ]
  },
  {
    key: 'money',
    title: '资金管理',
    description: '到账、退款、项目损失、合同及抬头/卡号配置。',
    modules: [
      { title: '客户到账', path: '/moneyManager/Preparation', desc: '到账登记与确认。' },
      { title: '客户退款', path: '/moneyManager/Refund', desc: '退款流程与凭证。' },
      { title: '到账记录', path: '/moneyManager/TabCmbTransactionRecordList', desc: '银行到账明细与核验。' },
      { title: '银行转账', path: '/moneyManager/TabCmbPaymentTransferRecordList', desc: '对公转账记录与凭证。' },
      { title: '项目损失', path: '/projectLossRecord/index', desc: '损益记录与核算。' },
      { title: '合同管理', path: '/contranct/index', desc: '合同台账与进度。' },
      { title: '抬头管理', path: '/Manager/bankAccount', desc: '抬头维护与开票。' },
      { title: '卡号配置', path: '/moneyManager/TabBankAccountConfigList', desc: '收付款卡号统一配置。' }
    ]
  },
  {
    key: 'account',
    title: '账户管理',
    description: '账户、主体、共享钱包、子端口与绑定记录。',
    modules: [
      { title: '账户列表', path: '/accountids/index', desc: '账户余额与状态。' },
      { title: '账户主体', path: '/accountSubject/index', desc: '主体档案与资质。' },
      { title: '共享钱包', path: '/advertiserWallet/advertiserWalletInfo/TabAdvertiserWalletInfoList', desc: '共享钱包开通与分配。' },
      { title: '子端口', path: '/channelManager/subPort', desc: '子端口管理。' },
      { title: '广告主ID复制', path: '/accountids/copy', desc: '广告主 ID 快速复制。' },
      { title: '账户绑定变动记录', path: '/accountids/accountChangeRecord', desc: '账户绑定变更留痕。' }
    ]
  },
  {
    key: 'material',
    title: '素材管理',
    description: '素材列表、裂变、风控与数据洞察。',
    modules: [
      { title: '数据洞察', path: '/materialManage/dataCheck', desc: '数据洞察与趋势。' },
      { title: '素材列表', path: '/materialManage/index', desc: '素材库与审核状态。' },
      { title: '素材裂变', path: '/materialManage/copy', desc: '批量裂变工具。' },
      { title: '素材风控', path: '/materialManage/douyinViolationScoreRecord', desc: '违规扣分与风险监控。' }
    ]
  },
  {
    key: 'channel',
    title: '渠道管理',
    description: '渠道资源、平台应用、卡号配置与代理商账户。',
    modules: [
      { title: '渠道列表', path: '/channelManager/ChannelList', desc: '渠道档案与合作管理。' },
      { title: '平台应用管理', path: '/channelManager/AppManager', desc: '平台应用接入与维护。' },
      { title: '竞价分类返点模板', path: '/channelManager/rebate', desc: '竞价分类维度的返点策略。' },
      { title: '卡号配置', path: '/moneyManager/TabBankAccountConfigList', desc: '收付款卡号集中配置。' },
      { title: '代理商账户', path: '/advertiserInfo/TabAdvertiserInfoList', desc: '代理商账户信息。' }
    ]
  },
  {
    key: 'financeReport',
    title: '财务报表',
    description: '成本导入、利润报表等财务核算视图。',
    modules: [
      { title: '成本导入', path: '/moneyManager/ExcelParser', desc: '批量导入成本数据。' },
      { title: '利润报表', path: '/moneyManager/BackmoneyList', desc: '利润统计与报表。' }
    ]
  },
  {
    key: 'rebate',
    title: '返点管理',
    description: '媒体返点、核算与违规明细。',
    modules: [
      { title: '返点管理', path: '/mediaRebate/index', desc: '媒体返点总览。' },
      { title: '巨量引擎 - 返点结算', path: '/mediaRebate/DY/fandian/index', desc: '巨量返点结算。' },
      { title: '巨量引擎 - 对账核算', path: '/mediaRebate/DY/duizhang/index', desc: '巨量对账与核算。' },
      { title: '巨量引擎 - 业绩明细', path: '/mediaRebate/DY/performanceDetail/index', desc: '业绩明细查询。' },
      { title: '巨量引擎 - 违规明细', path: '/mediaRebate/DY/violationDetail/index', desc: '违规明细追踪。' },
      { title: '巨量引擎 - 核算明细', path: '/mediaRebate/DY/calcDetail/index', desc: '核算明细查看。' },
      { title: '磁力引擎', path: '/CL/index', desc: '磁力引擎返点管理。' },
      { title: '腾讯广告', path: '/TX/index', desc: '腾讯广告返点管理。' }
    ]
  },
  {
    key: 'fund',
    title: '流水管理',
    description: '充退处理、账户流水与消耗明细。',
    modules: [
      { title: '充退处理列表', path: '/chongtui/index', desc: '充值、退款与审核。' },
      { title: '账户流水明细', path: '/fundTransferRecord/TabFundTransferRecordList', desc: '资金划拨及凭证。' },
      { title: '账户消耗明细', path: '/consume/index', desc: '投放消耗与对账。' }
    ]
  },
  {
    key: 'tools',
    title: '工具',
    description: '工具集、更新日志与消息通知。',
    modules: [
      { title: '邮件发送记录', path: '/system/email', desc: '邮件发送日志。' },
      { title: '更新日志', path: '/system/versionList', desc: '版本发布记录。' },
      { title: '消息管理', path: '/modules/message/sysMessageList', desc: '系统消息列表。' },
      { title: '消息模板', path: '/modules/message/sysMessageTemplateList', desc: '消息模板配置。' },
      { title: '我的消息', path: '/isps/userAnnouncement', desc: '个人消息通知。' }
    ]
  },
  {
    key: 'accountCenter',
    title: '个人中心',
    description: '个人中心与账户设置。',
    modules: [
      { title: '个人中心', path: '/account/center', desc: '个人信息与概览。' },
      { title: '基本设置', path: '/account/settings/BaseSetting', desc: '基础资料设置。' },
      { title: '账户绑定', path: '/account/settings/binding', desc: '账号绑定管理。' },
      { title: '个性化设置', path: '/account/settings/custom', desc: '个性化偏好。' },
      { title: '安全设置', path: '/account/settings/security', desc: '安全策略配置。' },
      { title: '新消息通知', path: '/account/settings/notification', desc: '消息提醒策略。' }
    ]
  }
]

export function buildWebUrl (path = DEFAULT_ROUTE) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${H5_BASE_URL}${cleanPath}`
}

export function buildAuthedWebUrl (path = DEFAULT_ROUTE) {
  const baseUrl = buildWebUrl(path)
  const token = getToken()
  const tenantId = getTenantId()
  if (!token) return baseUrl

  if (baseUrl.includes('#')) {
    const [prefix, hashPart] = baseUrl.split('#')
    const [hashPath, hashQuery = ''] = hashPart.split('?')
    const params = new URLSearchParams(hashQuery)
    params.set('token', token)
    if (tenantId !== undefined) params.set('tenant_id', tenantId)
    const queryString = params.toString()
    return `${prefix}#${hashPath}${queryString ? `?${queryString}` : ''}`
  }

  const url = new URL(baseUrl)
  url.searchParams.set('token', token)
  if (tenantId !== undefined) url.searchParams.set('tenant_id', tenantId)
  return url.toString()
}
