/**
 * 表单配置管理器
 * 新增表单类型时，只需在此配置即可
 */

import ProjectRefundForm from '../../form/ProjectRefundForm'
import ProjectTempCreditForm from '../../form/ProjectTempCreditForm'

/**
 * 表单配置
 * @type {Object}
 * @property {string} businessType - 业务类型标识
 * @property {string} refName - 表单组件的 ref 名称
 * @property {Object} component - 表单组件
 * @property {Object} api - API 配置
 * @property {Function} submitDataParser - 提交数据解析函数
 * @property {Function} previewDataGetter - 预览数据获取函数
 */
export const formConfigs = {
  // 合同审批
  contract: {
    businessType: 'contranct',
    refName: 'form',
    component: null, // 合同审批表单直接在 ApprovalForm 中，不需要组件
    api: {
      add: '/contractInfo/add',
      edit: '/contractInfo/edit',
      queryById: '/contractInfo/queryById'
    },
    // 提交数据解析函数
    submitDataParser: async function (formRef, context) {
      // 合同审批表单使用回调式验证
      const submitData = await new Promise((resolve, reject) => {
        formRef.validate((valid) => {
          if (valid) {
            const data = Object.assign({}, context.model)

            // 处理项目ID（合同审批是多选）
            if (data.proIdArray && Array.isArray(data.proIdArray) && data.proIdArray.length > 0) {
              // 确保 proId 被正确设置（即使找不到项目名称也要设置）
              data.proId = data.proIdArray.join(',')

              // 尝试从 projectOptions 或 projectCache 中获取项目名称
              const proNames = data.proIdArray.map(id => {
                // 先从 projectOptions 中查找
                let project = context.projectOptions && context.projectOptions.find(item => String(item.id) === String(id))
                // 如果找不到，尝试从 projectCache 中查找
                if (!project && context.projectCache) {
                  project = context.projectCache[String(id)]
                }
                return project ? project.proName : ''
              }).filter(name => name)

              // 如果找到了项目名称，使用它们；否则使用空字符串（但不影响 proId 的设置）
              data.proName = proNames.length > 0 ? proNames.join(',') : ''
            } else {
              data.proId = ''
              data.proName = ''
            }
            // 删除临时数组字段
            delete data.proIdArray

            resolve(data)
          } else {
            reject(new Error('表单验证失败'))
          }
        })
      })
      return submitData
    },
    // 预览数据获取函数
    previewDataGetter: function (context) {
      return context.model
    },
    // 提交方式：formData
    submitType: 'formData'
  },

  // 项目退款审批
  projectRefund: {
    businessType: 'projectRefund',
    refName: 'projectRefundForm',
    component: ProjectRefundForm,
    api: {
      add: '/projectRefundRecord/refundRequest',
      edit: '/projectRefundRecord/edit',
      queryById: '/projectRefundRecord/queryById'
    },
    submitDataParser: async function (formRef, context) {
      // 项目退款表单使用 Promise 式验证
      const submitData = await formRef.validate()
      // 构建项目退款请求数据，只包含API需要的字段
      // 根据API文档，只需要：bankAccountId, fundsNature, proId, refundAmount, remarks
      // approvalData 会在 buildSubmitData 中自动添加
      return {
        bankAccountId: submitData.customerTitleId || submitData.bankAccountId || '', // 使用 bankAccountId
        fundsNature: submitData.fundsNature || '',
        proId: submitData.proId || '',
        refundAmount: submitData.refundAmount || 0,
        remarks: submitData.remarks || ''
      }
    },
    previewDataGetter: function (context) {
      return context.model
    },
    // 提交方式：json
    submitType: 'json'
  },

  // 临时授信审批
  projectTempCredit: {
    businessType: 'projectTempCredit',
    refName: 'projectTempCreditForm',
    component: ProjectTempCreditForm,
    api: {
      add: '/projectTempCredit/add',
      edit: '/projectTempCredit/edit',
      queryById: '/projectTempCredit/queryById'
    },
    submitDataParser: async function (formRef, context) {
      // 临时授信表单使用 Promise 式验证（已改为单选，直接使用 proId）
      const submitData = await formRef.validate()
      // 构建临时授信请求数据，使用驼峰命名
      return {
        proId: submitData.proId || '',
        tempAmount: submitData.tempAmount || 0,
        startDate: submitData.startDate || '',
        endDate: submitData.endDate || '',
        remark: submitData.remark || '',
        id: submitData.id || null // 保留 id 字段用于判断新增/编辑
      }
    },
    previewDataGetter: function (context) {
      return context.model
    },
    // 提交方式：json
    submitType: 'json'
  }
}

/**
 * 根据业务类型获取表单配置
 * @param {string} businessType - 业务类型
 * @returns {Object|null} 表单配置
 */
export function getFormConfig(businessType) {
  if (!businessType) return null

  // 兼容多种业务类型标识
  const normalizedType = businessType.toLowerCase()

  // 查找匹配的配置
  for (const [key, config] of Object.entries(formConfigs)) {
    if (config.businessType === normalizedType ||
      config.businessType === businessType ||
      key === normalizedType) {
      return config
    }
  }

  // 特殊处理：contract 和 contranct 都指向合同审批
  if (normalizedType === 'contract' || normalizedType === 'contranct' || normalizedType === '1') {
    return formConfigs.contract
  }

  return null
}

/**
 * 获取所有表单配置
 * @returns {Object} 所有表单配置
 */
export function getAllFormConfigs() {
  return formConfigs
}

/**
 * 注册新的表单类型
 * @param {string} key - 配置键名
 * @param {Object} config - 表单配置
 */
export function registerFormConfig(key, config) {
  formConfigs[key] = config
}

