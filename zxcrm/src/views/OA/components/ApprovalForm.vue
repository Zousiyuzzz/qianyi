<template>
  <div>
    <a-spin :spinning="confirmLoading || parsingProcess">
      <!-- 表单区域 -->
      <div v-if="!isPreviewMode">
        <!-- 合同审批表单 -->
        <j-form-container v-if="isContractApproval" :disabled="formDisabled">
          <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
            <a-row>
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
                <a-form-model-item label="合作方式" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="collaborationMode">
                  <a-select v-model="model.collaborationMode" placeholder="请选择合作方式" style="width: 100%">
                    <a-select-option value="0">预付</a-select-option>
                    <a-select-option value="1">垫付</a-select-option>
                    <a-select-option value="2">服务费</a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="24">
                <a-form-model-item label="账期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="repayDay">
                  <a-input-number v-model="model.repayDay" placeholder="请输入账期（天）" style="width: 100%" :min="0"
                    :precision="0" />
                </a-form-model-item>
              </a-col>
              <a-col :span="24">
                <a-form-model-item label="授信额度" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="creditLimit">
                  <a-input-number v-model="model.creditLimit" placeholder="请输入授信额度" style="width: 100%" :min="0"
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

        <!-- 项目退款审批表单 -->
        <project-refund-form v-else-if="isProjectRefundApproval" ref="projectRefundForm" v-model="model"
          :disabled="formDisabled" />

        <!-- 临时授信审批表单 -->
        <project-temp-credit-form v-else-if="isProjectTempCreditApproval" ref="projectTempCreditForm" v-model="model"
          :disabled="formDisabled" />
      </div>

      <!-- 预览模式：表单只读显示 -->
      <div v-if="isPreviewMode" class="preview-mode">
        <!-- 合同审批表单预览 -->
        <div v-if="isContractApproval" class="form-preview-section">
          <h3 class="section-title">表单信息</h3>
          <div class="form-info">
            <div class="form-item">
              <div class="form-label">项目：</div>
              <div class="form-value">{{ getProjectNames() }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">签约日期：</div>
              <div class="form-value">{{ model.signDate || '-' }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">截止日期：</div>
              <div class="form-value">{{ model.endDate || '-' }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">合作方式：</div>
              <div class="form-value">{{ getCollaborationModeText(model.collaborationMode) }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">账期：</div>
              <div class="form-value">{{ model.repayDay != null && model.repayDay !== '' ? model.repayDay + ' 天' :
                '-' }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">授信额度：</div>
              <div class="form-value">{{ model.creditLimit != null && model.creditLimit !== '' ? model.creditLimit +
                ' 元' : '-' }}</div>
            </div>
            <div class="form-divider">甲方信息</div>
            <div class="form-item">
              <div class="form-label">甲方单位名称：</div>
              <div class="form-value">{{ model.partyAName || '-' }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">甲方税号：</div>
              <div class="form-value">{{ model.partyATaxNo || '-' }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">甲方开户银行：</div>
              <div class="form-value">{{ model.partyABank || '-' }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">甲方银行账号：</div>
              <div class="form-value">{{ model.partyAAccount || '-' }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">甲方地址：</div>
              <div class="form-value">{{ model.partyAAddress || '-' }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">甲方电话：</div>
              <div class="form-value">{{ model.partyAPhone || '-' }}</div>
            </div>
            <div class="form-divider">乙方信息</div>
            <div class="form-item">
              <div class="form-label">乙方单位名称：</div>
              <div class="form-value">{{ model.accountName || '-' }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">邮寄信息：</div>
              <div class="form-value">{{ model.remark || '-' }}</div>
            </div>
            <div class="form-item" v-if="fileList && fileList.length > 0">
              <div class="form-label">附件：</div>
              <div class="form-value">
                <div v-for="(file, index) in fileList" :key="index" class="file-item">
                  <a-icon type="file" />
                  <span>{{ file.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 项目退款审批表单预览 -->
        <div v-else-if="isProjectRefundApproval" class="form-preview-section">
          <h3 class="section-title">表单信息</h3>
          <div class="form-info">
            <div class="form-item">
              <div class="form-label">项目：</div>
              <div class="form-value">{{ getProjectRefundProjectName() }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">退款金额：</div>
              <div class="form-value">{{ model.refundAmount != null ? model.refundAmount + ' 元' : '-' }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">资金性质：</div>
              <div class="form-value">{{ model.fundsNature == '1' ? '对公' : model.fundsNature == '2' ? '对私' : '-' }}
              </div>
            </div>
            <div class="form-item">
              <div class="form-label">项目主体：</div>
              <div class="form-value">{{ model.customerTitle || '-' }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">我方主体：</div>
              <div class="form-value">{{ model.ourTitle || '-' }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">备注：</div>
              <div class="form-value">{{ model.remarks || '-' }}</div>
            </div>
          </div>
        </div>

        <!-- 临时授信审批表单预览 -->
        <div v-else-if="isProjectTempCreditApproval" class="form-preview-section">
          <h3 class="section-title">表单信息</h3>
          <div class="form-info">
            <div class="form-item">
              <div class="form-label">项目：</div>
              <div class="form-value">{{ model.proName || '-' }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">临时授信金额：</div>
              <div class="form-value">{{ model.tempAmount != null ? model.tempAmount + ' 元' : '-' }}</div>
            </div>
            <!-- <div class="form-item">
              <div class="form-label">临时授信生效日期：</div>
              <div class="form-value">{{ model.startDate || '-' }}</div>
            </div> -->
            <div class="form-item">
              <div class="form-label">临时授信到期日期：</div>
              <div class="form-value">{{ model.endDate || '-' }}</div>
            </div>
            <div class="form-item" v-if="model.hasContract === '1' || model.contractId">
              <div class="form-label">合同：</div>
              <div class="form-value">{{ model.contractName || '-' }}</div>
            </div>
            <div class="form-item">
              <div class="form-label">备注：</div>
              <div class="form-value">{{ model.remark || '-' }}</div>
            </div>
          </div>
        </div>

        <!-- 流程详情 -->
        <div class="process-preview-section">
          <h3 class="section-title">流程信息</h3>
          <div class="process-header">
            <div class="process-info-item">
              <span class="info-label">流程名称：</span>
              <span class="info-value">{{ processConfig ? processConfig.processName : '-' }}</span>
            </div>
            <div class="process-info-item">
              <span class="info-label">业务类型：</span>
              <span class="info-value">{{ processConfig ? processConfig.businessType : '-' }}</span>
            </div>
          </div>

          <div class="process-flow">
            <div class="flow-container">
              <div v-for="(node, index) in sortedNodes" :key="node.node_id" class="flow-node-wrapper">
                <div class="flow-node" :class="getNodeClass(node.node_key)">
                  <div class="node-number">{{ index + 1 }}</div>
                  <div class="node-title">{{ node.node_name }}</div>
                  <div class="node-details">
                    <div class="node-type">节点类型：{{ getNodeTypeName(node.node_key) }}</div>
                    <div v-if="node.assignee_type" class="node-assignee">
                      <span class="assignee-label">审批人类型：</span>
                      <span class="assignee-value">{{ getAssigneeTypeName(node.assignee_type) }}</span>
                    </div>
                    <div v-if="node.user_ids" class="node-users">
                      <span class="users-label">审批人：</span>
                      <span class="users-value">{{ getAssigneeNames(node) }}</span>
                    </div>
                    <div v-if="node.operation && node.node_key !== 'operation'" class="node-operation">
                      <span class="operation-label">操作方式：</span>
                      <span class="operation-value">{{ node.operation === 'and' ? '全部通过' : '任一通过' }}</span>
                    </div>
                    <div v-if="node.node_key === 'operation' && node.operation_type" class="node-operation">
                      <span class="operation-label">操作类型：</span>
                      <span class="operation-value">{{ getOperationTypeName(node.operation_type) }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="index < sortedNodes.length - 1" class="flow-arrow">
                  <a-icon type="arrow-right" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
    <select-bank-account-modal ref="selectAccountModal" @select="handleAccountSelect"></select-bank-account-modal>
  </div>
</template>

<script>
import { httpAction, getAction, postAction } from '@/api/manage'
import SelectBankAccountModal from '@/views/contranct/modules/SelectBankAccountModal'
import ApprovalPreview from './ApprovalPreview'
import ProjectRefundForm from '../form/ProjectRefundForm'
import ProjectTempCreditForm from '../form/ProjectTempCreditForm'
import { getOperationTypeLabel } from '@/views/OA/config/operationTypes'
import { getFormConfig, getAllFormConfigs } from './ApprovalForm/formConfig'
import { DataLoader } from '../flow/DataLoader'
import { ProcessParser } from '../flow/ProcessParser'
import { DataParser } from './ApprovalForm/modules/dataParser'

export default {
  name: 'ApprovalForm',
  components: {
    SelectBankAccountModal,
    ApprovalPreview,
    ProjectRefundForm,
    ProjectTempCreditForm
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    businessType: {
      type: String,
      default: ''
    },
    showPreview: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      model: {
        proIdArray: [],
        businessType: '',
        collaborationMode: null,
        repayDay: null,
        creditLimit: null
      },
      processConfig: null,
      parsedNodes: [],
      parsingProcess: false,
      userMap: {},
      deptMap: {},
      roleMap: {},
      userList: [], // 用户列表（从API获取）
      deptTree: [], // 部门树（从API获取）
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
      projectOptions: [],
      projectCache: {},
      projectLoading: false,
      projectSearchTimer: null,
      fileList: [],
      partyAIntelligentText: '', // 甲方信息智能识别文本
      validatorRules: {},
      url: {
        add: '/contractInfo/add',
        edit: '/contractInfo/edit',
        queryById: '/contractInfo/queryById',
        // 项目退款相关接口
        projectRefundAdd: '/projectRefundRecord/refundRequest',
        projectRefundEdit: '/projectRefundRecord/edit',
        projectRefundQueryById: '/projectRefundRecord/queryById',
        // 临时授信相关接口
        projectTempCreditAdd: '/projectTempCredit/add',
        projectTempCreditEdit: '/projectTempCredit/edit',
        projectTempCreditQueryById: '/projectTempCredit/queryById'
      }
    }
  },
  computed: {
    // 使用 prop 的 showPreview，不需要 watch
    isPreviewMode() {
      return this.showPreview
    },
    isContractApproval() {
      const businessType = this.model.businessType || this.businessType || ''
      return businessType === 'contranct' || businessType === 'contract' || businessType === '1'
    },
    isProjectRefundApproval() {
      const businessType = this.model.businessType || this.businessType || ''
      return businessType === 'projectRefund'
    },
    isProjectTempCreditApproval() {
      const businessType = this.model.businessType || this.businessType || ''
      return businessType === 'projectTempCredit'
    },
    // 按流程顺序排序节点
    sortedNodes() {
      if (!this.parsedNodes || this.parsedNodes.length === 0) {
        return []
      }

      const startNode = this.parsedNodes.find(n => n.node_key === 'start')
      if (!startNode) {
        return this.parsedNodes
      }

      // 使用同步到 context 的数据（processParser 会同步数据）
      if (this.processConfig && this.processConfig.nodes) {
        try {
          const nodesConfig = JSON.parse(this.processConfig.nodes)
          return this.processParser.sortNodesByFlow(nodesConfig, this.parsedNodes, this.model)
        } catch (e) {
          console.error('解析节点配置失败:', e)
        }
      }

      const typeOrder = { 'start': 1, 'user': 2, 'condition': 2, 'cc': 3, 'end': 4 }
      return [...this.parsedNodes].sort((a, b) => {
        const orderA = typeOrder[a.node_key] || 5
        const orderB = typeOrder[b.node_key] || 5
        return orderA - orderB
      })
    }
  },
  created() {
    this.defaultModel = JSON.parse(JSON.stringify(this.model))
    // 初始化模块
    this.dataLoader = new DataLoader(this)
    this.processParser = new ProcessParser(this, this.dataLoader)
    this.dataParser = new DataParser(this)
  },
  methods: {
    /**
     * 安全获取表单数据（如果 ref 不存在，使用 model）
     */
    async getFormDataSafely(businessType) {
      const formConfig = getFormConfig(businessType)
      if (!formConfig) {
        throw new Error(`未找到业务类型 ${businessType} 的表单配置`)
      }

      // 尝试从 ref 获取（如果存在）
      const formRef = this.$refs[formConfig.refName]
      if (formRef) {
        try {
          // 调用 submitDataParser 来转换数据（包括 proIdArray 转 proId）
          return await this.dataParser.getFormData(businessType)
        } catch (error) {
          console.warn('从 ref 获取表单数据失败，尝试手动转换:', error)
        }
      }

      // 如果 ref 不存在（预览模式），手动调用 submitDataParser 来转换数据
      // 注意：这种情况下没有验证，数据应该已经在进入预览模式前验证过了
      const data = Object.assign({}, this.model)

      // 创建一个模拟的表单引用，用于预览模式
      // 对于回调式验证（如合同审批），validate 方法接收 callback
      // 对于 Promise 式验证（如项目退款），validate 方法返回 Promise
      const that = this
      const mockFormRef = {
        validate: (callback) => {
          // 如果是回调式验证（有 callback 参数）
          if (typeof callback === 'function') {
            callback(true)
          } else {
            // 如果是 Promise 式验证，返回 Promise，resolve 时返回 model
            return Promise.resolve(that.model)
          }
        }
      }

      try {
        // 调用 submitDataParser 来转换数据（特别是 proIdArray 转 proId）
        const convertedData = await formConfig.submitDataParser(mockFormRef, this)
        return convertedData
      } catch (error) {
        console.warn('预览模式下转换数据失败，使用原始 model:', error)
        // 如果转换失败，至少手动转换 proIdArray 为 proId（合同审批的特殊处理）
        if (businessType === 'contranct' || businessType === 'contract' || businessType === '1') {
          if (data.proIdArray && Array.isArray(data.proIdArray) && data.proIdArray.length > 0) {
            data.proId = data.proIdArray.join(',')
            delete data.proIdArray
          }
        }
        return data
      }
    },
    add(businessType) {
      // 重置所有状态
      this.confirmLoading = false
      this.parsingProcess = false
      this.model = Object.assign({}, this.defaultModel)
      this.model.proId = ''
      this.model.proIdArray = []
      this.model.businessType = businessType || this.businessType || ''

      // 如果是项目退款，初始化项目退款相关字段
      if (this.model.businessType === 'projectRefund') {
        this.model = {
          ...this.model,
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
          accountName: '',
          partyAAccount: '',
          partyAName: '',
          partyATaxNo: '',
          partyABank: '',
          partyAAddress: '',
          partyAPhone: ''
        }
      }

      // 如果是临时授信，初始化临时授信相关字段
      if (this.model.businessType === 'projectTempCredit') {
        this.model = {
          ...this.model,
          proId: '',
          proIdArray: [],
          proName: '',
          tempAmount: null,
          startDate: null,
          endDate: null,
          remark: ''
        }
      }

      this.fileList = []
      this.projectOptions = []
      this.partyAIntelligentText = '' // 清空智能识别文本
      this.loadProjectList('', 1, 20)
      this.visible = true
      this.formDisabled = this.disabled
    },
    edit(record) {
      this.model = Object.assign({}, record)
      if (this.model.proId && typeof this.model.proId === 'string') {
        const proIdArray = this.model.proId.split(',').filter(id => id.trim()).map(id => String(id))
        this.$set(this.model, 'proIdArray', proIdArray)
        if (proIdArray.length > 0) {
          this.loadSelectedProjects(proIdArray)
        }
      } else {
        this.$set(this.model, 'proIdArray', [])
      }
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
      this.projectOptions = []
      this.loadProjectList('', 1, 20)
      this.visible = true
      this.formDisabled = this.disabled
    },
    // 解析流程配置并显示预览
    async parseAndPreview() {
      return new Promise(async (resolve, reject) => {
        // 根据业务类型选择不同的表单引用
        let formRef = null
        if (this.isProjectRefundApproval) {
          formRef = this.$refs.projectRefundForm
        } else if (this.isProjectTempCreditApproval) {
          formRef = this.$refs.projectTempCreditForm
        } else {
          formRef = this.$refs.form
        }

        if (!formRef) {
          reject(new Error('表单引用不存在'))
          return
        }

        try {
          console.log('开始表单验证...')
          // 项目退款和临时授信表单使用 validate() 方法返回 Promise
          // 合同审批表单使用 validate() 方法需要传入回调
          let valid = false
          if (this.isProjectRefundApproval || this.isProjectTempCreditApproval) {
            try {
              await formRef.validate()
              valid = true
            } catch (err) {
              console.error('表单验证出错:', err)
              valid = false
            }
          } else {
            valid = await new Promise((resolve) => {
              formRef.validate((isValid) => {
                resolve(isValid)
              })
            }).catch((err) => {
              console.error('表单验证出错:', err)
              return false
            })
          }
          if (!valid) {
            console.error('表单验证失败')
            this.$message.warning('请检查表单必填项')
            reject(new Error('表单验证失败，请检查必填项'))
            return
          }
          console.log('表单验证通过')

          // 输出原始节点数据（预览时）
          console.log('=== 预览时的原始节点数据 ===')
          console.log(JSON.stringify(this.parsedNodes, null, 2))
        } catch (error) {
          console.error('表单验证异常:', error)
          reject(new Error('表单验证出错: ' + (error.message || '未知错误')))
          return
        }

        this.parsingProcess = true
        try {
          // 先加载用户和部门数据（用于条件判断和用户解析）
          await this.dataLoader.loadUserAndDeptData()

          // 再获取流程配置
          const businessType = this.model.businessType || this.businessType || ''
          try {
            await this.processParser.loadProcessConfig(businessType)
          } catch (error) {
            this.parsingProcess = false
            reject(error)
            return
          }

          // 加载审批人名称
          await this.dataLoader.loadAssigneeNames(this.parsedNodes)

          // 显示预览页面（通过事件通知父组件）
          this.parsingProcess = false
          // 通知父组件预览已准备好
          this.$emit('preview-ready')
          // 通知父组件状态变化
          this.$emit('update:showPreview', true)
          resolve()
        } catch (error) {
          this.parsingProcess = false
          reject(error)
        }
      })
    },
    // 提交表单（先显示预览）
    async submitForm() {
      const that = this
      // 根据业务类型选择不同的表单验证
      if (this.isProjectRefundApproval) {
        // 确保表单引用存在
        if (!this.$refs.projectRefundForm) {
          this.$message.error('表单未初始化，请刷新页面重试')
          return
        }
        try {
          await this.$refs.projectRefundForm.validate()
          // 先获取流程配置
          const businessType = this.model.businessType || this.businessType || ''
          await this.processParser.loadProcessConfig(businessType)
          // 显示预览页面（通过事件通知父组件）
          this.$emit('update:showPreview', true)
        } catch (error) {
          console.error('项目退款表单验证失败:', error)
          this.$message.error('表单验证失败：' + (error.message || '请检查表单数据'))
        }
      } else if (this.isProjectTempCreditApproval) {
        // 确保表单引用存在
        if (!this.$refs.projectTempCreditForm) {
          this.$message.error('表单未初始化，请刷新页面重试')
          return
        }
        try {
          await this.$refs.projectTempCreditForm.validate()
          // 先获取流程配置
          const businessType = this.model.businessType || this.businessType || ''
          await this.processParser.loadProcessConfig(businessType)
          // 显示预览页面（通过事件通知父组件）
          this.$emit('update:showPreview', true)
        } catch (error) {
          console.error('临时授信表单验证失败:', error)
          this.$message.error('表单验证失败：' + (error.message || '请检查表单数据'))
        }
      } else {
        // 合同审批表单验证
        if (!this.$refs.form) {
          this.$message.error('表单未初始化，请刷新页面重试')
          return
        }
        this.$refs.form.validate(async valid => {
          if (valid) {
            // 先获取流程配置
            const businessType = this.model.businessType || this.businessType || ''
            await this.processParser.loadProcessConfig(businessType)

            // 显示预览页面（通过事件通知父组件）
            this.$emit('update:showPreview', true)
          }
        })
      }
    },
    // 确认提交（供外部调用）
    confirmSubmit() {
      this.confirmSubmitInternal()
    },
    // 确认提交（内部方法）
    async confirmSubmitInternal() {
      const that = this
      that.confirmLoading = true

      try {
        // 获取当前业务类型
        const businessType = this.model.businessType || this.businessType || ''
        const formConfig = getFormConfig(businessType)

        if (!formConfig) {
          throw new Error(`未找到业务类型 ${businessType} 的表单配置`)
        }

        // 安全获取表单数据
        let submitData
        try {
          submitData = await this.getFormDataSafely(businessType)
          // 调试：打印提交前的数据
          console.log('提交前的数据 (submitData):', submitData)
        } catch (error) {
          console.error('获取表单数据失败:', error)
          that.$message.error('表单验证失败：' + (error.message || '请检查表单数据'))
          that.confirmLoading = false
          return
        }

        // 确定 URL 和 method
        let httpurl = ''
        let method = ''
        if (!submitData.id) {
          httpurl = formConfig.api.add
          method = 'post'
        } else {
          httpurl = formConfig.api.edit
          method = 'put'
        }

        // 根据提交类型构建请求数据
        let requestData
        if (formConfig.submitType === 'json') {
          // JSON 格式提交
          requestData = await this.dataParser.buildSubmitData(
            submitData,
            this.processConfig,
            this.parsedNodes,
            this.processParser
          )
        } else {
          // FormData 格式提交
          const formData = this.dataParser.buildFormData(
            submitData,
            this.processConfig,
            this.parsedNodes,
            this.processParser,
            this.fileList
          )
          await this.dataParser.addProcessNodesToFormData(
            formData,
            this.processConfig,
            this.parsedNodes,
            this.processParser,
            submitData
          )
          requestData = formData
        }

        // 提交数据
        if (formConfig.submitType === 'json') {
          postAction(httpurl, requestData)
            .then(res => {
              if (res.success) {
                that.$message.success(res.message)
                that.confirmLoading = false // 重置 loading 状态
                that.$emit('update:showPreview', false)
                that.$emit('ok')
              } else {
                that.$message.error(res.message || '提交失败')
                that.confirmLoading = false
                that.$emit('submit-error')
              }
            })
            .catch(error => {
              console.error('提交失败:', error)
              that.$message.error(error.message || '提交失败，请稍后重试')
              that.confirmLoading = false
              that.$emit('submit-error')
            })
        } else {
          httpAction(httpurl, requestData, method)
            .then(res => {
              if (res.success) {
                that.$message.success(res.message)
                that.confirmLoading = false // 重置 loading 状态
                that.$emit('update:showPreview', false)
                that.$emit('ok')
              } else {
                that.$message.error(res.message || '提交失败')
                that.confirmLoading = false
                that.$emit('submit-error')
              }
            })
            .catch(error => {
              console.error('提交失败:', error)
              that.$message.error(error.message || '提交失败，请稍后重试')
              that.confirmLoading = false
              that.$emit('submit-error')
            })
        }
      } catch (error) {
        console.error('提交过程出错:', error)
        that.$message.error(error.message || '提交失败，请稍后重试')
        that.confirmLoading = false
        that.$emit('submit-error')
      }
    },
    // 取消预览，返回编辑
    cancelPreview() {
      this.$emit('update:showPreview', false)
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
    handleProjectChange(value) {
      const proIdArray = value ? value.map(v => String(v)) : []
      this.$set(this.model, 'proIdArray', proIdArray)
    },
    handleProjectDropdownVisible(open) {
      if (open && this.projectOptions.length === 0 && !this.projectLoading) {
        this.loadProjectList('', 1, 20)
      }
    },
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
    beforeUpload(file) {
      this.fileList = [...this.fileList, {
        uid: file.uid || Date.now() + Math.random(),
        name: file.name,
        status: 'done',
        originFileObj: file,
        file: file
      }]
      return false
    },
    handleRemove(file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    },
    // 解析甲方信息 - 增强版，支持多种格式
    parsePartyAInfo() {
      if (!this.partyAIntelligentText || !this.partyAIntelligentText.trim()) {
        return
      }

      let text = this.partyAIntelligentText.trim()
      text = text.replace(/[：:]/g, ':')

      const extractField = (patterns, nextFieldPatterns = []) => {
        for (const pattern of patterns) {
          let match = text.match(new RegExp(pattern + '[：:]\\s*([^\\n\\r：:]+?)(?=\\n|$|' + nextFieldPatterns.join('|') + ')', 'i'))
          if (match && match[1]) {
            return match[1].trim()
          }
          match = text.match(new RegExp(pattern + '[：:]?([^\\n\\r：:]+?)(?=' + nextFieldPatterns.join('|') + ')', 'i'))
          if (match && match[1]) {
            return match[1].trim()
          }
        }
        return null
      }

      const extractTaxNo = () => {
        const standardMatch = extractField([
          '税号', '纳税人识别号', '统一社会信用代码', '信用代码', '纳税人代码'
        ], ['地址', '开户', '银行', '账号', '公司', '单位', '电话', '联系'])
        if (standardMatch) {
          const taxNoPattern = /^[A-Z0-9]{15,20}$/i
          if (taxNoPattern.test(standardMatch)) {
            return standardMatch
          }
          if (/^[A-Z0-9]{10,}$/i.test(standardMatch) && !/^[\d]{10,}$/.test(standardMatch)) {
            return standardMatch
          }
        }
        const taxNoIndex = text.search(/税号[：:]?/i)
        if (taxNoIndex !== -1) {
          const afterTaxNo = text.substring(taxNoIndex)
          const taxNoMatch = afterTaxNo.match(/税号[：:]?([A-Z0-9]{10,25}?)(?=地址|开户|银行|账号|公司|单位|电话)/i)
          if (taxNoMatch && taxNoMatch[1]) {
            const taxNo = taxNoMatch[1]
            if (taxNo.length >= 10 && /[A-Z]/i.test(taxNo)) {
              return taxNo
            }
          }
          const nextFieldMatch = afterTaxNo.match(/税号[：:]?([A-Z0-9]+?)(?=地址)/i)
          if (nextFieldMatch && nextFieldMatch[1] && nextFieldMatch[1].length >= 10) {
            return nextFieldMatch[1]
          }
        }
        return null
      }

      const extractAccount = () => {
        const standardMatch = extractField([
          '账号', '银行账号', '账户', '银行账户', '账户号'
        ], ['地址', '开户', '银行', '公司', '单位', '电话', '联系'])
        if (standardMatch) {
          const accountPattern = /^[\d]{10,30}$/
          if (accountPattern.test(standardMatch)) {
            return standardMatch
          }
        }
        const bankAccountMatch = text.match(/开户行账号[：:]?[^：:\d]*?([\d]{10,30})/i)
        if (bankAccountMatch && bankAccountMatch[1]) {
          return bankAccountMatch[1]
        }
        const accountKeywords = ['银行账号', '账号', '账户', '银行账户', '账户号']
        for (const keyword of accountKeywords) {
          const keywordIndex = text.search(new RegExp(keyword + '[：:]?', 'i'))
          if (keywordIndex !== -1) {
            const afterKeyword = text.substring(keywordIndex + keyword.length)
            const accountMatch = afterKeyword.match(/[：:]?([\d]{10,30})/)
            if (accountMatch && accountMatch[1]) {
              return accountMatch[1]
            }
          }
        }
        const allNumbersMatch = text.match(/([\d]{12,30})/)
        if (allNumbersMatch && allNumbersMatch[1]) {
          const taxNoIndex = text.indexOf('税号')
          const accountIndex = text.indexOf(allNumbersMatch[1])
          if (taxNoIndex === -1 || accountIndex > taxNoIndex + 20) {
            return allNumbersMatch[1]
          }
        }
        return null
      }

      const extractBank = () => {
        const bankAccountKeywordMatch = text.match(/开户银行[：:]?([^：:]+?)(?=银行账号[：:]|账号[：:]|账户[：:]|$)/i)
        if (bankAccountKeywordMatch && bankAccountKeywordMatch[1]) {
          const bankPart = bankAccountKeywordMatch[1].trim()
          if (/银行|支行|分行|营业部/i.test(bankPart)) {
            return bankPart
          }
        }
        const bankKeywordMatch = text.match(/开户行[：:]?([^：:]+?)(?=银行账号[：:]|账号[：:]|账户[：:]|[\d]{10,}|$)/i)
        if (bankKeywordMatch && bankKeywordMatch[1]) {
          const bankPart = bankKeywordMatch[1].trim()
          if (/银行|支行|分行|营业部/i.test(bankPart)) {
            return bankPart
          }
        }
        const bankAccountKeywordMatch2 = text.match(/开户银行[：:]?([^：:]+?)(?=银行账号|账号|账户)/i)
        if (bankAccountKeywordMatch2 && bankAccountKeywordMatch2[1]) {
          const bankPart = bankAccountKeywordMatch2[1].trim()
          if (/银行|支行|分行|营业部/i.test(bankPart) && bankPart.length > 5) {
            return bankPart
          }
        }
        const bankAccountMatch = text.match(/开户行账号[：:]?([^：:\d]+?银行[^：:\d]*?支行?[^：:\d]*?)([\d]{10,30})/i)
        if (bankAccountMatch && bankAccountMatch[1]) {
          const bankPart = bankAccountMatch[1].trim()
          if (/银行|支行|分行|营业部/i.test(bankPart)) {
            return bankPart
          }
        }
        const bankAccountMatch2 = text.match(/开户行账号[：:]?([^：:\d]+?)(?=[\d]{10,})/i)
        if (bankAccountMatch2 && bankAccountMatch2[1]) {
          const bankPart = bankAccountMatch2[1].trim()
          if (/银行|支行|分行|营业部|股份|有限/i.test(bankPart)) {
            return bankPart
          }
        }
        const bankKeywords = ['开户银行', '开户行']
        for (const keyword of bankKeywords) {
          const keywordIndex = text.search(new RegExp(keyword + '[：:]?', 'i'))
          if (keywordIndex !== -1) {
            const afterKeyword = text.substring(keywordIndex + keyword.length)
            const bankMatch = afterKeyword.match(/[：:]?([^：:]+?)(?=银行账号[：:]|账号[：:]|账户[：:])/i)
            if (bankMatch && bankMatch[1]) {
              const bankPart = bankMatch[1].trim()
              if (/银行|支行|分行|营业部/i.test(bankPart) && bankPart.length > 5) {
                return bankPart
              }
            }
            const bankMatch2 = afterKeyword.match(/[：:]?([^：:]+?)(?=银行账号|账号|账户)/i)
            if (bankMatch2 && bankMatch2[1]) {
              const bankPart = bankMatch2[1].trim()
              if (/银行|支行|分行|营业部/i.test(bankPart) && (bankPart.endsWith('支行') || bankPart.endsWith('分行') || bankPart.endsWith('营业部') || bankPart.length > 10)) {
                return bankPart
              }
            }
            const bankMatch3 = afterKeyword.match(/[：:]?([^：:\d]+?)(?=[\d]{10,})/i)
            if (bankMatch3 && bankMatch3[1]) {
              const bankPart = bankMatch3[1].trim()
              if (/银行|支行|分行|营业部|股份|有限/i.test(bankPart) && bankPart.length > 5) {
                return bankPart
              }
            }
          }
        }
        const standardMatch = extractField([
          '开户银行', '开户行', '银行名称', '银行'
        ], ['账号', '账户', '地址', '公司', '单位', '电话', '联系'])
        if (standardMatch) {
          if (/银行|支行|分行|营业部/i.test(standardMatch)) {
            return standardMatch
          }
        }
        return null
      }

      const extractAddress = () => {
        const standardMatch = extractField([
          '地址', '联系地址', '注册地址', '公司地址', '单位地址'
        ], ['开户', '银行', '账号', '账户', '公司', '单位', '电话', '联系'])
        if (standardMatch) {
          return standardMatch
        }
        const addressIndex = text.search(/地址[：:]?/i)
        if (addressIndex !== -1) {
          const afterAddress = text.substring(addressIndex)
          let addressMatch = afterAddress.match(/地址[：:]?([^：:]+?)(?=开户行账号|开户|银行|账号|账户|电话|$)/i)
          if (addressMatch && addressMatch[1]) {
            const addr = addressMatch[1].trim()
            if (/市|区|县|号|路|街|道|村|镇|省|市|县/i.test(addr)) {
              return addr
            }
          }
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

      // 1. 单位名称
      const unitNamePatterns = [
        '单位名称', '公司名称', '公司名', '企业名称', '名称'
      ]
      const nextFieldsForName = ['税号', '地址', '开户', '银行', '账号', '电话', '联系']
      let unitName = extractField(unitNamePatterns, nextFieldsForName)
      if (unitName) {
        this.$set(this.model, 'partyAName', unitName)
      }

      // 2. 税号
      const taxNo = extractTaxNo()
      if (taxNo) {
        this.$set(this.model, 'partyATaxNo', taxNo)
      }

      // 3. 地址
      const address = extractAddress()
      if (address) {
        this.$set(this.model, 'partyAAddress', address)
      }

      // 4. 开户银行
      const bank = extractBank()
      if (bank) {
        this.$set(this.model, 'partyABank', bank)
      }

      // 5. 账号
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
    // 获取审批人名称
    getAssigneeNames(node) {
      if (!node.user_ids) {
        return '-'
      }

      const ids = node.user_ids.split(',')
      const names = ids.map(id => {
        const trimmedId = id.trim()
        if (node.assignee_type === 'user' || node.assignee_type === 'cc') {
          return this.userMap[trimmedId] || trimmedId
        } else if (node.assignee_type === 'dept') {
          return this.deptMap[trimmedId] || trimmedId
        } else if (node.assignee_type === 'role') {
          return this.roleMap[trimmedId] || trimmedId
        }
        return trimmedId
      })

      return names.join('、')
    },
    getCollaborationModeText(value) {
      if (value === null || value === undefined || value === '') return '-'
      const modeMap = {
        '0': '预付',
        '1': '垫付',
        '2': '服务费'
      }
      return modeMap[String(value)] || value
    },
    getProjectNames() {
      if (this.model.proIdArray && this.model.proIdArray.length > 0) {
        const names = this.model.proIdArray.map(id => {
          const project = this.projectOptions.find(item => String(item.id) === String(id))
          return project ? project.proName : id
        })
        return names.join('、')
      }
      return '-'
    },
    // 获取项目退款的项目名称
    getProjectRefundProjectName() {
      // 优先使用 proName
      if (this.model.proName) {
        return this.model.proName
      }
      // 如果没有名称，尝试通过 API 获取
      if (this.model.proId) {
        this.loadProjectRefundProjectName(this.model.proId)
        return this.model.proId // 临时返回ID
      }
      return '-'
    },
    // 加载项目退款的项目名称
    async loadProjectRefundProjectName(proId) {
      if (!proId) return
      try {
        const res = await getAction(`/sys/dict/loadDictItem/tab_projectManage,pro_name,id`, { key: proId })
        if (res && res.success && res.result) {
          this.model.proName = res.result
        }
      } catch (error) {
        console.error('加载项目名称失败:', error)
      }
    },
    getNodeTypeName(key) {
      const nameMap = {
        'start': '开始节点',
        'end': '结束节点',
        'user': '审批节点',
        'cc': '抄送节点',
        'condition': '条件节点',
        'operation': '操作节点'
      }
      return nameMap[key] || key
    },
    getOperationTypeName(operationType) {
      // 从配置文件获取操作类型标签
      return getOperationTypeLabel(operationType)
    },
    getAssigneeTypeName(type) {
      const nameMap = {
        'user': '指定用户',
        'dept': '部门',
        'role': '角色',
        'cc': '抄送'
      }
      return nameMap[type] || type
    },
    getNodeClass(key) {
      return `node-${key}`
    },
  }
}
</script>

<style scoped lang="less">
.preview-mode {

  .form-preview-section,
  .process-preview-section {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid #f0f0f0;
    margin-bottom: 24px;

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #262626;
      margin: 0 0 20px 0;
      padding-bottom: 12px;
      border-bottom: 2px solid #1890ff;
    }
  }

  .form-info {
    .form-item {
      display: flex;
      margin-bottom: 16px;
      align-items: flex-start;

      &:last-child {
        margin-bottom: 0;
      }

      .form-label {
        min-width: 140px;
        flex-shrink: 0;
        color: #666;
        font-size: 14px;
        line-height: 1.8;
      }

      .form-value {
        flex: 1;
        color: #262626;
        font-size: 14px;
        line-height: 1.8;
        word-break: break-word;
      }
    }

    .form-divider {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
      margin: 20px 0 16px 0;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .process-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;

    .process-info-item {
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .info-label {
        font-weight: 500;
        color: #666;
        margin-right: 8px;
      }

      .info-value {
        color: #262626;
      }
    }
  }

  .process-flow {
    .flow-container {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      padding: 20px 0;
      overflow-x: auto;
      min-height: 200px;

      .flow-node-wrapper {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-shrink: 0;
      }

      .flow-node {
        width: 200px;
        min-height: 180px;
        background: #fff;
        border-radius: 8px;
        padding: 16px;
        border: 2px solid #e8e8e8;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: all 0.3s;
        position: relative;

        &:hover {
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
          transform: translateY(-2px);
        }

        &.node-start {
          border-color: #52c41a;
          background: linear-gradient(135deg, #f6ffed 0%, #fff 100%);

          .node-number {
            background: #52c41a;
          }
        }

        &.node-end {
          border-color: #ff4d4f;
          background: linear-gradient(135deg, #fff1f0 0%, #fff 100%);

          .node-number {
            background: #ff4d4f;
          }
        }

        &.node-user {
          border-color: #1890ff;
          background: linear-gradient(135deg, #e6f7ff 0%, #fff 100%);

          .node-number {
            background: #1890ff;
          }
        }

        &.node-cc {
          border-color: #722ed1;
          background: linear-gradient(135deg, #f9f0ff 0%, #fff 100%);

          .node-number {
            background: #722ed1;
          }
        }

        &.node-condition {
          border-color: #faad14;
          background: linear-gradient(135deg, #fffbe6 0%, #fff 100%);

          .node-number {
            background: #faad14;
          }
        }

        .node-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #1890ff;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
          margin: 0 auto 12px;
        }

        .node-title {
          font-size: 16px;
          font-weight: 600;
          color: #262626;
          text-align: center;
          margin-bottom: 12px;
        }

        .node-details {
          font-size: 12px;
          color: #666;
          line-height: 1.6;

          >div {
            margin-bottom: 6px;

            &:last-child {
              margin-bottom: 0;
            }
          }

          .node-type {
            color: #8c8c8c;
          }

          .node-assignee,
          .node-users,
          .node-operation {

            .assignee-label,
            .users-label,
            .operation-label {
              color: #8c8c8c;
            }

            .assignee-value,
            .users-value,
            .operation-value {
              color: #262626;
              font-weight: 500;
            }
          }
        }
      }

      .flow-arrow {
        font-size: 24px;
        color: #1890ff;
        flex-shrink: 0;
      }
    }
  }
}
</style>
