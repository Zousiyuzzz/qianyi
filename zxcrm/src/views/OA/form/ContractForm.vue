<template>
  <j-form-container :disabled="disabled">
    <a-form-model ref="form" :model="submitData" :rules="validatorRules" slot="detail">
      <a-row>
        <a-col :span="24">
          <a-form-model-item label="项目" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="proId">
            <a-select v-model="proIdArray" mode="multiple" show-search placeholder="请输入项目名称搜索" style="width: 100%"
              :default-active-first-option="false" :show-arrow="false" :filter-option="false"
              :not-found-content="projectLoading ? undefined : null" :loading="projectLoading" allowClear
              @search="handleProjectSearch" @change="handleProjectChange"
              @dropdown-visible-change="handleProjectDropdownVisible">
              <a-select-option v-for="item in projectOptions" :key="String(item.id)" :value="String(item.id)"
                :title="item.proName">
                {{ item.proName }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="24">
          <a-form-model-item label="签约日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="signDate">
            <j-date v-model="submitData.signDate" placeholder="请选择签约日期" style="width: 100%"></j-date>
          </a-form-model-item>
        </a-col>
        <a-col :span="24">
          <a-form-model-item label="截止日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="endDate">
            <j-date v-model="submitData.endDate" placeholder="请选择截止日期" style="width: 100%"></j-date>
          </a-form-model-item>
        </a-col>
        <a-col :span="24">
          <a-form-model-item label="合作方式" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="collaborationMode">
            <a-select v-model="submitData.collaborationMode" placeholder="请选择合作方式" style="width: 100%">
              <a-select-option value="0">预付</a-select-option>
              <a-select-option value="1">垫付</a-select-option>
              <a-select-option value="2">服务费</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="24">
          <a-form-model-item label="账期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="repayDay">
            <a-input-number v-model="submitData.repayDay" placeholder="请输入账期（天）" style="width: 100%" :min="0"
              :precision="0" />
          </a-form-model-item>
        </a-col>
        <a-col :span="24">
          <a-form-model-item label="授信额度" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="creditLimit">
            <a-input-number v-model="submitData.creditLimit" placeholder="请输入授信额度" style="width: 100%" :min="0"
              :precision="2" />
          </a-form-model-item>
        </a-col>

        <!-- 甲方信息模块 -->
        <a-col :span="24">
          <a-divider orientation="left">
            <span style="font-size: 16px; font-weight: bold;">甲方信息</span>
          </a-divider>
        </a-col>
        <!-- 甲方信息智能识别 -->
        <a-col :span="24">
          <a-form-model-item label="智能识别" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-textarea v-model="partyAIntelligentText"
              placeholder="请粘贴或输入甲方信息文本，系统将自动识别并填入下方字段（格式示例：单位名称：xxx  税号：xxx  开户银行：xxx  账号：xxx  地址：xxx  电话：xxx）"
              :rows="4">
            </a-textarea>
            <div style="margin-top: 8px;">
              <a-button type="link" size="small" @click="parsePartyAInfo">识别填入</a-button>
              <a-button type="link" size="small" @click="clearPartyAIntelligentText">清空</a-button>
            </div>
          </a-form-model-item>
        </a-col>
        <a-col :span="24">
          <a-form-model-item label="甲方单位名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyAName">
            <a-input v-model="submitData.partyAName" placeholder="请输入甲方单位名称"></a-input>
          </a-form-model-item>
        </a-col>
        <a-col :span="24">
          <a-form-model-item label="甲方税号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyATaxNo">
            <a-input v-model="submitData.partyATaxNo" placeholder="请输入甲方税号"></a-input>
          </a-form-model-item>
        </a-col>
        <a-col :span="24">
          <a-form-model-item label="甲方开户银行" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyABank">
            <a-input v-model="submitData.partyABank" placeholder="请输入甲方开户银行"></a-input>
          </a-form-model-item>
        </a-col>
        <a-col :span="24">
          <a-form-model-item label="甲方银行账号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyAAccount">
            <a-input v-model="submitData.partyAAccount" placeholder="请输入甲方银行账号"></a-input>
          </a-form-model-item>
        </a-col>
        <a-col :span="24">
          <a-form-model-item label="甲方地址" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyAAddress">
            <a-input v-model="submitData.partyAAddress" placeholder="请输入甲方地址"></a-input>
          </a-form-model-item>
        </a-col>
        <a-col :span="24">
          <a-form-model-item label="甲方电话" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyAPhone">
            <a-input v-model="submitData.partyAPhone" placeholder="请输入甲方电话"></a-input>
          </a-form-model-item>
        </a-col>
        <a-col :span="24">
          <a-form-model-item label="乙方单位名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="cardId">
            <a-input-group compact>
              <a-input v-model="submitData.accountName" placeholder="请选择乙方单位" style="width: calc(100% - 100px)"
                :readOnly="true"></a-input>
              <a-button type="primary" style="width: 100px" @click="openSelectAccountModal">选择账户</a-button>
            </a-input-group>
            <input type="hidden" v-model="submitData.cardId" />
          </a-form-model-item>
        </a-col>
        <a-col :span="24">
          <a-form-model-item label="邮寄信息" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="remark">
            <a-textarea v-model="submitData.remark" placeholder="请输入邮寄信息" :rows="4"></a-textarea>
          </a-form-model-item>
        </a-col>
        <a-col :span="24">
          <a-form-model-item label="附件" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="files">
            <a-upload :file-list="fileList" :before-upload="beforeUpload" @remove="handleRemove" multiple>
              <a-button>
                <a-icon type="upload" /> 选择文件
              </a-button>
            </a-upload>
          </a-form-model-item>
        </a-col>
      </a-row>
    </a-form-model>
    <select-bank-account-modal ref="selectAccountModal" @select="handleAccountSelect"></select-bank-account-modal>
  </j-form-container>
</template>

<script>
import { getAction } from '@/api/manage'
import SelectBankAccountModal from '@/views/contranct/modules/SelectBankAccountModal'

export default {
  name: 'ContractForm',
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
      // 提交数据（submitData）- 只包含提交给后端的数据
      submitData: {
        proId: '',
        proName: '',
        signDate: '',
        endDate: '',
        collaborationMode: null,
        repayDay: null,
        creditLimit: null,
        partyAName: '',
        partyATaxNo: '',
        partyABank: '',
        partyAAccount: '',
        partyAAddress: '',
        partyAPhone: '',
        cardId: '',
        accountName: '',
        accountNo: '',
        remark: ''
      },
      // 展示数据（displayData）- 用于界面展示，如 proIdArray
      proIdArray: [], // 项目ID数组（用于多选）
      projectOptions: [],
      projectCache: {},
      projectLoading: false,
      projectSearchTimer: null,
      submitDataUpdateTimer: null, // submitData 更新防抖定时器
      fileList: [],
      partyAIntelligentText: '',
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
        signDate: [{ required: true, message: '请选择签约日期', trigger: 'change' }],
        endDate: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
        partyAName: [{ required: true, message: '请输入甲方单位名称', trigger: 'blur' }],
        cardId: [{ required: true, message: '请选择乙方单位', trigger: 'change' }]
      },
      // 防止循环更新的标志
      isUpdatingFromValue: false,
      isUpdatingFromInternal: false
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        // 防止循环更新
        if (this.isUpdatingFromInternal) {
          return
        }

        if (newVal && Object.keys(newVal).length > 0) {
          this.isUpdatingFromValue = true

          // 检查是否有实际变化，避免不必要的更新（简化比较，避免深度 JSON.stringify）
          let hasChanges = !oldVal
          if (!hasChanges && oldVal) {
            // 只比较关键字段，避免深度比较整个对象
            const keyFields = ['proId', 'proIdArray', 'signDate', 'endDate', 'collaborationMode', 'repayDay', 'creditLimit', 'partyAName', 'partyATaxNo', 'partyABank', 'partyAAccount', 'partyAAddress', 'partyAPhone', 'cardId', 'accountName', 'remark', 'files']
            hasChanges = keyFields.some(key => {
              const oldValue = oldVal[key]
              const newValue = newVal[key]
              if (Array.isArray(oldValue) && Array.isArray(newValue)) {
                return oldValue.length !== newValue.length || oldValue.some((item, index) => item !== newValue[index])
              }
              return oldValue !== newValue
            })
          }

          if (hasChanges) {
            // 更新 submitData（排除 proId 和 proName，这些由 proIdArray 控制）
            const { proId, proName, proIdArray, files, ...otherData } = newVal
            this.submitData = { ...this.submitData, ...otherData }

            // 处理 proId 转 proIdArray（确保返回修改时能正确转换）
            if (proId && typeof proId === 'string') {
              const newProIdArray = proId.split(',').filter(id => id.trim()).map(id => String(id))
              if (JSON.stringify(newProIdArray) !== JSON.stringify(this.proIdArray)) {
                this.proIdArray = newProIdArray
                // 同步更新 submitData.proId（用于验证）
                this.$set(this.submitData, 'proId', proId)
                if (this.proIdArray.length > 0) {
                  this.loadSelectedProjects(this.proIdArray)
                }
              }
            } else if (proIdArray && Array.isArray(proIdArray)) {
              const newProIdArray = proIdArray.map(id => String(id))
              if (JSON.stringify(newProIdArray) !== JSON.stringify(this.proIdArray)) {
                this.proIdArray = newProIdArray
                // 同步更新 submitData.proId（用于验证）
                if (newProIdArray.length > 0) {
                  this.$set(this.submitData, 'proId', newProIdArray.join(','))
                } else {
                  this.$set(this.submitData, 'proId', '')
                }
              }
            }

            // 处理文件列表
            if (files && Array.isArray(files)) {
              this.fileList = files.map(file => ({
                uid: file.id || file.uid || Math.random().toString(36).substr(2, 9),
                name: file.name || file.fileName,
                status: 'done',
                url: file.url || file.fileUrl
              }))
            }
          }

          this.$nextTick(() => {
            this.isUpdatingFromValue = false
          })
        }
      }
    },
    submitData: {
      deep: true,
      handler(newVal, oldVal) {
        // 防止循环更新
        if (this.isUpdatingFromValue || this.isUpdatingFromInternal) {
          return
        }

        // 使用防抖，避免频繁触发
        if (this.submitDataUpdateTimer) {
          clearTimeout(this.submitDataUpdateTimer)
        }

        this.submitDataUpdateTimer = setTimeout(() => {
          this.isUpdatingFromInternal = true
          this.$emit('input', this.getSubmitData())
          this.$nextTick(() => {
            this.isUpdatingFromInternal = false
          })
        }, 100)
      }
    },
    proIdArray: {
      handler(newVal, oldVal) {
        // 防止循环更新
        if (this.isUpdatingFromValue) {
          return
        }

        // 检查是否有实际变化（使用长度和内容比较，避免深度比较）
        if (oldVal && newVal && oldVal.length === newVal.length) {
          const hasChanges = oldVal.some((id, index) => String(id) !== String(newVal[index]))
          if (!hasChanges) {
            return
          }
        }

        this.isUpdatingFromInternal = true

        // 更新 submitData 中的 proId 和 proName
        if (newVal && newVal.length > 0) {
          const newProId = newVal.join(',')
          const proNames = newVal.map(id => {
            const project = this.projectOptions.find(item => String(item.id) === String(id))
            if (!project && this.projectCache[String(id)]) {
              return this.projectCache[String(id)].proName
            }
            return project ? project.proName : ''
          }).filter(name => name)
          const newProName = proNames.length > 0 ? proNames.join(',') : ''

          // 只在值真正变化时更新
          if (this.submitData.proId !== newProId || this.submitData.proName !== newProName) {
            this.$set(this.submitData, 'proId', newProId)
            this.$set(this.submitData, 'proName', newProName)
          }
        } else {
          if (this.submitData.proId !== '' || this.submitData.proName !== '') {
            this.$set(this.submitData, 'proId', '')
            this.$set(this.submitData, 'proName', '')
          }
        }

        this.$nextTick(() => {
          this.isUpdatingFromInternal = false
        })
      }
    }
  },
  mounted() {
    this.loadProjectList('', 1, 20)
  },
  methods: {
    // 获取提交数据（包含 proId 转换）
    getSubmitData() {
      const data = { ...this.submitData }
      // 确保 proId 是字符串格式
      if (this.proIdArray && this.proIdArray.length > 0) {
        data.proId = this.proIdArray.join(',')
      }
      // 添加文件列表（用于 FormData 提交）
      if (this.fileList && this.fileList.length > 0) {
        data.fileList = this.fileList
      }
      return data
    },
    // 表单验证（回调式）
    validate(callback) {
      this.$refs.form.validate((valid) => {
        if (callback) {
          callback(valid)
        }
      })
    },
    // 打开选择账户弹窗
    openSelectAccountModal() {
      this.$refs.selectAccountModal.open()
    },
    // 选择账户回调
    handleAccountSelect(record) {
      this.$set(this.submitData, 'cardId', record.id)
      this.$set(this.submitData, 'accountName', record.accountName || '')
      this.$set(this.submitData, 'accountNo', record.accountNo || '')
      this.$message.success('已选择账户：' + record.accountName)
    },
    // 项目搜索
    handleProjectSearch(value) {
      if (this.projectSearchTimer) {
        clearTimeout(this.projectSearchTimer)
      }
      this.projectSearchTimer = setTimeout(() => {
        const searchValue = value ? value.trim() : ''
        this.loadProjectList(searchValue, 1, 20)
      }, 300)
    },
    // 加载项目列表
    loadProjectList(searchValue, pageNo = 1, pageSize = 20) {
      this.projectLoading = true
      const params = {
        pageNo: pageNo,
        pageSize: pageSize
      }
      if (searchValue) {
        params.proName = `*${searchValue}*`
      }
      getAction('/projectmanage/list', params)
        .then(res => {
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
        })
        .catch(error => {
          this.projectLoading = false
          this.projectOptions = []
        })
    },
    // 项目选择变化
    handleProjectChange(value) {
      this.proIdArray = value ? value.map(v => String(v)) : []
      // 同步更新 submitData 中的 proId（用于验证）
      if (this.proIdArray.length > 0) {
        this.$set(this.submitData, 'proId', this.proIdArray.join(','))
        // 加载项目名称
        this.loadSelectedProjects(this.proIdArray)
      } else {
        this.$set(this.submitData, 'proId', '')
        this.$set(this.submitData, 'proName', '')
      }
      // 触发验证
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.validateField('proId')
      })
    },
    // 项目下拉框显示/隐藏
    handleProjectDropdownVisible(open) {
      if (open && this.projectOptions.length === 0 && !this.projectLoading) {
        this.loadProjectList('', 1, 20)
      }
    },
    // 加载已选项目
    loadSelectedProjects(ids) {
      if (!ids || ids.length === 0) return
      const promises = ids.map(id => {
        if (this.projectCache[String(id)]) {
          return Promise.resolve({ success: true, result: this.projectCache[String(id)] })
        }
        return getAction('/projectmanage/queryById', { id })
      })
      Promise.all(promises).then(results => {
        const projects = results
          .filter(res => res.success && res.result)
          .map(res => ({
            ...res.result,
            id: String(res.result.id)
          }))
        projects.forEach(project => {
          this.projectCache[String(project.id)] = project
          if (!this.projectOptions.find(item => String(item.id) === String(project.id))) {
            this.projectOptions.push(project)
          }
        })
      })
    },
    // 文件上传前
    beforeUpload(file) {
      this.fileList = [
        ...this.fileList,
        {
          uid: file.uid || Date.now() + Math.random(),
          name: file.name,
          status: 'done',
          originFileObj: file,
          file: file
        }
      ]
      return false
    },
    // 移除文件
    handleRemove(file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    },
    // 解析甲方信息（简化版，完整版逻辑较长，这里先简化）
    parsePartyAInfo() {
      if (!this.partyAIntelligentText || !this.partyAIntelligentText.trim()) {
        return
      }
      const text = this.partyAIntelligentText.trim().replace(/[：:]/g, ':')
      // 简化的解析逻辑，完整版可以参考 ApprovalForm.vue 中的实现
      const patterns = {
        partyAName: ['单位名称', '公司名称', '公司名', '企业名称', '名称'],
        partyATaxNo: ['税号', '纳税人识别号', '统一社会信用代码'],
        partyABank: ['开户银行', '开户行', '银行名称'],
        partyAAccount: ['账号', '银行账号', '账户', '银行账户'],
        partyAAddress: ['地址', '联系地址', '注册地址'],
        partyAPhone: ['电话', '联系电话', '手机', '固定电话']
      }
      Object.keys(patterns).forEach(key => {
        const fieldPatterns = patterns[key]
        for (const pattern of fieldPatterns) {
          const regex = new RegExp(pattern + '[：:]\\s*([^\\n\\r：:]+)', 'i')
          const match = text.match(regex)
          if (match && match[1]) {
            this.$set(this.submitData, key, match[1].trim())
            break
          }
        }
      })
      this.$message.success('甲方信息识别完成')
    },
    // 清空智能识别文本
    clearPartyAIntelligentText() {
      this.partyAIntelligentText = ''
    }
  }
}
</script>

<style scoped lang="less">
// 样式可以根据需要添加</style>
