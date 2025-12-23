import { getAction, deleteAction, putAction, postAction, httpAction, uploadAction } from './manage'

const UI_CACHE_DB_DICT_DATA = 'UI_CACHE_DB_DICT_DATA'

//角色管理
const addRole = (params) => postAction('/sys/role/add', params)
const editRole = (params) => putAction('/sys/role/edit', params)
const checkRoleCode = (params) => getAction('/sys/role/checkRoleCode', params)
const queryall = (params) => getAction('/sys/role/queryall', params)

//用户管理
const addUser = (params) => postAction('/sys/user/add', params)
const editUser = (params) => putAction('/sys/user/edit', params)
const queryUserRole = (params) => getAction('/sys/user/queryUserRole', params)
const getUserList = (params) => getAction('/sys/user/list', params)
const frozenBatch = (params) => putAction('/sys/user/frozenBatch', params)
const checkOnlyUser = (params) => getAction('/sys/user/checkOnlyUser', params)
const changePassword = (params) => putAction('/sys/user/changePassword', params)

//权限管理
const addPermission = (params) => postAction('/sys/permission/add', params)
const editPermission = (params) => putAction('/sys/permission/edit', params)
const getPermissionList = (params) => getAction('/sys/permission/list', params)
const getSystemMenuList = (params) => getAction('/sys/permission/getSystemMenuList', params)
const getSystemSubmenu = (params) => getAction('/sys/permission/getSystemSubmenu', params)
const getSystemSubmenuBatch = (params) => getAction('/sys/permission/getSystemSubmenuBatch', params)
const queryTreeList = (params) => getAction('/sys/permission/queryTreeList', params)
const queryTreeListForRole = (params) => getAction('/sys/role/queryTreeList', params)
const queryListAsync = (params) => getAction('/sys/permission/queryListAsync', params)
const queryRolePermission = (params) => getAction('/sys/permission/queryRolePermission', params)
const saveRolePermission = (params) => postAction('/sys/permission/saveRolePermission', params)
const queryPermissionsByUser = () => getAction('/sys/permission/getUserPermissionByToken')
const loadAllRoleIds = (params) => getAction('/sys/permission/loadAllRoleIds', params)
const getPermissionRuleList = (params) => getAction('/sys/permission/getPermRuleListByPermId', params)
const queryPermissionRule = (params) => getAction('/sys/permission/queryPermissionRule', params)

// 部门管理
const queryDepartTreeList = (params) => getAction('/sys/sysDepart/queryTreeList', params)
const queryDepartTreeSync = (params) => getAction('/sys/sysDepart/queryDepartTreeSync', params)
const queryIdTree = (params) => getAction('/sys/sysDepart/queryIdTree', params)
const queryParentName = (params) => getAction('/sys/sysDepart/queryParentName', params)
const searchByKeywords = (params) => getAction('/sys/sysDepart/searchBy', params)
const deleteByDepartId = (params) => deleteAction('/sys/sysDepart/delete', params)

//二级部门管理
const queryDepartPermission = (params) => getAction('/sys/permission/queryDepartPermission', params)
const saveDepartPermission = (params) => postAction('/sys/permission/saveDepartPermission', params)
const queryTreeListForDeptRole = (params) => getAction('/sys/sysDepartPermission/queryTreeListForDeptRole', params)
const queryDeptRolePermission = (params) => getAction('/sys/sysDepartPermission/queryDeptRolePermission', params)
const saveDeptRolePermission = (params) => postAction('/sys/sysDepartPermission/saveDeptRolePermission', params)
const queryMyDepartTreeList = (params) => getAction('/sys/sysDepart/queryMyDeptTreeList', params)

//日志管理
const deleteLog = (params) => deleteAction('/sys/log/delete', params)
const deleteLogList = (params) => deleteAction('/sys/log/deleteBatch', params)

//数据字典
const addDict = (params) => postAction('/sys/dict/add', params)
const editDict = (params) => putAction('/sys/dict/edit', params)
const treeList = (params) => getAction('/sys/dict/treeList', params)
const addDictItem = (params) => postAction('/sys/dictItem/add', params)
const editDictItem = (params) => putAction('/sys/dictItem/edit', params)

export const ajaxGetDictItems = (code, params) => getAction(`/sys/dict/getDictItems/${code}`, params)
function getDictItemsFromCache(dictCode) {
  const cache = uni.getStorageSync(UI_CACHE_DB_DICT_DATA)
  if (cache && cache[dictCode]) {
    return cache[dictCode]
  }
}

//系统通告
const doReleaseData = (params) => getAction('/sys/annountCement/doReleaseData', params)
const doReovkeData = (params) => getAction('/sys/annountCement/doReovkeData', params)
const getLoginfo = (params) => getAction('/sys/loginfo', params)
const getVisitInfo = (params) => getAction('/sys/visitInfo', params)

