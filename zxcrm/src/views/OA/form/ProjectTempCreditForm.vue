<template>
  <div class="project-temp-credit-form">
    <a-form-model ref="form" :model="model" :rules="validatorRules">
      <a-row>
        <!-- 项目相关 -->
        <a-col :span="24">
          <a-form-model-item label="项目" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="proId">
            <a-select v-model="model.proId" mode="single" show-search placeholder="请输入项目名称搜索" style="width: 100%"
              :default-active-first-option="false" :show-arrow="false" :filter-option="false"
              :not-found-content="projectLoading ? undefined : null" :loading="projectLoading" allowClear
              @search="handleProjectSearch" @change="handleProjectChange"
              @dropdown-visible-change="handleProjectDropdownVisible">
              <a-select-option v-for="item in projectOptions" :key="String(item.id)" :value="String(item.id)"
                :title="item.proName">
                {{ item.proName }}
              </a-select-option>
            </a-select>
            <div v-if="totalCreditLimit !== null && totalCreditLimit !== undefined" class="credit-limit-info">
              当前授信额度：{{ formatAmount(totalCreditLimit) }}
            </div>
          </a-form-model-item>
        </a-col>

        <!-- 临时授信金额 -->
        <a-col :span="24">
          <a-form-model-item label="临时授信金额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="tempAmount">
            <a-input-number v-model="model.tempAmount" placeholder="请输入临时授信金额" style="width: 100%" :min="0"
              :precision="2" />
          </a-form-model-item>
        </a-col>

        <!-- 临时授信到期日期 -->
        <a-col :span="24">
          <a-form-model-item label="临时授信到期日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="endDate">
            <j-date v-model="model.endDate" placeholder="请选择临时授信到期日期" style="width: 100%"></j-date>
          </a-form-model-item>
        </a-col>

        <!-- 合同选择 -->
        <a-col :span="24" v-if="model.proId">
          <a-form-model-item label="合同" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="contractId">
            <a-select v-model="model.contractId" show-search placeholder="请选择合同（可选）" style="width: 100%"
              :default-active-first-option="false" :show-arrow="true" :filter-option="false"
              :not-found-content="contractLoading ? undefined : null" :loading="contractLoading" allowClear
              @search="handleContractSearch" @change="handleContractChange"
              @dropdown-visible-change="handleContractDropdownVisible">
              <a-select-option v-for="item in contractOptions" :key="String(item.id)" :value="String(item.id)"
                :title="item.contractName || item.contractNo">
                {{ item.contractName || item.contractNo }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>

        <!-- 备注 -->
        <a-col :span="24">
          <a-form-model-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="remark">
            <a-textarea v-model="model.remark" rows="4" placeholder="请输入备注" />
          </a-form-model-item>
        </a-col>
      </a-row>
    </a-form-model>
  </div>
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: 'ProjectTempCreditForm',
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
        proId: '',
        proName: '',
        tempAmount: null,
        endDate: null,
        hasContract: '0',
        contractId: '',
        contractName: '',
        remark: ''
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
        tempAmount: [{ required: true, message: '请输入临时授信金额', trigger: 'blur' }],
        endDate: [{ required: true, message: '请选择临时授信到期日期', trigger: 'change' }]
      },
      projectOptions: [],
      projectCache: {},
      projectLoading: false,
      projectSearchTimer: null,
      contractOptions: [],
      contractLoading: false,
      contractSearchTimer: null,
      isUpdatingFromParent: false,
      valueUpdateTimer: null,
      modelUpdateTimer: null,
      totalCreditLimit: null,
      fundPoolLoading: false
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
                this.updateHasContract()
                if (this.model.proId) {
                  this.loadContractList('').then(() => {
                    if (this.model.contractId && !this.model.contractName) {
                      const contract = this.contractOptions.find(item => String(item.id) === String(this.model.contractId))
                      if (contract) {
                        this.model.contractName = contract.contractName || contract.contractNo || ''
                      }
                    }
                  })
                  // 查询项目资金池
                  this.loadFundPoolInfo(this.model.proId)
                } else {
                  this.totalCreditLimit = null
                }
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
          this.updateHasContract()
          this.$emit('input', { ...newVal })
        }, 100)
      }
    },
    'model.contractId'(newVal) {
      this.updateHasContract()
    },
    'model.proId'(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.model.contractId = ''
        this.model.contractName = ''
        this.contractOptions = []
        this.loadContractList('')
      } else if (!newVal) {
        this.model.contractId = ''
        this.model.contractName = ''
        this.contractOptions = []
        this.updateHasContract()
      }
    }
  },
  created() {
    this.contractSearchTimer = null
  },
  mounted() {
    this.loadProjectList('', 1, 20)
  },
  methods: {
    // 获取提交数据
    getSubmitData() {
      const data = { ...this.model }
      // 确保 hasContract 是最新的
      this.updateHasContract()
      return data
    },
    handleProjectSearch(value) {
      if (this.projectSearchTimer) {
        clearTimeout(this.projectSearchTimer)
      }
      this.projectSearchTimer = setTimeout(() => {
        const searchValue = value ? value.trim() : ''
        this.loadProjectList(searchValue, 1, 20)
      }, 300)
    },
    loadProjectList(searchValue, pageNo = 1, pageSize = 20) {
      this.projectLoading = true
      const params = {
        pageNo: pageNo,
        pageSize: pageSize
      }
      if (searchValue) {
        params.proName = `*${searchValue}*`
      }
      getAction('/projectmanage/list', params).then(res => {
        this.projectLoading = false
        if (res.success) {
          let list = []
          if (res.result && Array.isArray(res.result.records)) {
            list = res.result.records
          } else if (Array.isArray(res.result)) {
            list = res.result
          }
          let filteredList = list.filter(item => item.delFlag !== '1')
          this.projectOptions = filteredList.map(item => {
            const projectItem = {
              ...item,
              id: String(item.id)
            }
            this.projectCache[String(item.id)] = projectItem
            return projectItem
          })
        } else {
          this.projectOptions = []
        }
      }).catch(error => {
        this.projectLoading = false
        this.projectOptions = []
      })
    },
    handleProjectDropdownVisible(open) {
      if (open && this.projectOptions.length === 0 && !this.projectLoading) {
        this.loadProjectList('', 1, 20)
      }
    },
    handleProjectChange(value) {
      const selectedProject = this.projectOptions.find(item => String(item.id) === String(value))
      if (selectedProject) {
        this.model.proName = selectedProject.proName
      }
      if (value) {
        this.model.contractId = ''
        this.model.contractName = ''
        this.contractOptions = []
        this.updateHasContract()
        this.loadContractList('')
        // 查询项目资金池
        this.loadFundPoolInfo(value)
      } else {
        // 清空授信额度
        this.totalCreditLimit = null
      }
    },
    // 查询项目资金池信息
    loadFundPoolInfo(proId) {
      if (!proId) {
        this.totalCreditLimit = null
        return
      }

      this.fundPoolLoading = true
      const params = {
        proId: proId,
        pageNo: 1,
        pageSize: 1
      }

      getAction('/projectFundPool/list', params).then(res => {
        this.fundPoolLoading = false
        if (res.success) {
          let list = []
          if (res.result && Array.isArray(res.result.records)) {
            list = res.result.records
          } else if (Array.isArray(res.result)) {
            list = res.result
          }

          if (list.length > 0) {
            const fundPool = list[0]
            this.totalCreditLimit = fundPool.totalCreditLimit || null
          } else {
            this.totalCreditLimit = null
          }
        } else {
          this.totalCreditLimit = null
        }
      }).catch(error => {
        console.error('查询项目资金池失败:', error)
        this.fundPoolLoading = false
        this.totalCreditLimit = null
      })
    },
    // 格式化金额
    formatAmount(amount) {
      if (amount === null || amount === undefined || amount === '') {
        return '-'
      }
      const num = Number(amount)
      if (isNaN(num)) {
        return '-'
      }
      return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' 元'
    },
    handleContractSearch(value) {
      if (this.contractSearchTimer) {
        clearTimeout(this.contractSearchTimer)
      }
      this.contractSearchTimer = setTimeout(() => {
        const searchValue = value ? value.trim() : ''
        this.loadContractList(searchValue)
      }, 300)
    },
    loadContractList(searchValue = '') {
      if (!this.model.proId) {
        this.contractOptions = []
        return Promise.resolve()
      }

      this.contractLoading = true
      const params = {
        proId: this.model.proId,
        pageNo: 1,
        pageSize: 100
      }
      if (searchValue) {
        params.contractName = `*${searchValue}*`
      }

      return getAction('/contractInfo/list', params).then(res => {
        this.contractLoading = false
        if (res.success) {
          let list = []
          if (res.result && Array.isArray(res.result.records)) {
            list = res.result.records
          } else if (Array.isArray(res.result)) {
            list = res.result
          }
          let filteredList = list.filter(item => item.delFlag !== '1')
          this.contractOptions = filteredList.map(item => ({
            ...item,
            id: String(item.id)
          }))
        } else {
          this.contractOptions = []
        }
      }).catch(error => {
        console.error('加载合同列表失败:', error)
        this.contractLoading = false
        this.contractOptions = []
      })
    },
    handleContractDropdownVisible(open) {
      if (open && this.contractOptions.length === 0 && !this.contractLoading && this.model.proId) {
        this.loadContractList('')
      }
    },
    handleContractChange(value) {
      if (value) {
        const selectedContract = this.contractOptions.find(item => String(item.id) === String(value))
        if (selectedContract) {
          this.model.contractName = selectedContract.contractName || selectedContract.contractNo || ''
        } else {
          this.model.contractName = ''
        }
      } else {
        this.model.contractName = ''
      }
      this.updateHasContract()
    },
    updateHasContract() {
      if (this.isUpdatingFromParent) return
      const newHasContract = this.model.contractId && this.model.contractId !== '' ? '1' : '0'
      if (this.model.hasContract !== newHasContract) {
        this.$set(this.model, 'hasContract', newHasContract)
      }
    },
    validate() {
      return new Promise((resolve, reject) => {
        if (!this.$refs.form) {
          reject(new Error('表单引用不存在'))
          return
        }
        this.updateHasContract()
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.updateHasContract()
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
        proId: '',
        proName: '',
        tempAmount: null,
        endDate: null,
        hasContract: '0',
        contractId: '',
        contractName: '',
        remark: ''
      }
      this.contractOptions = []
      this.totalCreditLimit = null
      this.updateHasContract()
    }
  }
}
</script>

<style scoped lang="less">
.project-temp-credit-form {
  padding: 16px 0;

  .credit-limit-info {
    color: #ff4d4f;
    font-size: 12px;
    margin-top: 4px;
    line-height: 1.5;
  }
}
</style>
