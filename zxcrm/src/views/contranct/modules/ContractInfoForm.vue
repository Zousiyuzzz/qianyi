<template>
  <div>
    <a-spin :spinning="confirmLoading">
      <j-form-container :disabled="formDisabled">
        <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
          <a-row>
            <!-- <a-col :span="24">
              <a-form-model-item label="合同编号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="contractNo">
                <a-input v-model="model.contractNo" placeholder="请输入合同编号"></a-input>
              </a-form-model-item>
            </a-col> -->
            <!-- <a-col :span="24">
              <a-form-model-item label="合同名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="contractName">
                <a-input v-model="model.contractName" placeholder="请输入合同名称"></a-input>
              </a-form-model-item>
            </a-col> -->
            <a-col :span="24">
              <a-form-model-item label="项目" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="proId">
                <a-select v-model="model.proIdArray" mode="multiple" show-search placeholder="请输入项目名称搜索"
                  style="width: 100%" :default-active-first-option="false" :show-arrow="false" :filter-option="false"
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
                <j-date v-model="model.signDate" placeholder="请选择签约日期" style="width: 100%"></j-date>
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="截止日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="endDate">
                <j-date v-model="model.endDate" placeholder="请选择截止日期" style="width: 100%"></j-date>
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="合作方式" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="collaboration_mode">
                <a-select v-model="model.collaboration_mode" placeholder="请选择合作方式" style="width: 100%">
                  <a-select-option value="0">预付</a-select-option>
                  <a-select-option value="1">垫付</a-select-option>
                  <a-select-option value="2">服务费</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="账期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="repay_day">
                <a-input-number v-model="model.repay_day" placeholder="请输入账期（天）" style="width: 100%" :min="0" :precision="0" />
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="授信额度" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="credit_limit">
                <a-input-number v-model="model.credit_limit" placeholder="请输入授信额度" style="width: 100%" :min="0" :precision="2" />
              </a-form-model-item>
            </a-col>

            <!-- <a-col :span="24">
              <a-form-model-item label="截止日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="endDate">
                <j-date v-model="model.endDate" placeholder="请选择截止日期" style="width: 100%"></j-date>
              </a-form-model-item>
            </a-col>
-->

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
                <a-input v-model="model.partyAName" placeholder="请输入甲方单位名称"></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="甲方税号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyATaxNo">
                <a-input v-model="model.partyATaxNo" placeholder="请输入甲方税号"></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="甲方开户银行" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyABank">
                <a-input v-model="model.partyABank" placeholder="请输入甲方开户银行"></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="甲方银行账号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyAAccount">
                <a-input v-model="model.partyAAccount" placeholder="请输入甲方银行账号"></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="甲方地址" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyAAddress">
                <a-input v-model="model.partyAAddress" placeholder="请输入甲方地址"></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="甲方电话" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyAPhone">
                <a-input v-model="model.partyAPhone" placeholder="请输入甲方电话"></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="乙方单位名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="cardId">
                <a-input-group compact>
                  <a-input v-model="model.accountName" placeholder="请选择乙方单位" style="width: calc(100% - 100px)"
                    :readOnly="true"></a-input>
                  <a-button type="primary" style="width: 100px" @click="openSelectAccountModal">选择账户</a-button>
                </a-input-group>
                <input type="hidden" v-model="model.cardId" />
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="邮寄信息" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="remark">
                <a-textarea v-model="model.remark" placeholder="请输入邮寄信息" :rows="4"></a-textarea>
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
      </j-form-container>
    </a-spin>
    <select-bank-account-modal ref="selectAccountModal" @select="handleAccountSelect"></select-bank-account-modal>
  </div>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'
import SelectBankAccountModal from './SelectBankAccountModal'