const queryUserByDepId = (params) => getAction('/sys/user/queryUserByDepId', params)
const duplicateCheck = (params) => getAction('/sys/duplicate/check', params)
const loadCategoryData = (params) => getAction('/sys/category/loadAllData', params)
const checkRuleByCode = (params) => getAction('/sys/checkRule/checkByCode', params)
const getUserNoticeInfo = (params) => getAction('/sys/sysAnnouncementSend/getMyAnnouncementSend', params)
const getTransitURL = url => `/sys/common/transitRESTful?url=${encodeURIComponent(url)}`
export const transitRESTful = {
  get: (url, parameter) => getAction(getTransitURL(url), parameter),
  post: (url, parameter) => postAction(getTransitURL(url), parameter),
  put: (url, parameter) => putAction(getTransitURL(url), parameter),
  http: (url, parameter) => httpAction(getTransitURL(url), parameter)
}

export const addServiceCost = (params) => postAction('/serviceCost/add', params)
const advertiserCopy = (params) => postAction('/advertiserCopy/copy', params)
const getAdvertiserCopyList = (params) => getAction('/advertiserCopy/list', params)
const getAdvertiserCopyResultList = (params) => getAction('/advertiserCopyResult/list', params)
const getSecondaryAgentInfoList = (params) => getAction('/secondaryAgentInfo/list', params)
const addSecondaryAgentInfo = (params) => postAction('/secondaryAgentInfo/add', params)
const editSecondaryAgentInfo = (params) => putAction('/secondaryAgentInfo/edit', params)
const deleteSecondaryAgentInfo = (params) => deleteAction('/secondaryAgentInfo/delete', params)
const deleteSecondaryAgentInfoBatch = (params) => deleteAction('/secondaryAgentInfo/deleteBatch', params)
const updateAdvertiserCapitalType = (params) => postAction('/advertiserInfo/updateCapitalType', params)
export const setCreditLimit = (params) => postAction('/projectFundPool/setCreditLimit', params)

const projectFundPool = {
  list: '/projectFundPool/list',
  delete: '/projectFundPool/delete',
  deleteBatch: '/projectFundPool/deleteBatch',
  exportXlsUrl: '/projectFundPool/exportXls',
  importExcelUrl: 'projectFundPool/importExcel',
  queryById: 'projectFundPool/queryById',
  balanceManagement: '/projectFundPool/balanceManagement'
}

export const parseCreditCommandFormData = (params) => {
  const formData = typeof FormData !== 'undefined' ? new FormData() : {}
  Object.keys(params).forEach(key => {
    if (typeof formData.append === 'function') {
      formData.append(key, params[key])
    } else {
      formData[key] = params[key]
    }
  })
  return uploadAction('/instructionParsing/parseCreditCommand', formData)
}

export const getFundTransferRecordList = (params) => getAction('/fundTransferRecord/list', params)

const douyinRebateAccountingFlow = {
  list: '/douyinRebateAccountingFlow/list',
  exportXlsUrl: '/douyinRebateAccountingFlow/exportXls',
  superFieldList: '/douyinRebateAccountingFlow/superFieldList'
}

const content = {
  create: (params) => postAction('/api/contents', params),
  list: (params) => getAction('/api/contents', params),
  queryById: (id) => getAction(`/api/contents/${id}`),
  edit: (id, params) => putAction(`/api/contents/${id}`, params),
  delete: (id) => deleteAction(`/api/contents/${id}`),
  deleteBatch: (params) => deleteAction('/api/contents/batch', params),
  exportXls: (params) => getAction('/api/contents/export', params),
  importExcel: (params) => postAction('/api/contents/import', params)
}

export {
  addRole,
  editRole,
  checkRoleCode,
  addUser,
  editUser,
  queryUserRole,
  getUserList,
  queryall,
  frozenBatch,
  checkOnlyUser,
  changePassword,
  getPermissionList,
  addPermission,
  editPermission,
  queryTreeList,
  queryRolePermission,
  saveRolePermission,
  queryListAsync,
  queryTreeListForRole,
  queryPermissionRule,
  getSystemMenuList,
  getSystemSubmenu,
  getSystemSubmenuBatch,
  loadAllRoleIds,
  getPermissionRuleList,
  queryPermissionsByUser,
  queryDepartTreeList,
  queryDepartTreeSync,
  queryIdTree,
  queryParentName,
  searchByKeywords,
  deleteByDepartId,
  deleteLog,
  deleteLogList,
  addDict,
  editDict,
  treeList,
  addDictItem,
  editDictItem,
  doReleaseData,
  doReovkeData,
  getLoginfo,
  getVisitInfo,
  queryUserByDepId,
  duplicateCheck,
  getDictItemsFromCache,
  loadCategoryData,
  checkRuleByCode,
  getUserNoticeInfo,
  queryDepartPermission,
  saveDepartPermission,
  queryTreeListForDeptRole,
  queryDeptRolePermission,
  saveDeptRolePermission,
  queryMyDepartTreeList,
  advertiserCopy,
  getAdvertiserCopyList,
  getAdvertiserCopyResultList,
  getSecondaryAgentInfoList,
  addSecondaryAgentInfo,
  editSecondaryAgentInfo,
  deleteSecondaryAgentInfo,
  deleteSecondaryAgentInfoBatch,
  updateAdvertiserCapitalType,
  projectFundPool,
  douyinRebateAccountingFlow,
  content
}
