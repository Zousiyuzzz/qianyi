/**
 * 数据解析模块
 * 负责解析和转换表单提交数据
 */

import { getFormConfig } from '../../../form/formConfig'

/**
 * 数据解析器类
 */
export class DataParser {
  constructor(context) {
    this.context = context
  }

  /**
   * 获取表单数据（通过 validate）
   */
  async getFormData(businessType) {
    const formConfig = getFormConfig(businessType)
    if (!formConfig) {
      throw new Error(`未找到业务类型 ${businessType} 的表单配置`)
    }

    // 获取表单引用
    const formRef = this.context.$refs[formConfig.refName]
    if (!formRef) {
      throw new Error(`表单引用 ${formConfig.refName} 不存在`)
    }

    // 使用配置的解析函数获取数据
    try {
      const submitData = await formConfig.submitDataParser(formRef, this.context)
      return submitData
    } catch (error) {
      console.error(`表单 ${businessType} 验证失败:`, error)
      throw error
    }
  }

  /**
   * 构建提交数据（包含审批流程数据）
   */
  async buildSubmitData(submitData, processConfig, parsedNodes, processParser) {
    // 如果没有流程配置，直接返回表单数据（submitData 应该已经通过 submitDataParser 过滤过了）
    if (!processConfig) {
      return submitData
    }

    // 解析节点为用户ID
    const nodesForSubmit = await processParser.parseNodesToUserIds(submitData)

    // 合并审批流程数据
    // 注意：submitData 应该已经通过 submitDataParser 过滤，只包含需要的字段
    const result = {
      ...submitData,
      approvalData: {
        businessType: processConfig.businessType,
        processName: processConfig.processName,
        nodes: JSON.stringify(nodesForSubmit)
      }
    }

    // 调试：打印最终提交的数据
    console.log('最终提交的数据 (buildSubmitData):', result)

    return result
  }

  /**
   * 构建合同审批的 FormData
   */
  buildFormData(submitData, processConfig, parsedNodes, processParser, fileList) {
    const formData = new FormData()

    // 添加流程相关字段
    if (processConfig) {
      formData.append('approvalData.businessType', processConfig.businessType)
      formData.append('approvalData.processName', processConfig.processName)

      // 解析节点（这里需要同步处理，所以先返回 Promise，在实际提交时再解析）
      // 注意：FormData 的构建需要同步，所以节点解析会在外部完成
      // 这里只处理表单数据部分
    }

    // 添加表单数据
    Object.keys(submitData).forEach(key => {
      if (submitData[key] !== null && submitData[key] !== undefined) {
        formData.append(key, submitData[key])
      }
    })

    // 添加文件
    if (fileList && fileList.length > 0) {
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('files', file.originFileObj)
        } else if (file instanceof File) {
          formData.append('files', file)
        } else if (file.url || file.response) {
          const fileUrl = file.url || (file.response && file.response.url)
          if (fileUrl) {
            formData.append('fileUrls', fileUrl)
          }
        }
      })
    }

    return formData
  }

  /**
   * 添加流程节点到 FormData
   */
  async addProcessNodesToFormData(formData, processConfig, parsedNodes, processParser, submitData) {
    if (!processConfig) return

    // 解析节点为用户ID
    const nodesForSubmit = await processParser.parseNodesToUserIds(submitData)
    formData.append('approvalData.nodes', JSON.stringify(nodesForSubmit))
  }

  /**
   * 获取预览数据
   */
  getPreviewData(businessType) {
    const formConfig = getFormConfig(businessType)
    if (!formConfig) {
      return this.context.model
    }

    // 使用配置的预览数据获取函数
    if (formConfig.previewDataGetter) {
      return formConfig.previewDataGetter(this.context)
    }

    return this.context.model
  }
}

