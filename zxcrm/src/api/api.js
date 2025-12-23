import { getAction, deleteAction, putAction, postAction, httpAction, uploadAction } from '@/api/manage'
import Vue from 'vue'
import { UI_CACHE_DB_DICT_DATA } from "@/store/mutation-types"

//角色管理
const addRole = (params) => postAction("/sys/role/add", params);
const editRole = (params) => putAction("/sys/role/edit", params);
const checkRoleCode = (params) => getAction("/sys/role/checkRoleCode", params);
const queryall = (params) => getAction("/sys/role/queryall", params);

//用户管理
const addUser = (params) => postAction("/sys/user/add", params);
const editUser = (params) => putAction("/sys/user/edit", params);
const queryUserRole = (params) => getAction("/sys/user/queryUserRole", params);
const getUserList = (params) => getAction("/sys/user/list", params);
const frozenBatch = (params) => putAction("/sys/user/frozenBatch", params);
//验证用户是否存在
const checkOnlyUser = (params) => getAction("/sys/user/checkOnlyUser", params);
//改变密码
const changePassword = (params) => putAction("/sys/user/changePassword", params);

//权限管理
const addPermission = (params) => postAction("/sys/permission/add", params);
const editPermission = (params) => putAction("/sys/permission/edit", params);
const getPermissionList = (params) => getAction("/sys/permission/list", params);
const getSystemMenuList = (params) => getAction("/sys/permission/getSystemMenuList", params);
const getSystemSubmenu = (params) => getAction("/sys/permission/getSystemSubmenu", params);
const getSystemSubmenuBatch = (params) => getAction('/sys/permission/getSystemSubmenuBatch', params)
const queryTreeList = (params) => getAction("/sys/permission/queryTreeList", params);
const queryTreeListForRole = (params) => getAction("/sys/role/queryTreeList", params);
const queryListAsync = (params) => getAction("/sys/permission/queryListAsync", params);
const queryRolePermission = (params) => getAction("/sys/permission/queryRolePermission", params);
const saveRolePermission = (params) => postAction("/sys/permission/saveRolePermission", params);
const queryPermissionsByUser = () => getAction("/sys/permission/getUserPermissionByToken");
const loadAllRoleIds = (params) => getAction("/sys/permission/loadAllRoleIds", params);
const getPermissionRuleList = (params) => getAction("/sys/permission/getPermRuleListByPermId", params);
const queryPermissionRule = (params) => getAction("/sys/permission/queryPermissionRule", params);

// 部门管理
const queryDepartTreeList = (params) => getAction("/sys/sysDepart/queryTreeList", params);
const queryDepartTreeSync = (params) => getAction("/sys/sysDepart/queryDepartTreeSync", params);
const queryIdTree = (params) => getAction("/sys/sysDepart/queryIdTree", params);
const queryParentName = (params) => getAction("/sys/sysDepart/queryParentName", params);
const searchByKeywords = (params) => getAction("/sys/sysDepart/searchBy", params);
const deleteByDepartId = (params) => deleteAction("/sys/sysDepart/delete", params);

// 审批流程配置
const getApprovalProcessConfigList = (params) => getAction("/approvalProcessConfig/list", params);
const getApprovalProcessConfigById = (params) => getAction("/approvalProcessConfig/queryById", params);
const addApprovalProcessConfig = (params) => postAction("/approvalProcessConfig/add", params);
const editApprovalProcessConfig = (params) => putAction("/approvalProcessConfig/edit", params);
const deleteApprovalProcessConfig = (params) => deleteAction("/approvalProcessConfig/delete", params);
const getApprovalProcessConfigByBusinessType = (params) => getAction("/approvalProcessConfig/queryByBusinessType", params);

// 审批列表
const getApprovalList = (params) => getAction("/approval/list", params);
// 查询我待处理的流程
const queryMyPendingProcesses = (params) => getAction("/approvalTask/queryMyPendingProcesses", params);
// 查询我已处理的流程
const queryMyProcessedProcesses = (params) => getAction("/approvalTask/queryMyProcessedProcesses", params);
// 查询我发起的流程
const queryMyApproval = (params) => getAction("/approval/queryMyApproval", params);
// 查询抄送我的流程
const queryProcessesCcToMe = (params) => getAction("/approvalTask/queryProcessesCcToMe", params);
const getApprovalDetail = (params) => getAction("/approval/queryById", params);
const approvalAgree = (params) => postAction("/approval/approvalAgree", params);
const approvalRefuse = (params) => postAction("/approval/approvalRefuse", params);
const withdrawApproval = (params) => postAction("/approval/withdrawApproval", params);
// 业务表单详情接口
const getContractInfoById = (params) => getAction("/contractInfo/queryById", params);
// 审批节点人员配置 - 根据审批主表Id查询数据
const getApprovalNodePersonConfigByApprovalId = (params) => getAction("/approvalNodePersonConfig/queryByApprovalId", params);

