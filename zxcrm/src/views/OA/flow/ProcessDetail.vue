<template>
  <div class="process-detail">
    <a-spin :spinning="loading">
      <div v-if="approvalDetail" class="detail-container">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3 class="section-title">基本信息</h3>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="审批标题">
              {{ approvalDetail.title || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="业务类型">
              {{ getBusinessTypeName(approvalDetail.businessType) }}
            </a-descriptions-item>
            <a-descriptions-item label="审批状态">
              <a-tag :color="getStatusColor(approvalDetail.status)">
                {{ getStatusText(approvalDetail.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ approvalDetail.createTime || '-' }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 表单信息 -->
        <div class="detail-section" v-if="formData">
          <h3 class="section-title">表单内容</h3>
          <!-- 根据业务类型动态加载不同的详情组件 -->
          <contract-approval-detail v-if="isContractApproval" :business-form-data="formData" :file-list="fileList" />
          <project-refund-approval-detail v-else-if="isProjectRefundApproval" :business-form-data="formData" :file-list="fileList" />
          <project-temp-credit-approval-detail v-else-if="isProjectTempCreditApproval" :business-form-data="formData" :file-list="fileList" />
          <slot v-else name="form-detail" :form-data="formData" :business-type="approvalDetail.businessType">
            <!-- 表单详情内容由父组件传入 -->
          </slot>
        </div>

        <!-- 审批流程 -->
        <div class="detail-section"
          v-if="(parsedNodes && parsedNodes.length > 0) || (nodePersonConfigs && nodePersonConfigs.length > 0) || (processNodes && processNodes.length > 0)">
          <h3 class="section-title">审批流程</h3>
          <process-flow :parsed-nodes="parsedNodes" :node-person-configs="nodePersonConfigs"
            :process-nodes="processNodes" :user-map="userMap" :current-node-id="currentNodeId" />
        </div>

        <!-- 审批意见 -->
        <div class="detail-section" v-if="approvalDetail.opinion">
          <h3 class="section-title">审批意见</h3>
          <div class="opinion-content">
            {{ approvalDetail.opinion }}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="detail-actions" v-if="showActions && canOperate">
          <a-divider />
          <!-- 审批意见输入框 -->
          <div class="opinion-input-wrapper" v-if="canApprove">
            <div class="opinion-label">修改建议</div>
            <a-textarea v-model="opinionText" placeholder="请输入审批意见（选填）" :rows="3" :maxLength="500" show-count />
          </div>
          <div class="action-buttons">
            <a-button v-if="canApprove" type="primary" icon="check" @click="handleApprove" :loading="approveLoading">
              审批通过
            </a-button>
            <a-button v-if="canApprove" type="danger" icon="close" @click="handleRefuse" :loading="refuseLoading">
              审批拒绝
            </a-button>
            <a-button v-if="canWithdraw" icon="rollback" @click="handleWithdraw" :loading="withdrawLoading">
              撤销审批
            </a-button>
          </div>
        </div>
      </div>
      <a-empty v-else-if="!loading" description="暂无数据" />
    </a-spin>
  </div>
</template>

<script>
import ProcessFlow from './ProcessFlow.vue'
import { mapGetters } from 'vuex'
import { approvalAgree, approvalRefuse, withdrawApproval } from '@/api/api'
import ContractApprovalDetail from '../components/ContractApprovalDetail.vue'
import ProjectRefundApprovalDetail from '../components/ProjectRefundApprovalDetail.vue'
import ProjectTempCreditApprovalDetail from '../components/ProjectTempCreditApprovalDetail.vue'

export default {
  name: 'ProcessDetail',
  components: {
    ProcessFlow,
    ContractApprovalDetail,
    ProjectRefundApprovalDetail,
    ProjectTempCreditApprovalDetail
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    approvalDetail: {
      type: Object,
      default: null
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    fileList: {
      type: Array,
      default: () => []
    },
    parsedNodes: {
      type: Array,
      default: () => []
    },
    nodePersonConfigs: {
      type: Array,
      default: () => []
    },
    processNodes: {
      type: Array,
      default: () => []
    },
    userMap: {
      type: Object,
      default: () => ({})
    },
    currentNodeId: {
      type: [String, Number],
      default: null
    },
    listItemId: {
      type: [String, Number],
      default: null
    },
    showActions: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      opinionText: '',
      approveLoading: false,
      refuseLoading: false,
      withdrawLoading: false
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    // 是否可以操作（待审批状态且当前用户是审批人）
    canOperate() {
      if (!this.approvalDetail) return false
      // 状态：1待审批 2已通过 3已驳回 4已撤回 5审批中
      return this.approvalDetail.status === '1' || this.approvalDetail.status === '5'
    },
    // 是否可以审批通过/拒绝
    canApprove() {
      if (!this.canOperate) return false
      // 检查当前用户是否在待审批人列表中
      if (this.approvalDetail.currentUsers) {
        const currentUserId = (this.userInfo && this.userInfo.id) || (this.userInfo && this.userInfo.username)
        // currentUsers可能是字符串（逗号分隔）或数组
        if (typeof this.approvalDetail.currentUsers === 'string') {
          return this.approvalDetail.currentUsers.split(',').includes(currentUserId)
        } else if (Array.isArray(this.approvalDetail.currentUsers)) {
          return this.approvalDetail.currentUsers.includes(currentUserId)
        }
      }
      return false
    },
    // 是否可以撤销（我发起的且未完成）
    canWithdraw() {
      if (!this.approvalDetail) return false
      const currentUserId = (this.userInfo && this.userInfo.id) || (this.userInfo && this.userInfo.username)
      const isMyApproval = this.approvalDetail.createBy === currentUserId
      const canWithdrawStatus = ['1', '5'].includes(this.approvalDetail.status)
      return isMyApproval && canWithdrawStatus
    },
    // 判断业务类型
    isContractApproval() {
      if (!this.approvalDetail) return false
      const businessType = this.approvalDetail.businessType || ''
      return businessType === 'contranct' || businessType === 'contract' || businessType === '1'
    },
    isProjectRefundApproval() {
      if (!this.approvalDetail) return false
      return this.approvalDetail.businessType === 'projectRefund'
    },
    isProjectTempCreditApproval() {
      if (!this.approvalDetail) return false
      return this.approvalDetail.businessType === 'projectTempCredit'
    }
  },
  methods: {
    getStatusColor(status) {
      const statusMap = {
        '1': 'blue',      // 待审批
        '2': 'green',     // 已通过
        '3': 'red',       // 已驳回
        '4': 'orange',   // 已撤回
        '5': 'cyan'       // 审批中
      }
      return statusMap[status] || 'default'
    },
    getStatusText(status) {
      const statusMap = {
        '1': '待审批',
        '2': '已通过',
        '3': '已驳回',
        '4': '已撤回',
        '5': '审批中'
      }
      return statusMap[status] || '未知'
    },
    getBusinessTypeName(businessType) {
      if (!businessType) return '-'
      const typeMap = {
        '1': '合同',
        'contranct': '合同',
        'contract': '合同',
        'projectRefund': '项目退款',
        'projectTempCredit': '临时授信',
        'legal': '法务流程',
        'hr': '人事流程',
        'admin': '行政流程',
        'business': '业务流程',
        'other': '其他流程'
      }
      return typeMap[businessType] || businessType
    },
    async handleApprove() {
      const recordId = this.listItemId
      if (!recordId) {
        this.$message.error('缺少审批记录ID')
        return
      }

      this.approveLoading = true
      try {
        const formData = new FormData()
        formData.append('approvalTaskId', recordId)
        formData.append('opinion', this.opinionText || '')

        const res = await approvalAgree(formData)
        if (res && res.success) {
          this.$message.success('审批通过成功')
          this.opinionText = ''
          this.$emit('refresh')
        } else {
          this.$message.error(res.message || '审批通过失败')
        }
      } catch (error) {
        console.error('审批通过失败:', error)
        this.$message.error('审批通过失败')
      } finally {
        this.approveLoading = false
      }
    },
    async handleRefuse() {
      const recordId = this.listItemId
      if (!recordId) {
        this.$message.error('缺少审批记录ID')
        return
      }

      this.refuseLoading = true
      try {
        const formData = new FormData()
        formData.append('approvalTaskId', recordId)
        formData.append('opinion', this.opinionText || '')

        const res = await approvalRefuse(formData)
        if (res && res.success) {
          this.$message.success('审批拒绝成功')
          this.opinionText = ''
          this.$emit('refresh')
        } else {
          this.$message.error(res.message || '审批拒绝失败')
        }
      } catch (error) {
        console.error('审批拒绝失败:', error)
        this.$message.error('审批拒绝失败')
      } finally {
        this.refuseLoading = false
      }
    },
    handleWithdraw() {
      this.$confirm({
        title: '确认撤销',
        content: '确定要撤销此审批吗？',
        onOk: async () => {
          await this.submitWithdraw()
        }
      })
    },
    async submitWithdraw() {
      if (!this.approvalDetail.businessId || !this.approvalDetail.businessType) {
        this.$message.error('缺少业务信息')
        return
      }

      this.withdrawLoading = true
      try {
        const formData = new FormData()
        formData.append('businessId', this.approvalDetail.businessId)
        formData.append('businessType', this.approvalDetail.businessType)

        const res = await withdrawApproval(formData)
        if (res && res.success) {
          this.$message.success('撤销审批成功')
          this.$emit('refresh')
        } else {
          this.$message.error(res.message || '撤销审批失败')
        }
      } catch (error) {
        console.error('撤销审批失败:', error)
        this.$message.error('撤销审批失败')
      } finally {
        this.withdrawLoading = false
      }
    }
  }
}
</script>

<style scoped lang="less">
.process-detail {
  .detail-container {
    .detail-section {
      background: #fff;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;

      .section-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 16px;
        color: #333;
      }

      .opinion-content {
        padding: 12px;
        background: #f5f5f5;
        border-radius: 4px;
        color: #666;
        line-height: 1.6;
      }
    }

    .detail-actions {
      margin-top: 16px;
      padding-top: 16px;

      .opinion-input-wrapper {
        margin-bottom: 16px;

        .opinion-label {
          margin-bottom: 8px;
          font-size: 14px;
          color: #666;
        }
      }

      .action-buttons {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
    }
  }
}
</style>
