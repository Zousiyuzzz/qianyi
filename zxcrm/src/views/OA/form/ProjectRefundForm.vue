<template>
  <div class="project-refund-form">
    <a-form-model ref="form" :model="model" :rules="validatorRules">
      <a-row>
        <!-- 项目相关 -->
        <a-col :span="24">
          <a-form-model-item label="项目" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="proId">
            <JSearchSelectTag placeholder="请选择项目" v-model:value="model.proId"
              dict="tab_projectManage,pro_name,id,del_flag = '0'" async @change="handleProjectChange">
            </JSearchSelectTag>
          </a-form-model-item>
        </a-col>

        <!-- 退款相关 -->
        <a-col :span="24">
          <a-form-model-item label="退款金额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="refundAmount">
            <a-input-number v-model="model.refundAmount" placeholder="请输入退款金额" style="width: 100%" :min="0"
              :precision="2" />
          </a-form-model-item>
        </a-col>

        <a-col :span="24">
          <a-form-model-item label="资金性质" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="fundsNature">
            <a-select v-model="model.fundsNature" placeholder="请选择资金性质" style="width: 100%">
              <a-select-option value="1">对公</a-select-option>
              <a-select-option value="2">对私</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>

        <!-- 抬头信息 -->
        <a-col :span="24">
          <a-form-model-item label="项目主体" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="customerTitleId">
            <a-input-group compact>
              <a-input v-model="model.customerTitle" placeholder="请选择项目主体" style="width: calc(100% - 100px)"
                :readOnly="true"></a-input>
              <a-button type="primary" style="width: 100px" @click="openSelectCustomerTitleModal"
                :disabled="!model.proId">选择账户</a-button>
            </a-input-group>
            <input type="hidden" v-model="model.customerTitleId" />
          </a-form-model-item>
        </a-col>

        <!-- 备注 -->
        <a-col :span="24">
          <a-form-model-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="remarks">
            <a-textarea v-model="model.remarks" rows="4" placeholder="请输入备注" />
          </a-form-model-item>
        </a-col>
      </a-row>
    </a-form-model>
    <select-bank-account-modal ref="selectCustomerTitleModal" account-type="customer" :pro-id="model.proId"
      @select="handleCustomerTitleSelect"></select-bank-account-modal>
  </div>
</template>

<script>
import SelectBankAccountModal from '@/views/contranct/modules/SelectBankAccountModal'

export default {
  name: 'ProjectRefundForm',
  components: {
    SelectBankAccountModal
  },
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      model: {
        proId: null,
        proName: '',
        proUniqueId: '',
        collaborationMode: null,
        businessId: '',
        fundsNature: null,
        dateMonth: '',
        refundTime: null,
        refundAmount: null,
        customerTitleId: '',
        customerTitle: '',
        ourTitleId: '',
        ourTitle: '',
        remarks: '',
        accountNo: '',
        accountName: ''
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      validatorRules: {
        proId: [{ required: true, message: '请选择项目', trigger: 'change' }],
        refundAmount: [{ required: true, message: '请输入退款金额', trigger: 'blur' }],
        fundsNature: [{ required: true, message: '请选择资金性质', trigger: 'change' }],
        customerTitleId: [{ required: true, message: '请选择项目主体', trigger: 'change' }]
      },
      isUpdatingFromParent: false,
      valueUpdateTimer: null,
      modelUpdateTimer: null
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (this.isUpdatingFromParent) return

        if (newVal && Object.keys(newVal).length > 0) {
          if (this.valueUpdateTimer) {
            clearTimeout(this.valueUpdateTimer)
          }

          this.valueUpdateTimer = setTimeout(() => {
            let hasChanges = !oldVal
            if (!hasChanges && oldVal) {
              const keyFields = Object.keys(newVal)
              hasChanges = keyFields.some(key => {
                const oldValue = oldVal[key]
                const newValue = newVal[key]
                if (oldValue === newValue) return false
                if (Array.isArray(oldValue) && Array.isArray(newValue)) {
                  return oldValue.length !== newValue.length || oldValue.some((item, index) => item !== newValue[index])
                }
                return true
              })
            }

            if (hasChanges) {
              this.isUpdatingFromParent = true
              this.model = { ...this.model, ...newVal }
              this.$nextTick(() => {
                this.isUpdatingFromParent = false
              })
            }
          }, 50)
        }
      }
    },
    model: {
      deep: true,
      handler(newVal) {
        if (this.isUpdatingFromParent) return

        if (this.modelUpdateTimer) {
          clearTimeout(this.modelUpdateTimer)
        }

        this.modelUpdateTimer = setTimeout(() => {
          this.$emit('input', { ...newVal })
        }, 100)
      }
    }
  },
  methods: {
    // 获取提交数据（只返回后端需要的字段）
    getSubmitData() {
      return {
        businessType: this.model.businessType || 'projectRefund',
        bankAccountId: this.model.customerTitleId || this.model.bankAccountId || '', // 项目主体的ID
        fundsNature: this.model.fundsNature || '',
        proId: this.model.proId || '',
        refundAmount: this.model.refundAmount || 0,
        remarks: this.model.remarks || ''
      }
    },
    handleProjectChange(value) {
      if (value) {
        this.loadProjectName(value)
      } else {
        this.model.proName = ''
      }
    },
    // 加载项目名称
    async loadProjectName(proId) {
      if (!proId) return
      try {
        const { getAction } = await import('@/api/manage')
        const res = await getAction(`/sys/dict/loadDictItem/tab_projectManage,pro_name,id`, { key: proId })
        if (res && res.success && res.result) {
          this.model.proName = res.result
        }
      } catch (error) {
        console.error('加载项目名称失败:', error)
      }
    },
    // 打开项目主体选择弹窗
    openSelectCustomerTitleModal() {
      if (!this.model.proId) {
        this.$message.warning('请先选择项目')
        return
      }
      this.$refs.selectCustomerTitleModal.open()
    },
    // 处理项目主体选择
    handleCustomerTitleSelect(record) {
      this.isUpdatingFromParent = true
      // customerTitleId 就是 bankAccountId（项目主体的ID）
      this.$set(this.model, 'customerTitleId', record.id)
      this.$set(this.model, 'bankAccountId', record.id) // bankAccountId 就是项目主体的ID
      this.$set(this.model, 'customerTitle', record.partyAName || record.accountName || '')

      if (record.accountName) {
        this.$set(this.model, 'ourTitle', record.accountName)
      }
      if (record.accountNo) {
        this.$set(this.model, 'accountNo', record.accountNo)
      }

      this.$message.success('已选择项目主体：' + (record.partyAName || record.accountName || ''))
      this.$nextTick(() => {
        this.isUpdatingFromParent = false
      })
    },
    // 表单验证
    validate() {
      return new Promise((resolve, reject) => {
        if (!this.$refs.form) {
          reject(new Error('表单引用不存在'))
          return
        }
        this.$refs.form.validate((valid) => {
          if (valid) {
            resolve(this.model)
          } else {
            reject(new Error('表单验证失败'))
          }
        })
      })
    },
    resetFields() {
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
      this.model = {
        proId: null,
        proName: '',
        proUniqueId: '',
        collaborationMode: null,
        businessId: '',
        fundsNature: null,
        dateMonth: '',
        refundTime: null,
        refundAmount: null,
        customerTitleId: '',
        customerTitle: '',
        ourTitleId: '',
        ourTitle: '',
        remarks: '',
        accountNo: '',
        accountName: ''
      }
    }
  }
}
</script>

<style scoped lang="less">
.project-refund-form {
  padding: 16px 0;
}
</style>