// 用户列表（不分页，包含部门和角色信息）
const getUserListNotPage = (params) => getAction("/sys/user/getUserListNoPage", params);

// 角色列表（不分页）
const getRoleListNotPage = (params) => getAction("/sys/role/listNotPage", params);

//二级部门管理
const queryDepartPermission = (params) => getAction("/sys/permission/queryDepartPermission", params);
const saveDepartPermission = (params) => postAction("/sys/permission/saveDepartPermission", params);
const queryTreeListForDeptRole = (params) => getAction("/sys/sysDepartPermission/queryTreeListForDeptRole", params);
const queryDeptRolePermission = (params) => getAction("/sys/sysDepartPermission/queryDeptRolePermission", params);
const saveDeptRolePermission = (params) => postAction("/sys/sysDepartPermission/saveDeptRolePermission", params);
const queryMyDepartTreeList = (params) => getAction("/sys/sysDepart/queryMyDeptTreeList", params);

//日志管理
const deleteLog = (params) => deleteAction("/sys/log/delete", params);
const deleteLogList = (params) => deleteAction("/sys/log/deleteBatch", params);

//数据字典
const addDict = (params) => postAction("/sys/dict/add", params);
const editDict = (params) => putAction("/sys/dict/edit", params);
const treeList = (params) => getAction("/sys/dict/treeList", params);
const addDictItem = (params) => postAction("/sys/dictItem/add", params);
const editDictItem = (params) => putAction("/sys/dictItem/edit", params);

//字典标签专用（通过code获取字典数组）
export const ajaxGetDictItems = (code, params) => getAction(`/sys/dict/getDictItems/${code}`, params);
//从缓存中获取字典配置
function getDictItemsFromCache(dictCode) {
  if (Vue.ls.get(UI_CACHE_DB_DICT_DATA) && Vue.ls.get(UI_CACHE_DB_DICT_DATA)[dictCode]) {
    let dictItems = Vue.ls.get(UI_CACHE_DB_DICT_DATA)[dictCode];
    return dictItems;
  }
}

//系统通告
const doReleaseData = (params) => getAction("/sys/annountCement/doReleaseData", params);
const doReovkeData = (params) => getAction("/sys/annountCement/doReovkeData", params);
//获取系统访问量
const getLoginfo = (params) => getAction("/sys/loginfo", params);
const getVisitInfo = (params) => getAction("/sys/visitInfo", params);

// 根据部门主键查询用户信息
const queryUserByDepId = (params) => getAction("/sys/user/queryUserByDepId", params);

// 重复校验
const duplicateCheck = (params) => getAction("/sys/duplicate/check", params);
// 加载分类字典
const loadCategoryData = (params) => getAction("/sys/category/loadAllData", params);
const checkRuleByCode = (params) => getAction('/sys/checkRule/checkByCode', params)
//加载我的通告信息
const getUserNoticeInfo = (params) => getAction("/sys/sysAnnouncementSend/getMyAnnouncementSend", params);
const getTransitURL = url => `/sys/common/transitRESTful?url=${encodeURIComponent(url)}`
// 中转HTTP请求
export const transitRESTful = {
  get: (url, parameter) => getAction(getTransitURL(url), parameter),
  post: (url, parameter) => postAction(getTransitURL(url), parameter),
  put: (url, parameter) => putAction(getTransitURL(url), parameter),
  http: (url, parameter) => httpAction(getTransitURL(url), parameter),
}

export const addServiceCost = (params) => postAction("/serviceCost/add", params);

// 新增广告主复制接口
const advertiserCopy = (params) => postAction("/advertiserCopy/copy", params);

// 新增广告主分页列表查询接口
const getAdvertiserCopyList = (params) => getAction("/advertiserCopy/list", params);

// 新增广告主复制结果分页列表查询接口
const getAdvertiserCopyResultList = (params) => getAction("/advertiserCopyResult/list", params);

