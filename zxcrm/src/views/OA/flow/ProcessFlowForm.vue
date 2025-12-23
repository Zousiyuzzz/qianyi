<template>
  <div class="process-flow-form">
    <a-spin :spinning="loading || parsingProcess">
      <!-- 表单编辑区域 -->
      <div class="form-section">
        <!-- 动态加载表单组件 -->
        <component v-if="formComponent" :is="formComponent" :ref="formConfig.refName" v-model="model"
          :disabled="disabled" />
        <slot v-else name="form-edit" :model="model" :form-config="formConfig">
          <!-- 表单编辑内容由父组件传入 -->
        </slot>
      </div>

      <div class="form-footer">
        <slot name="footer">
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="handlePreview" :loading="parsingProcess">确定</a-button>
        </slot>
      </div>
    </a-spin>
  </div>
</template>

<script>
import ProcessFlow from './ProcessFlow.vue'
import { DataLoader } from './DataLoader'
import { ProcessParser } from './ProcessParser'
import { getFormConfig } from '../form/formConfig'

export default {
  name: 'ProcessFlowForm',
  components: {
    ProcessFlow
  },
  props: {
    businessType: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // 从预览模式返回时的表单数据
    initialFormData: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    businessType: {
      immediate: false,
      handler(newVal, oldVal) {
        // 只有当新值存在且与旧值不同时才重新初始化
        if (newVal && newVal !== oldVal && newVal.trim && newVal.trim() !== '') {
          // 业务类型变化时，重新初始化表单
          console.log('业务类型变化，重新初始化表单:', newVal, '旧值:', oldVal)
          this.init()
        } else if (!newVal || (newVal.trim && newVal.trim() === '')) {
          // 如果 businessType 被清空，重置表单组件
          console.log('businessType 被清空，重置表单组件')
          this.formComponent = null
          this.formConfig = null
          this.model = {}
        }
      }
    },
    initialFormData: {
      immediate: false,
      deep: true,
      handler(newVal, oldVal) {
        // 只有当有新数据且表单组件已加载时才更新
        if (newVal && Object.keys(newVal).length > 0 && this.formComponent) {
          console.log('initialFormData 变化，更新表单数据:', newVal)
          // 使用 $set 更新 model，避免直接修改
          Object.keys(newVal).forEach(key => {
            this.$set(this.model, key, newVal[key])
          })
          // 同步到表单组件（通过 v-model）
          this.$nextTick(() => {
            if (this.formConfig && this.formConfig.refName) {
              const formRef = this.$refs[this.formConfig.refName]
              if (formRef) {
                console.log('同步数据到表单组件:', formRef)
                // 直接设置表单组件的 value 或 model
                if (formRef.value !== undefined) {
                  this.$set(formRef, 'value', { ...newVal })
                } else if (formRef.model !== undefined) {
                  this.$set(formRef, 'model', { ...newVal })
                } else if (formRef.$emit) {
                  // 通过 emit input 事件更新
                  formRef.$emit('input', { ...newVal })
                }
              } else {
                console.warn('表单引用不存在，无法同步数据')
              }
            }
          })
        }
      }
    }
  },
  data() {
    return {
      model: {},
      formConfig: null,
      formComponent: null,
      processConfig: null,
      parsedNodes: [],
      userMap: {},
      deptMap: {},
      roleMap: {},
      parsingProcess: false,
      dataLoader: null,
      processParser: null
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      // 如果 businessType 为空，直接返回，不执行初始化
      if (!this.businessType || this.businessType.trim() === '') {
        console.log('businessType 为空，跳过初始化')
        return
      }

      // 重置表单组件，确保切换时能正确加载
      this.formComponent = null
      this.formConfig = null

      // 等待下一个 tick，确保组件完全卸载
      await this.$nextTick()

      // 获取表单配置
      this.formConfig = getFormConfig(this.businessType)
      console.log('表单配置:', this.formConfig, '业务类型:', this.businessType)
      if (this.formConfig && this.formConfig.component) {
        this.formComponent = this.formConfig.component
        console.log('表单组件已加载:', this.formComponent)
      } else {
        console.error('未找到表单组件，formConfig:', this.formConfig)
        // 不显示错误提示，因为可能是关闭抽屉时触发的
        return
      }

      // 如果 initialFormData 有值，使用它初始化 model，否则重置
      if (this.initialFormData && Object.keys(this.initialFormData).length > 0) {
        console.log('使用 initialFormData 初始化 model:', this.initialFormData)
        this.model = { ...this.initialFormData }
      } else {
        // 重置 model
        this.model = {}
      }

      // 初始化数据加载器和流程解析器
      this.dataLoader = new DataLoader(this)
      this.processParser = new ProcessParser(this, this.dataLoader)

      // 加载流程配置
      await this.loadProcessConfig()

      // 等待表单组件渲染后同步数据
      await this.$nextTick()
      if (this.model && Object.keys(this.model).length > 0) {
        this.syncDataToFormComponent()
      }
    },
    // 同步数据到表单组件
    syncDataToFormComponent() {
      if (this.formConfig && this.formConfig.refName) {
        const formRef = this.$refs[this.formConfig.refName]
        if (formRef && this.model && Object.keys(this.model).length > 0) {
          console.log('同步数据到表单组件:', formRef, '数据:', this.model)
          // 直接设置表单组件的 value 或 model
          if (formRef.value !== undefined) {
            this.$set(formRef, 'value', { ...this.model })
          } else if (formRef.model !== undefined) {
            this.$set(formRef, 'model', { ...this.model })
          } else if (formRef.$emit) {
            // 通过 emit input 事件更新
            formRef.$emit('input', { ...this.model })
          }
        }
      }
    },
    async loadProcessConfig() {
      if (!this.businessType) return

      try {
        this.parsingProcess = true
        await this.dataLoader.loadUserAndDeptData()
        await this.processParser.loadProcessConfig(this.businessType)
        await this.dataLoader.loadAssigneeNames(this.processParser.parsedNodes)

        this.processConfig = this.processParser.processConfig
        this.parsedNodes = this.processParser.parsedNodes
        this.userMap = this.dataLoader.userMap
      } catch (error) {
        console.error('加载流程配置失败:', error)
        this.$message.error('加载流程配置失败')
      } finally {
        this.parsingProcess = false
      }
    },
    handleCancel() {
      this.$emit('cancel')
    },
    async handlePreview() {
      // 验证表单
      if (!this.formConfig) {
        this.$message.error('未找到表单配置')
        return
      }

      const formRef = this.$refs[this.formConfig.refName]
      console.log('表单引用:', formRef, 'refName:', this.formConfig.refName, '所有refs:', Object.keys(this.$refs))
      if (!formRef) {
        this.$message.error('表单引用不存在，请检查表单是否正确加载')
        console.error('表单引用不存在，refName:', this.formConfig.refName, '所有refs:', Object.keys(this.$refs))
        return
      }

      try {
        // 根据表单类型进行验证
        let valid = false
        console.log('开始验证表单，formRef.validate 类型:', typeof formRef.validate)

        if (typeof formRef.validate === 'function') {
          // 先调用 validate 方法，检查返回值类型
          const validateResult = formRef.validate()
          console.log('validate 返回值:', validateResult, '类型:', typeof validateResult, '是否有 then:', validateResult && typeof validateResult.then === 'function')

          if (validateResult && typeof validateResult.then === 'function') {
            // Promise 式验证（如 ProjectRefundForm, ProjectTempCreditForm）
            console.log('使用 Promise 式验证')
            try {
              await validateResult
              valid = true
              console.log('表单验证通过（Promise 式）')
            } catch (error) {
              // 验证失败
              valid = false
              console.error('表单验证失败（Promise 式）:', error)
              this.$message.warning(error.message || '请检查表单必填项')
              return
            }
          } else {
            // 回调式验证（如合同表单）
            console.log('使用回调式验证')
            valid = await new Promise((resolve) => {
              formRef.validate((isValid) => {
                console.log('回调式验证结果:', isValid)
                resolve(isValid)
              })
            })
            console.log('表单验证结果（回调式）:', valid)
          }
        } else {
          // 如果没有验证方法，直接通过
          valid = true
          console.log('表单没有验证方法，直接通过')
        }

        if (!valid) {
          this.$message.warning('请检查表单必填项')
          return
        }

        console.log('表单验证通过，继续处理...')

        // 获取提交数据（优先使用表单组件的 getSubmitData 方法）
        let submitData = {}
        if (formRef.getSubmitData && typeof formRef.getSubmitData === 'function') {
          submitData = formRef.getSubmitData()
        } else if (formRef.submitData) {
          // 如果表单组件有 submitData 属性（如 ContractForm）
          submitData = { ...formRef.submitData }
          // 确保 proId 和 proIdArray 都存在（用于条件判断）
          if (formRef.proIdArray && Array.isArray(formRef.proIdArray) && formRef.proIdArray.length > 0) {
            submitData.proId = formRef.proIdArray.join(',')
            submitData.proIdArray = formRef.proIdArray
          } else if (submitData.proId && !submitData.proIdArray) {
            // 如果只有 proId，转换为 proIdArray
            submitData.proIdArray = String(submitData.proId).split(',').filter(id => id.trim())
          }
        } else if (formRef.model) {
          // 如果表单组件有 model 属性（如 ProjectRefundForm）
          submitData = { ...formRef.model }
        } else {
          // 最后使用 this.model
          submitData = { ...this.model } || {}
        }

        // 确保有业务类型
        if (!submitData.businessType) {
          submitData.businessType = this.businessType
        }

        console.log('预览时的表单数据:', submitData)

        // 重新解析流程（使用表单数据用于条件判断）
        this.parsingProcess = true
        try {
          // 重新加载流程配置（会根据表单数据判断条件分支）
          await this.processParser.loadProcessConfig(this.businessType)
          // 保存原始的 parsedNodes（包含 node_id，用于 ProcessPreview 的排序）
          const originalParsedNodes = [...this.processParser.parsedNodes]
          // 根据表单数据排序节点（过滤条件节点，用于提交）
          const sortedNodes = await this.processParser.parseNodesToUserIds(submitData)

          // 更新解析后的节点（用于预览显示，使用原始的 parsedNodes，包含 node_id）
          this.parsedNodes = originalParsedNodes
          // 加载审批人名称（使用原始的 parsedNodes，因为它们包含 assignee_type 信息）
          await this.dataLoader.loadAssigneeNames(originalParsedNodes)
          this.userMap = this.dataLoader.userMap
          this.deptMap = this.dataLoader.deptMap
          this.roleMap = this.dataLoader.roleMap
        } catch (error) {
          console.error('重新解析流程失败:', error)
          // 如果重新解析失败，使用之前的 parsedNodes
        } finally {
          this.parsingProcess = false
        }

        // 触发 preview 事件
        this.$emit('preview', {
          model: submitData,
          formConfig: this.formConfig,
          processConfig: this.processConfig,
          parsedNodes: this.parsedNodes, // 传递原始的 parsedNodes（包含 node_id）
          userMap: this.userMap,
          deptMap: this.deptMap,
          roleMap: this.roleMap
        })
      } catch (error) {
        console.error('表单验证失败:', error)
        this.$message.error('表单验证失败：' + (error.message || '未知错误'))
      }
    }
  }
}
</script>

<style scoped lang="less">
.process-flow-form {
  .form-section {
    margin-bottom: 24px;
  }

  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