export default {
  name: 'ContractInfoForm',
  components: {
    SelectBankAccountModal
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      model: {
        proIdArray: [] // 初始化 proIdArray
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      confirmLoading: false,
      formDisabled: false,
      projectOptions: [], // 项目选项列表（当前显示的）
      projectCache: {}, // 项目缓存 {id: {id, proName, ...}}
      projectLoading: false, // 项目加载状态
      projectSearchTimer: null, // 项目搜索防抖定时器
      fileList: [], // 文件列表
      partyAIntelligentText: '', // 甲方信息智能识别文本
      validatorRules: {
        // contractNo: [
        //   { required: true, message: '请输入合同编号!' },
        //   { validator: this.validateContractNo }
        // ],
        // contractName: [{ required: true, message: '请输入合同名称!' }],
        contractType: [{ required: true, message: '请选择合同类型!' }]
      },
      url: {
        add: '/contractInfo/add',
        edit: '/contractInfo/edit',
        queryById: '/contractInfo/queryById'
      }
    }
  },
  computed: {},
  created() {
    // 备份model原始值
    this.defaultModel = JSON.parse(JSON.stringify(this.model))
  },
  methods: {
    add() {
      this.model = Object.assign({}, this.defaultModel)
      this.model.proId = ''
      this.model.proIdArray = []
      this.fileList = []
      this.projectOptions = []
      this.partyAIntelligentText = '' // 清空智能识别文本
      // 初始化时加载前20条数据
      this.loadProjectList('', 1, 20)
      this.visible = true
      this.formDisabled = this.disabled
    },
    edit(record) {
      this.model = Object.assign({}, record)
      this.partyAIntelligentText = '' // 清空智能识别文本
      // 将 proId 字符串转换为数组，使用 $set 确保响应式
      if (this.model.proId && typeof this.model.proId === 'string') {
        const proIdArray = this.model.proId.split(',').filter(id => id.trim()).map(id => String(id))
        this.$set(this.model, 'proIdArray', proIdArray)
        // 如果有已选的项目ID，加载这些项目的信息用于显示
        if (proIdArray.length > 0) {
          this.loadSelectedProjects(proIdArray)
        }
      } else if (Array.isArray(this.model.proId)) {
        const proIdArray = this.model.proId.map(id => String(id))
        this.$set(this.model, 'proIdArray', proIdArray)
        if (proIdArray.length > 0) {
          this.loadSelectedProjects(proIdArray)
        }
      } else {
        this.$set(this.model, 'proIdArray', [])
      }
      // 如果有 cardId，加载账户名称
      if (this.model.cardId) {
        getAction('/bankAccountConfig/queryById', { id: this.model.cardId }).then(res => {
          if (res.success && res.result) {
            this.$set(this.model, 'accountName', res.result.accountName || '')
            this.$set(this.model, 'accountNo', res.result.accountNo || '')
          }
        })
      } else {
        this.$set(this.model, 'accountName', '')
        this.$set(this.model, 'accountNo', '')
      }
      // 处理文件列表（如果有）
      if (this.model.files && Array.isArray(this.model.files)) {
        this.fileList = this.model.files.map(file => ({
          uid: file.id || file.uid || Math.random().toString(36).substr(2, 9),
          name: file.name || file.fileName,
          status: 'done',
          url: file.url || file.fileUrl
        }))
      } else {
        this.fileList = []
      }
      // 初始化时加载前20条数据
      this.projectOptions = []
      this.loadProjectList('', 1, 20)
      this.visible = true
      this.formDisabled = this.disabled
    },
    submitForm() {
      const that = this
      // 触发表单验证
      this.$refs.form.validate(valid => {
        if (valid) {
          that.confirmLoading = true

          // 创建 FormData
          const formData = new FormData()

          // 准备提交的数据，将 proIdArray 转换为 proId 字符串，并提取项目名称
          const submitData = Object.assign({}, this.model)
          if (submitData.proIdArray && Array.isArray(submitData.proIdArray) && submitData.proIdArray.length > 0) {
            submitData.proId = submitData.proIdArray.join(',')
            // 提取项目名称，用逗号分隔
            const proNames = submitData.proIdArray.map(id => {
              const project = this.projectOptions.find(item => String(item.id) === String(id))
              return project ? project.proName : ''
            }).filter(name => name)

            submitData.proName = proNames.join(',')
          } else {
            submitData.proId = ''
            submitData.proName = ''
          }
          // 删除临时数组字段
          delete submitData.proIdArray

          // 将表单数据添加到 FormData
          Object.keys(submitData).forEach(key => {
            if (submitData[key] !== null && submitData[key] !== undefined) {
              formData.append(key, submitData[key])
            }
          })

          // 添加文件列表到 FormData
          this.fileList.forEach((file, index) => {
            // 新上传的文件：可能是 file.originFileObj 或直接是 file 对象
            if (file.originFileObj) {
              formData.append('files', file.originFileObj)
            } else if (file instanceof File) {
              // 如果 file 本身就是 File 对象
              formData.append('files', file)
            } else if (file.url || file.response) {
              // 已存在的文件（编辑时保留的文件）
              const fileUrl = file.url || (file.response && file.response.url)
              if (fileUrl) {
                formData.append('fileUrls', fileUrl)
              }
            }
          })

          // 调试：打印文件列表信息
          console.log('文件列表:', this.fileList)
          console.log('FormData 中的文件:', Array.from(formData.entries()).filter(([key]) => key === 'files'))

          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }

          // 使用 FormData 提交
          httpAction(httpurl, formData, method)
            .then(res => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.confirmLoading = false
            })
        }
      })
    },
    validateContractNo(rule, value, callback) {
      if (!value) {
        callback()
        return
      }
      // 检查合同编号是否重复
      validateDuplicateValue(
        'tab_contract_info',
        'contractNo',
        value,
        this.model.id,
        callback
      )
    },
    openSelectAccountModal() {
      this.$refs.selectAccountModal.open()
    },
    handleAccountSelect(record) {
      this.$set(this.model, 'cardId', record.id)
      this.$set(this.model, 'accountName', record.accountName || '')
      this.$set(this.model, 'accountNo', record.accountNo || '')
      this.$message.success('已选择账户：' + record.accountName)
    },
    // 解析甲方信息 - 增强版，支持多种格式
    parsePartyAInfo() {
      if (!this.partyAIntelligentText || !this.partyAIntelligentText.trim()) {
        return
      }

      let text = this.partyAIntelligentText.trim()
      // 统一替换中文冒号为英文冒号，便于处理
      text = text.replace(/[：:]/g, ':')

      // 辅助函数：提取字段值，支持无分隔符的情况
      const extractField = (patterns, nextFieldPatterns = []) => {
        for (const pattern of patterns) {
          // 先尝试标准格式（有分隔符）
          let match = text.match(new RegExp(pattern + '[：:]\\s*([^\\n\\r：:]+?)(?=\\n|$|' + nextFieldPatterns.join('|') + ')', 'i'))
          if (match && match[1]) {
            return match[1].trim()
          }
          // 尝试无分隔符格式（字段名直接接值）
          match = text.match(new RegExp(pattern + '[：:]?([^\\n\\r：:]+?)(?=' + nextFieldPatterns.join('|') + ')', 'i'))
          if (match && match[1]) {
            return match[1].trim()
          }
        }
        return null
      }

      // 辅助函数：智能提取税号（根据格式特征）
      const extractTaxNo = () => {
        // 先尝试标准格式
        const standardMatch = extractField([
          '税号', '纳税人识别号', '统一社会信用代码', '信用代码', '纳税人代码'
        ], ['地址', '开户', '银行', '账号', '公司', '单位', '电话', '联系'])
        if (standardMatch) {
          // 验证税号格式：通常是15-20位字母数字组合，可能包含MAC等前缀
          const taxNoPattern = /^[A-Z0-9]{15,20}$/i
          if (taxNoPattern.test(standardMatch)) {
            return standardMatch
          }
          // 如果匹配到的值看起来像税号，也返回
          if (/^[A-Z0-9]{10,}$/i.test(standardMatch) && !/^[\d]{10,}$/.test(standardMatch)) {
            return standardMatch
          }
        }
        // 如果标准格式没找到，尝试在"税号"关键词后查找
        const taxNoIndex = text.search(/税号[：:]?/i)
        if (taxNoIndex !== -1) {
          const afterTaxNo = text.substring(taxNoIndex)
          // 查找税号值（字母数字组合，10-25位，到"地址"之前）
          const taxNoMatch = afterTaxNo.match(/税号[：:]?([A-Z0-9]{10,25}?)(?=地址|开户|银行|账号|公司|单位|电话)/i)
          if (taxNoMatch && taxNoMatch[1]) {
            const taxNo = taxNoMatch[1]
            // 验证：税号应该包含字母或数字，长度合理
            if (taxNo.length >= 10 && /[A-Z]/i.test(taxNo)) {
              return taxNo
            }
          }
          // 如果没找到标准格式，尝试提取到"地址"之前的所有字母数字
          const nextFieldMatch = afterTaxNo.match(/税号[：:]?([A-Z0-9]+?)(?=地址)/i)
          if (nextFieldMatch && nextFieldMatch[1] && nextFieldMatch[1].length >= 10) {
            return nextFieldMatch[1]
          }
        }
        return null
      }

      // 辅助函数：智能提取银行账号（根据格式特征）
      const extractAccount = () => {
        // 先尝试标准格式
        const standardMatch = extractField([
          '账号', '银行账号', '账户', '银行账户', '账户号'
        ], ['地址', '开户', '银行', '公司', '单位', '电话', '联系'])
        if (standardMatch) {
          // 验证账号格式：通常是纯数字，长度10-30位
          const accountPattern = /^[\d]{10,30}$/
          if (accountPattern.test(standardMatch)) {
            return standardMatch
          }
        }
        // 优先处理"开户行账号"这种组合字段（提取账号部分）
        const bankAccountMatch = text.match(/开户行账号[：:]?[^：:\d]*?([\d]{10,30})/i)
        if (bankAccountMatch && bankAccountMatch[1]) {
          return bankAccountMatch[1]
        }
        // 尝试在"账号"或"银行账号"关键词后查找
        const accountKeywords = ['银行账号', '账号', '账户', '银行账户', '账户号']
        for (const keyword of accountKeywords) {
          const keywordIndex = text.search(new RegExp(keyword + '[：:]?', 'i'))
          if (keywordIndex !== -1) {
            const afterKeyword = text.substring(keywordIndex + keyword.length)
            // 查找账号值（纯数字，10-30位）
            const accountMatch = afterKeyword.match(/[：:]?([\d]{10,30})/)
            if (accountMatch && accountMatch[1]) {
              return accountMatch[1]
            }
          }
        }
        // 如果都没找到，尝试在整个文本中查找长数字串（可能是账号）
        const allNumbersMatch = text.match(/([\d]{12,30})/)
        if (allNumbersMatch && allNumbersMatch[1]) {
          // 验证：这个数字串不应该在税号位置（税号通常包含字母）
          const taxNoIndex = text.indexOf('税号')
          const accountIndex = text.indexOf(allNumbersMatch[1])
          if (taxNoIndex === -1 || accountIndex > taxNoIndex + 20) {
            return allNumbersMatch[1]
          }
        }
        return null
      }

      // 辅助函数：智能提取银行名称
      const extractBank = () => {
        // 优先处理"开户银行:"格式（提取到"银行账号:"之前，允许包含"银行"关键词）
        // 使用更精确的匹配：提取到"银行账号:"或"账号:"之前的所有内容
        const bankAccountKeywordMatch = text.match(/开户银行[：:]?([^：:]+?)(?=银行账号[：:]|账号[：:]|账户[：:]|$)/i)
        if (bankAccountKeywordMatch && bankAccountKeywordMatch[1]) {
          const bankPart = bankAccountKeywordMatch[1].trim()
          if (/银行|支行|分行|营业部/i.test(bankPart)) {
            return bankPart
          }
        }
        // 处理"开户行:"格式（提取到"银行账号:"或账号数字之前）
        const bankKeywordMatch = text.match(/开户行[：:]?([^：:]+?)(?=银行账号[：:]|账号[：:]|账户[：:]|[\d]{10,}|$)/i)
        if (bankKeywordMatch && bankKeywordMatch[1]) {
          const bankPart = bankKeywordMatch[1].trim()
          if (/银行|支行|分行|营业部/i.test(bankPart)) {
            return bankPart
          }
        }
        // 如果上面没匹配到，尝试更宽松的匹配（提取到"银行账号"关键词之前，不要求冒号）
        const bankAccountKeywordMatch2 = text.match(/开户银行[：:]?([^：:]+?)(?=银行账号|账号|账户)/i)
        if (bankAccountKeywordMatch2 && bankAccountKeywordMatch2[1]) {
          const bankPart = bankAccountKeywordMatch2[1].trim()
          // 确保提取的内容包含完整的银行名称（以"支行"、"分行"等结尾）
          if (/银行|支行|分行|营业部/i.test(bankPart) && bankPart.length > 5) {
            return bankPart
          }
        }
        // 优先处理"开户行账号"这种组合字段
        const bankAccountMatch = text.match(/开户行账号[：:]?([^：:\d]+?银行[^：:\d]*?支行?[^：:\d]*?)([\d]{10,30})/i)
        if (bankAccountMatch && bankAccountMatch[1]) {
          const bankPart = bankAccountMatch[1].trim()
          if (/银行|支行|分行|营业部/i.test(bankPart)) {
            return bankPart
          }
        }
        // 如果上面没找到，尝试更宽松的匹配（提取到数字之前的所有内容）
        const bankAccountMatch2 = text.match(/开户行账号[：:]?([^：:\d]+?)(?=[\d]{10,})/i)
        if (bankAccountMatch2 && bankAccountMatch2[1]) {
          const bankPart = bankAccountMatch2[1].trim()
          if (/银行|支行|分行|营业部|股份|有限/i.test(bankPart)) {
            return bankPart
          }
        }
        // 尝试在"开户银行"关键词后查找（提取到"银行账号"或账号数字之前）
        const bankKeywords = ['开户银行', '开户行']
        for (const keyword of bankKeywords) {
          const keywordIndex = text.search(new RegExp(keyword + '[：:]?', 'i'))
          if (keywordIndex !== -1) {
            const afterKeyword = text.substring(keywordIndex + keyword.length)
            // 优先提取到"银行账号:"之前的内容（要求有冒号，避免在"银行"处停止）
            const bankMatch = afterKeyword.match(/[：:]?([^：:]+?)(?=银行账号[：:]|账号[：:]|账户[：:])/i)
            if (bankMatch && bankMatch[1]) {
              const bankPart = bankMatch[1].trim()
              if (/银行|支行|分行|营业部/i.test(bankPart) && bankPart.length > 5) {
                return bankPart
              }
            }
            // 如果没有找到带冒号的"银行账号"，尝试提取到"银行账号"关键词之前
            const bankMatch2 = afterKeyword.match(/[：:]?([^：:]+?)(?=银行账号|账号|账户)/i)
            if (bankMatch2 && bankMatch2[1]) {
              const bankPart = bankMatch2[1].trim()
              // 确保提取的内容是完整的（以"支行"、"分行"等结尾，或者长度足够）
              if (/银行|支行|分行|营业部/i.test(bankPart) && (bankPart.endsWith('支行') || bankPart.endsWith('分行') || bankPart.endsWith('营业部') || bankPart.length > 10)) {
                return bankPart
              }
            }
            // 最后尝试提取到账号数字之前的内容
            const bankMatch3 = afterKeyword.match(/[：:]?([^：:\d]+?)(?=[\d]{10,})/i)
            if (bankMatch3 && bankMatch3[1]) {
              const bankPart = bankMatch3[1].trim()
              if (/银行|支行|分行|营业部|股份|有限/i.test(bankPart) && bankPart.length > 5) {
                return bankPart
              }
            }
          }
        }
        // 最后尝试标准格式（作为备选）
        const standardMatch = extractField([
          '开户银行', '开户行', '银行名称', '银行'
        ], ['账号', '账户', '地址', '公司', '单位', '电话', '联系'])
        if (standardMatch) {
          // 验证银行名称格式：通常包含"银行"、"支行"等关键词
          if (/银行|支行|分行|营业部/i.test(standardMatch)) {
            return standardMatch
          }
        }
        return null
      }

      // 辅助函数：智能提取地址
      const extractAddress = () => {
        // 先尝试标准格式
        const standardMatch = extractField([
          '地址', '联系地址', '注册地址', '公司地址', '单位地址'
        ], ['开户', '银行', '账号', '账户', '公司', '单位', '电话', '联系'])
        if (standardMatch) {
          return standardMatch
        }
        // 尝试在"地址"关键词后查找
        const addressIndex = text.search(/地址[：:]?/i)
        if (addressIndex !== -1) {
          const afterAddress = text.substring(addressIndex)
          // 提取地址值（到"开户行账号"或"开户"之前）
          let addressMatch = afterAddress.match(/地址[：:]?([^：:]+?)(?=开户行账号|开户|银行|账号|账户|电话|$)/i)
          if (addressMatch && addressMatch[1]) {
            const addr = addressMatch[1].trim()
            // 验证地址格式：通常包含"市"、"区"、"号"、"路"、"街"等关键词
            if (/市|区|县|号|路|街|道|村|镇|省|市|县/i.test(addr)) {
              return addr
            }
          }
          // 如果没有找到标准格式，尝试提取到"开户行账号"之前的所有内容
          addressMatch = afterAddress.match(/地址[：:]?(.+?)(?=开户行账号)/i)
          if (addressMatch && addressMatch[1]) {
            const addr = addressMatch[1].trim()
            if (addr.length > 5 && /市|区|县|号|路|街|道/i.test(addr)) {
              return addr
            }
          }
        }
        return null
      }

      // 1. 单位名称 - 支持多种格式（包括"公司名"这种简写）
      const unitNamePatterns = [
        '单位名称', '公司名称', '公司名', '企业名称', '名称'
      ]
      const nextFieldsForName = ['税号', '地址', '开户', '银行', '账号', '电话', '联系']
      let unitName = extractField(unitNamePatterns, nextFieldsForName)
      if (unitName) {
        this.$set(this.model, 'partyAName', unitName)
      }

      // 2. 税号 - 使用智能提取
      const taxNo = extractTaxNo()
      if (taxNo) {
        this.$set(this.model, 'partyATaxNo', taxNo)
      }

      // 3. 地址 - 使用智能提取
      const address = extractAddress()
      if (address) {
        this.$set(this.model, 'partyAAddress', address)
      }

      // 4. 开户银行 - 使用智能提取（需要在账号之前提取）
      const bank = extractBank()
      if (bank) {
        this.$set(this.model, 'partyABank', bank)
      }

      // 5. 账号 - 使用智能提取
      const account = extractAccount()
      if (account) {
        this.$set(this.model, 'partyAAccount', account)
      }

      // 6. 电话
      const phonePatterns = [
        '电话', '联系电话', '手机', '固定电话', '座机', '电话号码'
      ]
      const nextFieldsForPhone = ['公司', '单位', '税号', '地址', '开户', '银行', '账号']
      const phone = extractField(phonePatterns, nextFieldsForPhone)
      if (phone) {
        this.$set(this.model, 'partyAPhone', phone)
      }

      this.$message.success('甲方信息识别完成')
    },
    // 清空智能识别文本
    clearPartyAIntelligentText() {
      this.partyAIntelligentText = ''
    },
    // 项目远程搜索
    handleProjectSearch(value) {
      // 清除之前的定时器
      if (this.projectSearchTimer) {
        clearTimeout(this.projectSearchTimer)
      }

      // 防抖处理，300ms后执行搜索
      this.projectSearchTimer = setTimeout(() => {
        const searchValue = value ? value.trim() : ''
        // 使用分页接口，只加载前20条
        this.loadProjectList(searchValue, 1, 20)
      }, 300)
    },
    // 加载项目列表（分页）
    loadProjectList(searchValue, pageNo = 1, pageSize = 20) {
      this.projectLoading = true
      // 构建查询参数
      const params = {
        pageNo: pageNo,
        pageSize: pageSize
      }
      if (searchValue) {
        // 如果有搜索值，使用模糊查询
        params.proName = `*${searchValue}*`
      }

      getAction('/projectmanage/list', params).then(res => {
        this.projectLoading = false
        if (res.success) {
          // list 接口返回分页格式
          let list = []
          if (res.result && Array.isArray(res.result.records)) {
            list = res.result.records
          } else if (Array.isArray(res.result)) {
            list = res.result
          }
          let filteredList = list.filter(item => item.delFlag !== '1')
          // 确保选项的 value 类型一致（统一为字符串），并更新缓存
          this.projectOptions = filteredList.map(item => {
            const projectItem = {
              ...item,
              id: String(item.id) // 统一转换为字符串
            }
            // 更新缓存
            this.projectCache[String(item.id)] = projectItem
            return projectItem
          })
          if (searchValue && this.projectOptions.length === 0) {
            this.$message.info('未找到匹配的项目')
          }
        } else {
          this.$message.warning(res.message || '搜索失败')
          this.projectOptions = []
        }
      }).catch(error => {
        this.projectLoading = false
        console.error('搜索项目失败:', error)
        this.$message.error('搜索项目失败，请稍后重试')
        this.projectOptions = []
      })
    },
    // 项目选择变化
    handleProjectChange(value) {
      // value 是数组，统一转换为字符串数组，使用 $set 确保响应式
      const proIdArray = value ? value.map(v => String(v)) : []
      this.$set(this.model, 'proIdArray', proIdArray)
      console.log('项目选择变化 - value:', value)
      console.log('项目选择变化 - proIdArray:', proIdArray)
      console.log('项目选择变化 - model.proIdArray:', this.model.proIdArray)
      console.log('项目选择变化 - projectOptions:', this.projectOptions.map(item => ({ id: item.id, idType: typeof item.id })))
    },
    // 项目选择器获得焦点时，如果没有选项，触发一次搜索
    handleProjectFocus() {
      // 焦点时不做处理，等待用户输入
    },
    // 下拉框显示/隐藏时处理
    handleProjectDropdownVisible(open) {
      if (open && this.projectOptions.length === 0 && !this.projectLoading) {
        // 下拉框打开时，如果没有数据，加载前20条数据
        this.loadProjectList('', 1, 20)
      }
    },
    // 加载已选中的项目信息（用于编辑时显示）
    loadSelectedProjects(ids) {
      if (!ids || ids.length === 0) return
      // 批量查询已选中的项目
      const promises = ids.map(id => {
        // 如果缓存中已有，直接返回
        if (this.projectCache[String(id)]) {
          return Promise.resolve({ success: true, result: this.projectCache[String(id)] })
        }
        // 否则查询
        return getAction('/projectmanage/queryById', { id })
      })
      Promise.all(promises).then(results => {
        const projects = results
          .filter(res => res.success && res.result)
          .map(res => ({
            ...res.result,
            id: String(res.result.id) // 统一转换为字符串
          }))
        // 将查询到的项目添加到选项中，并更新缓存
        projects.forEach(project => {
          // 更新缓存
          this.projectCache[String(project.id)] = project
          // 添加到选项列表（如果不存在）
          if (!this.projectOptions.find(item => String(item.id) === String(project.id))) {
            this.projectOptions.push(project)
          }
        })
      })
    },
    // 文件上传前处理
    beforeUpload(file) {
      // 阻止自动上传，手动控制
      // 将文件对象添加到列表，确保保留原始 File 对象
      this.fileList = [...this.fileList, {
        uid: file.uid || Date.now() + Math.random(),
        name: file.name,
        status: 'done',
        originFileObj: file, // 保存原始文件对象
        file: file // 也保存一份，以防万一
      }]
      return false
    },
    // 移除文件
    handleRemove(file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    }
  }
}
</script>

<style scoped></style>
