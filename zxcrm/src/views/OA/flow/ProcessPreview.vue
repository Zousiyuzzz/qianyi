<template>
  <div class="process-preview">
    <!-- 表单信息 -->
    <div class="form-preview-section">
      <h3 class="section-title">表单信息</h3>
      <div class="form-info">
        <!-- 合同审批预览 -->
        <template v-if="isContractApproval">
          <div class="form-item">
            <div class="form-label">项目：</div>
            <div class="form-value">{{ getProjectNames() }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">签约日期：</div>
            <div class="form-value">{{ formData.signDate || '-' }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">截止日期：</div>
            <div class="form-value">{{ formData.endDate || '-' }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">合作方式：</div>
            <div class="form-value">{{ getCollaborationModeText(formData.collaborationMode) }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">账期：</div>
            <div class="form-value">{{ formData.repayDay != null && formData.repayDay !== '' ? formData.repayDay + ' 天'
              : '-' }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">授信额度：</div>
            <div class="form-value">{{ formData.creditLimit != null && formData.creditLimit !== '' ?
              formData.creditLimit + ' 元' : '-' }}</div>
          </div>
          <div class="form-divider">甲方信息</div>
          <div class="form-item">
            <div class="form-label">甲方单位名称：</div>
            <div class="form-value">{{ formData.partyAName || '-' }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">甲方税号：</div>
            <div class="form-value">{{ formData.partyATaxNo || '-' }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">甲方开户银行：</div>
            <div class="form-value">{{ formData.partyABank || '-' }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">甲方银行账号：</div>
            <div class="form-value">{{ formData.partyAAccount || '-' }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">甲方地址：</div>
            <div class="form-value">{{ formData.partyAAddress || '-' }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">甲方电话：</div>
            <div class="form-value">{{ formData.partyAPhone || '-' }}</div>
          </div>
          <div class="form-divider">乙方信息</div>
          <div class="form-item">
            <div class="form-label">乙方单位名称：</div>
            <div class="form-value">{{ formData.accountName || '-' }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">邮寄信息：</div>
            <div class="form-value">{{ formData.remark || '-' }}</div>
          </div>
          <div class="form-item" v-if="formData.fileList && formData.fileList.length > 0">
            <div class="form-label">附件：</div>
            <div class="form-value">
              <div v-for="(file, index) in formData.fileList" :key="index" class="file-item">
                <a-icon type="file" />
                <span>{{ file.name }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- 项目退款预览 -->
        <template v-else-if="isProjectRefundApproval">
          <div class="form-item">
            <div class="form-label">项目：</div>
            <div class="form-value">{{ formData.proName || formData.proId || '-' }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">退款金额：</div>
            <div class="form-value">{{ formData.refundAmount != null ? formData.refundAmount + ' 元' : '-' }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">资金性质：</div>
            <div class="form-value">{{ formData.fundsNature == '1' ? '对公' : formData.fundsNature == '2' ? '对私' : '-' }}
            </div>
          </div>
          <div class="form-item">
            <div class="form-label">项目主体：</div>
            <div class="form-value">{{ formData.customerTitle || '-' }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">备注：</div>
            <div class="form-value">{{ formData.remarks || '-' }}</div>
          </div>
        </template>

        <!-- 临时授信预览 -->
        <template v-else-if="isProjectTempCreditApproval">
          <div class="form-item">
            <div class="form-label">项目：</div>
            <div class="form-value">{{ formData.proName || formData.proId || '-' }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">临时授信金额：</div>
            <div class="form-value">{{ formData.tempAmount != null ? formData.tempAmount + ' 元' : '-' }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">临时授信到期日期：</div>
            <div class="form-value">{{ formData.endDate || '-' }}</div>
          </div>
          <div class="form-item" v-if="formData.hasContract === '1' || formData.contractId">
            <div class="form-label">合同：</div>
            <div class="form-value">{{ formData.contractName || '-' }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">备注：</div>
            <div class="form-value">{{ formData.remark || '-' }}</div>
          </div>
        </template>

        <slot v-else name="form-preview" :form-data="formData">
          <!-- 表单预览内容由父组件传入 -->
        </slot>
      </div>
    </div>

    <!-- 流程信息（在表单下面，横向排列） -->
    <div class="process-preview-section" v-if="processConfig">
      <h3 class="section-title">流程信息</h3>
      <div class="process-header">
        <div class="process-info-item">
          <span class="info-label">流程名称：</span>
          <span class="info-value">{{ processConfig.processName || '-' }}</span>
        </div>
        <div class="process-info-item">
          <span class="info-label">业务类型：</span>
          <span class="info-value">{{ processConfig.businessType || '-' }}</span>
        </div>
      </div>

      <div class="process-flow">
        <div class="flow-container">
          <div v-for="(node, index) in sortedNodes" :key="node.node_id || `node-${index}-${node.node_key}`"
            class="flow-node-wrapper">
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
                  <span class="users-value">{{ assigneeNamesMap[node.node_id] || '加载中...' }}</span>
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

    <div class="preview-footer">
      <slot name="footer">
        <a-button @click="handleCancel">返回修改</a-button>
        <a-button type="primary" @click="handleConfirm" :loading="loading">确认提交</a-button>
      </slot>
    </div>
  </div>
</template>

<script>
import { getOperationTypeLabel } from '@/views/OA/config/operationTypes'

export default {
  name: 'ProcessPreview',
  props: {
    processConfig: {
      type: Object,
      default: null
    },
    parsedNodes: {
      type: Array,
      default: () => []
    },
    userMap: {
      type: Object,
      default: () => ({})
    },
    deptMap: {
      type: Object,
      default: () => ({})
    },
    roleMap: {
      type: Object,
      default: () => ({})
    },
    currentNodeId: {
      type: [String, Number],
      default: null
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      assigneeNamesMap: {}
    }
  },
  watch: {
    parsedNodes: {
      immediate: true,
      handler(nodes) {
        if (nodes && nodes.length > 0) {
          this.loadAllAssigneeNames(nodes)
        }
      }
    }
  },
  computed: {
    isContractApproval() {
      if (!this.processConfig) return false
      const businessType = this.processConfig.businessType || ''
      return businessType === 'contranct' || businessType === 'contract' || businessType === '1'
    },
    isProjectRefundApproval() {
      if (!this.processConfig) return false
      return this.processConfig.businessType === 'projectRefund'
    },
    isProjectTempCreditApproval() {
      if (!this.processConfig) return false
      return this.processConfig.businessType === 'projectTempCredit'
    },
    // 按流程顺序排序节点（使用原本的流程解析逻辑，会自动过滤条件节点）
    sortedNodes() {
      if (!this.parsedNodes || this.parsedNodes.length === 0) {
        return []
      }

      const startNode = this.parsedNodes.find(n => n.node_key === 'start')
      if (!startNode) {
        return this.parsedNodes.filter(node => node.node_key !== 'condition')
      }

      // 使用原本的流程解析逻辑（会传入表单数据用于条件判断，并自动过滤条件节点）
      if (this.processConfig && this.processConfig.nodes) {
        try {
          const nodesConfig = JSON.parse(this.processConfig.nodes)
          // 调用原本的 sortNodesByFlow 方法，传入表单数据用于条件判断
          return this.sortNodesByFlow(nodesConfig, this.parsedNodes, this.formData)
        } catch (e) {
          console.error('解析节点配置失败:', e)
        }
      }

      // 否则按类型排序：开始 -> 审批 -> 抄送 -> 结束（过滤条件节点）
      const typeOrder = { 'start': 1, 'user': 2, 'cc': 3, 'end': 4 }
      return [...this.parsedNodes]
        .filter(node => node.node_key !== 'condition')
        .sort((a, b) => {
          const orderA = typeOrder[a.node_key] || 5
          const orderB = typeOrder[b.node_key] || 5
          return orderA - orderB
        })
    }
  },
  methods: {
    // 加载所有审批人名称
    async loadAllAssigneeNames(nodes) {
      // 重置映射
      this.assigneeNamesMap = {}

      for (const node of nodes) {
        if (node.user_ids) {
          const names = await this.getAssigneeNames(node)
          this.$set(this.assigneeNamesMap, node.node_id, names)
        }
      }
    },
    // 按流程关系排序节点（使用原本的逻辑，会根据条件判断只走一条路径，条件节点本身不加入结果）
    sortNodesByFlow(nodesConfig, parsedNodes, formData) {
      const nodeMap = new Map()
      parsedNodes.forEach(node => {
        nodeMap.set(node.node_id, node)
      })

      const result = []
      const visited = new Set()

      const startNodeConfig = nodesConfig.find(n => n.type === 'start')
      if (!startNodeConfig) {
        return parsedNodes.filter(node => node.node_key !== 'condition')
      }

      const traverse = (nodeId) => {
        if (visited.has(nodeId)) {
          return
        }
        visited.add(nodeId)

        const nodeConfig = nodesConfig.find(n => n.id === nodeId)
        if (!nodeConfig) {
          return
        }

        // 如果是条件节点，根据表单数据判断走哪条分支（条件节点本身不加入结果）
        if (nodeConfig.type === 'condition' && nodeConfig.condition) {
          const branchName = this.evaluateConditionBranch(nodeConfig, formData)
          if (branchName && nodeConfig.edges) {
            // 找到匹配分支的下一个节点
            const matchedNextNodeId = Object.keys(nodeConfig.edges).find(
              nextNodeId => nodeConfig.edges[nextNodeId] && nodeConfig.edges[nextNodeId].branchName === branchName
            )
            if (matchedNextNodeId) {
              traverse(matchedNextNodeId)
            }
          }
          return // 条件节点本身不加入结果
        }

        // 其他节点正常处理
        const parsedNode = nodeMap.get(nodeId)
        if (parsedNode) {
          result.push(parsedNode)
        }

        if (nodeConfig.nextNodes) {
          nodeConfig.nextNodes.forEach(nextId => {
            traverse(nextId)
          })
        }
      }

      traverse(startNodeConfig.id)

      // 确保结束节点被添加（如果存在）
      const endNode = parsedNodes.find(n => n.node_key === 'end')
      if (endNode && !visited.has(endNode.node_id)) {
        result.push(endNode)
      }

      return result
    },
    // 判断条件节点的分支（根据表单数据）
    evaluateConditionBranch(conditionNode, formData) {
      if (!conditionNode.condition || !conditionNode.condition.branches) {
        return null
      }

      const branches = conditionNode.condition.branches

      // 遍历所有分支，找到第一个满足条件的分支
      for (const branch of branches) {
        if (!branch.rules || branch.rules.length === 0) {
          continue
        }

        let branchResult = true
        const logic = branch.logic || 'AND'

        for (const rule of branch.rules) {
          const fieldValue = this.getFormFieldValue(formData, rule.field)
          const ruleValue = rule.value
          const operator = rule.operator

          let ruleResult = false

          switch (operator) {
            case '=':
            case '==':
              ruleResult = String(fieldValue) === String(ruleValue)
              break
            case '!=':
            case '<>':
              ruleResult = String(fieldValue) !== String(ruleValue)
              break
            case '>':
              ruleResult = Number(fieldValue) > Number(ruleValue)
              break
            case '>=':
              ruleResult = Number(fieldValue) >= Number(ruleValue)
              break
            case '<':
              ruleResult = Number(fieldValue) < Number(ruleValue)
              break
            case '<=':
              ruleResult = Number(fieldValue) <= Number(ruleValue)
              break
            case 'contains':
            case 'like':
              ruleResult = String(fieldValue).includes(String(ruleValue))
              break
            case 'in':
              const ruleValues = Array.isArray(ruleValue) ? ruleValue : String(ruleValue).split(',')
              ruleResult = ruleValues.includes(String(fieldValue))
              break
            default:
              ruleResult = String(fieldValue) === String(ruleValue)
          }

          if (logic === 'AND') {
            branchResult = branchResult && ruleResult
            if (!branchResult) break // 短路优化
          } else {
            branchResult = branchResult || ruleResult
            if (branchResult) break // 短路优化
          }
        }

        if (branchResult) {
          return branch.name
        }
      }

      // 如果没有匹配的分支，返回默认分支（通常是最后一个）
      return branches.length > 0 ? branches[branches.length - 1].name : null
    },
    // 获取表单字段值
    getFormFieldValue(formData, fieldName) {
      if (!formData) return null

      // 支持数组字段，如 proIdArray（返回第一个值或逗号分隔的字符串）
      if (fieldName === 'proId' || fieldName === 'proIdArray') {
        if (formData.proIdArray && Array.isArray(formData.proIdArray) && formData.proIdArray.length > 0) {
          // 返回第一个项目ID（用于条件判断）
          return String(formData.proIdArray[0])
        }
        if (formData.proId) {
          const proIds = String(formData.proId).split(',').filter(id => id.trim())
          return proIds.length > 0 ? proIds[0] : null
        }
        return null
      }

      // 支持嵌套字段，如 proIdArray[0]
      const keys = fieldName.split(/[\[\].]/).filter(k => k)
      let value = formData
      for (const key of keys) {
        if (value && typeof value === 'object') {
          if (Array.isArray(value) && /^\d+$/.test(key)) {
            value = value[parseInt(key)]
          } else {
            value = value[key]
          }
        } else {
          return null
        }
      }
      return value
    },
    // 获取审批人名称
    async getAssigneeNames(node) {
      if (!node.user_ids) {
        return '-'
      }

      const ids = node.user_ids.split(',').map(id => id.trim()).filter(id => id)

      // 根据 assignee_type 处理
      if (node.assignee_type === 'dept') {
        // 部门类型：获取部门下的所有用户，显示用户名称
        const userIds = await this.getUsersByDeptIds(ids)
        const names = userIds.map(userId => {
          const userIdStr = String(userId)
          return this.userMap[userIdStr] || this.userMap[userId] || userIdStr
        })
        return names.length > 0 ? names.join('、') : '-'
      } else if (node.assignee_type === 'role') {
        // 角色类型：获取角色下的所有用户，显示用户名称
        const userIds = await this.getUsersByRoleIds(ids)
        const names = userIds.map(userId => {
          const userIdStr = String(userId)
          return this.userMap[userIdStr] || this.userMap[userId] || userIdStr
        })
        return names.length > 0 ? names.join('、') : '-'
      } else {
        // 用户类型或抄送类型：从 userMap 中查找用户名称
        const names = ids.map(id => {
          let name = this.userMap[id]
          if (!name) {
            // 尝试数字格式
            const numId = Number(id)
            if (!isNaN(numId)) {
              name = this.userMap[numId]
            }
          }
          if (!name) {
            // 尝试字符串格式
            name = this.userMap[String(id)]
          }
          // 如果还是找不到，返回ID
          return name || id
        })
        return names.join('、')
      }
    },
    // 获取部门下的所有用户ID
    async getUsersByDeptIds(deptIds) {
      try {
        const { getAction } = await import('@/api/manage')
        const res = await getAction('/sys/user/getUerByDepIds', { ids: deptIds.join(',') })
        if (res && res.success && res.result) {
          return res.result.map(user => user.id)
        }
      } catch (e) {
        console.error('获取部门用户失败:', e)
      }
      return []
    },
    // 获取角色下的所有用户ID
    async getUsersByRoleIds(roleIds) {
      try {
        const { getAction } = await import('@/api/manage')
        const res = await getAction('/sys/user/getUserByRoleIds', { ids: roleIds.join(',') })
        if (res && res.success && res.result) {
          return res.result.map(user => user.id)
        }
      } catch (e) {
        console.error('获取角色用户失败:', e)
      }
      return []
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
    getAssigneeTypeName(type) {
      const nameMap = {
        'user': '指定用户',
        'dept': '部门',
        'role': '角色',
        'cc': '抄送'
      }
      return nameMap[type] || type
    },
    getOperationTypeName(operationType) {
      return getOperationTypeLabel(operationType)
    },
    getNodeClass(key) {
      return `node-${key}`
    },
    getProjectNames() {
      if (this.formData.proIdArray && this.formData.proIdArray.length > 0) {
        // 如果有项目选项数据，从选项中获取名称
        const names = this.formData.proIdArray.map(id => {
          // 这里可以从 projectOptions 中获取，但预览时可能没有这个数据
          return id
        })
        return names.join('、')
      }
      if (this.formData.proName) {
        return this.formData.proName
      }
      return '-'
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
    handleCancel() {
      this.$emit('cancel')
    },
    handleConfirm() {
      this.$emit('confirm')
    }
  }
}
</script>

<style scoped lang="less">
.process-preview {

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
        border: 2px solid #1890ff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: all 0.3s;
        position: relative;

        &:hover {
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
          transform: translateY(-2px);
        }

        // 统一使用蓝色边框，不同节点类型只改变背景色
        &.node-start {
          background: linear-gradient(135deg, #e6f7ff 0%, #fff 100%);

          .node-number {
            background: #1890ff;
          }
        }

        &.node-end {
          background: linear-gradient(135deg, #e6f7ff 0%, #fff 100%);

          .node-number {
            background: #1890ff;
          }
        }

        &.node-user {
          background: linear-gradient(135deg, #e6f7ff 0%, #fff 100%);

          .node-number {
            background: #1890ff;
          }
        }

        &.node-cc {
          background: linear-gradient(135deg, #e6f7ff 0%, #fff 100%);

          .node-number {
            background: #1890ff;
          }
        }

        &.node-operation {
          background: linear-gradient(135deg, #e6f7ff 0%, #fff 100%);

          .node-number {
            background: #1890ff;
          }
        }

        .node-number {
          position: absolute;
          top: -12px;
          left: 16px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #1890ff;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .node-title {
          font-size: 16px;
          font-weight: 600;
          color: #262626;
          margin-top: 12px;
          margin-bottom: 12px;
          text-align: center;
        }

        .node-details {
          font-size: 12px;
          color: #666;
          line-height: 1.8;

          .node-type,
          .node-assignee,
          .node-users,
          .node-operation {
            margin-bottom: 8px;

            &:last-child {
              margin-bottom: 0;
            }

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
        color: #d9d9d9;
        flex-shrink: 0;
      }
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

  .preview-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