// 二级代理商信息列表查询接口
const getSecondaryAgentInfoList = (params) => getAction("/secondaryAgentInfo/list", params);

// 二级代理商信息新增接口
const addSecondaryAgentInfo = (params) => postAction("/secondaryAgentInfo/add", params);

// 二级代理商信息编辑接口
const editSecondaryAgentInfo = (params) => putAction("/secondaryAgentInfo/edit", params);

// 二级代理商信息删除接口
const deleteSecondaryAgentInfo = (params) => deleteAction("/secondaryAgentInfo/delete", params);

// 二级代理商信息批量删除接口
const deleteSecondaryAgentInfoBatch = (params) => deleteAction("/secondaryAgentInfo/deleteBatch", params);

// 广告主信息 - 更新资金类型
const updateAdvertiserCapitalType = (params) => postAction("/advertiserInfo/updateCapitalType", params);

// 客户资金池 - 设置授信额度
export const setCreditLimit = (params) => postAction('/projectFundPool/setCreditLimit', params);

const projectFundPool = {
  list: '/projectFundPool/list',
  delete: '/projectFundPool/delete',
  deleteBatch: '/projectFundPool/deleteBatch',
  exportXlsUrl: '/projectFundPool/exportXls',
  importExcelUrl: 'projectFundPool/importExcel',
  queryById: 'projectFundPool/queryById',
  balanceManagement: '/projectFundPool/balanceManagement'
}

// 解析授信指令（form-data）
export const parseCreditCommandFormData = (params) => {
  const formData = new FormData();
  Object.keys(params).forEach(key => {
    formData.append(key, params[key]);
  });
  return uploadAction('/instructionParsing/parseCreditCommand', formData);
};

// 资金转账记录列表
export const getFundTransferRecordList = (params) => {
  return getAction('/fundTransferRecord/list', params);
};

// 抖音返点核算流水相关接口
const douyinRebateAccountingFlow = {
  list: '/douyinRebateAccountingFlow/list',
  exportXlsUrl: '/douyinRebateAccountingFlow/exportXls',
  superFieldList: '/douyinRebateAccountingFlow/superFieldList'
}

// Content 相关接口（根据 Swagger 文档：/api/contents）
const content = {
  // 创建内容 POST /api/contents
  create: (params) => postAction('/api/contents', params),
  // 分页列表查询 GET /api/contents
  list: (params) => getAction('/api/contents', params),
  // 根据ID查询 GET /api/contents/{id}
  queryById: (id) => getAction(`/api/contents/${id}`),
  // 编辑 PUT /api/contents/{id}
  edit: (id, params) => putAction(`/api/contents/${id}`, params),
  // 删除 DELETE /api/contents/{id}
  delete: (id) => deleteAction(`/api/contents/${id}`),
  // 批量删除（如果支持）
  deleteBatch: (params) => deleteAction('/api/contents/batch', params),
  // 导出Excel（如果支持）
  exportXls: (params) => getAction('/api/contents/export', params),
  // 导入Excel（如果支持）
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
  queryListAsync,
  queryRolePermission,
  saveRolePermission,
  queryPermissionsByUser,
  loadAllRoleIds,
  getPermissionRuleList,
  queryPermissionRule,
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
  queryTreeListForRole,
  getSystemMenuList,
  getSystemSubmenu,
  getSystemSubmenuBatch,
  loadCategoryData,
  checkRuleByCode,
  queryDepartPermission,
  saveDepartPermission,
  queryTreeListForDeptRole,
  queryDeptRolePermission,
  saveDeptRolePermission,
  queryMyDepartTreeList,
  getUserNoticeInfo,
  getDictItemsFromCache,
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
  content,
  getApprovalProcessConfigList,
  getApprovalProcessConfigById,
  addApprovalProcessConfig,
  editApprovalProcessConfig,
  deleteApprovalProcessConfig,
  getApprovalProcessConfigByBusinessType,
  getApprovalList,
  queryMyPendingProcesses,
  queryMyProcessedProcesses,
  queryMyApproval,
  queryProcessesCcToMe,
  getApprovalDetail,
  approvalAgree,
  approvalRefuse,
  withdrawApproval,
  getContractInfoById,
  getApprovalNodePersonConfigByApprovalId,
  getUserListNotPage,
  getRoleListNotPage
}



