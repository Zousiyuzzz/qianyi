/**
 * 表单配置管理器
 * 新增表单类型时，只需在此配置即可
 * 
 * 重构说明：
 * - 移除了 submitDataParser，直接使用 model 作为提交数据
 * - model 中只存储提交给后端的数据（submitData）
 * - 展示数据通过 displayData 或计算属性管理
 */

import ProjectRefundForm from './ProjectRefundForm'
import ProjectTempCreditForm from './ProjectTempCreditForm'
import ContractForm from './ContractForm'

/**
 * 表单配置
 * @type {Object}
 * @property {string} businessType - 业务类型标识
 * @property {string} refName - 表单组件的 ref 名称
 * @property {Object} component - 表单组件
 * @property {Object} api - API 配置
 * @property {Function} previewDataGetter - 预览数据获取函数（可选）
 * @property {string} submitType - 提交方式：'json' | 'formData'
 */
export const formConfigs = {
    // 合同审批
    contract: {
        businessType: 'contranct',
        refName: 'contractForm',
        component: ContractForm,
        api: {
            add: '/contractInfo/add',
            edit: '/contractInfo/edit',
            queryById: '/contractInfo/queryById'
        },
        // 预览数据获取函数（可选，默认使用 model）
        previewDataGetter: function (context) {
            return context.model || {}
        },
        // 提交方式：formData（因为需要上传文件）
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
        // 预览数据获取函数（可选，默认使用 model）
        previewDataGetter: function (context) {
            return context.model || {}
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
        // 预览数据获取函数（可选，默认使用 model）
        previewDataGetter: function (context) {
            return context.model || {}
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

