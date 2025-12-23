<template>
  <a-modal
    title="审批预览"
    :visible="visible"
    :width="1400"
    :maskClosable="false"
    :footer="null"
    @cancel="handleCancel"
    wrapClassName="approval-preview-modal">
    <a-spin :spinning="loading">
      <div class="preview-container">
        <!-- 左侧：表单信息 -->
        <div class="preview-left">
          <div class="preview-section">
            <h3 class="section-title">表单信息</h3>
            <div class="form-info">
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
        </div>

        <!-- 右侧：流程信息 -->
        <div class="preview-right">
          <div class="preview-section">
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
                <div
                  v-for="(node, index) in sortedNodes"
                  :key="node.node_id"
                  class="process-node">
                  <div class="node-content">
                    <div class="node-icon">
                      <a-icon v-if="node.node_key === 'start'" type="play-circle" />
                      <a-icon v-else-if="node.node_key === 'end'" type="check-circle" />
                      <a-icon v-else-if="node.node_key === 'cc'" type="file-text" />
                      <a-icon v-else-if="node.node_key === 'operation'" type="tool" />
                      <a-icon v-else type="user" />
                    </div>
                    <div class="node-info">
                      <div class="node-name">{{ node.node_name || '-' }}</div>
                      <div class="node-users" v-if="node.user_ids">
                        {{ getAssigneeNames(node) }}
                      </div>
                      <div class="node-operation-type" v-if="node.node_key === 'operation' && node.operation_type">
                        {{ getOperationTypeName(node.operation_type) }}
                      </div>
                    </div>
                  </div>
                  <div v-if="index < sortedNodes.length - 1" class="node-arrow">
                    <a-icon type="arrow-right" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="preview-footer">
        <a-button @click="handleCancel">返回修改</a-button>
        <a-button type="primary" @click="handleConfirm" :loading="loading">确认提交</a-button>
      </div>
    </a-spin>
  </a-modal>
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: 'ApprovalPreview',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    processConfig: {
      type: Object,
      default: null
    },
    parsedNodes: {
      type: Array,
      default: () => []
    },
    fileList: {
      type: Array,
      default: () => []
    },
    projectOptions: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      userMap: {},
      deptMap: {},
      roleMap: {},
      deptUserMap: {}, // 部门ID -> 该部门下的用户列表
      loadingNames: false
    }
  },
  computed: {
    // 按流程顺序排序节点（开始 -> 审批 -> 条件 -> 抄送 -> 结束）
    sortedNodes() {
      if (!this.parsedNodes || this.parsedNodes.length === 0) {
        return []
      }
      
      // 找到开始节点
      const startNode = this.parsedNodes.find(n => n.node_key === 'start')
      if (!startNode) {
        return this.parsedNodes
      }
      
      // 如果流程配置中有节点关系，按关系排序
      if (this.processConfig && this.processConfig.nodes) {
        try {
          const nodesConfig = JSON.parse(this.processConfig.nodes)
          return this.sortNodesByFlow(nodesConfig, this.parsedNodes)
        } catch (e) {
          console.error('解析节点配置失败:', e)
        }
      }
      
      // 否则按类型排序：开始 -> 审批/条件 -> 抄送 -> 结束
      const typeOrder = { 'start': 1, 'user': 2, 'condition': 2, 'cc': 3, 'end': 4 }
      return [...this.parsedNodes].sort((a, b) => {
        const orderA = typeOrder[a.node_key] || 5
        const orderB = typeOrder[b.node_key] || 5
        return orderA - orderB
      })
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.loadAssigneeNames()
      }
    },
    parsedNodes: {
      handler() {
        if (this.visible) {
          this.loadAssigneeNames()
        }
      },
      deep: true
    }
  },
  methods: {
    // 按流程关系排序节点
    sortNodesByFlow(nodesConfig, parsedNodes) {
      const nodeMap = new Map()
      parsedNodes.forEach(node => {
        nodeMap.set(node.node_id, node)
      })
      
      const result = []
      const visited = new Set()
      
      // 找到开始节点
      const startNodeConfig = nodesConfig.find(n => n.type === 'start')
      if (!startNodeConfig) {
        return parsedNodes
      }
      
      // 递归遍历流程
      const traverse = (nodeId) => {
        if (visited.has(nodeId)) {
          return
        }
        visited.add(nodeId)
        
        const parsedNode = nodeMap.get(nodeId)
        if (parsedNode) {
          result.push(parsedNode)
        }
        
        const nodeConfig = nodesConfig.find(n => n.id === nodeId)
        if (nodeConfig && nodeConfig.nextNodes) {
          nodeConfig.nextNodes.forEach(nextId => {
            traverse(nextId)
          })
        }
      }
      
      traverse(startNodeConfig.id)
      
      // 添加未访问的节点（可能是条件分支等）
      parsedNodes.forEach(node => {
        if (!visited.has(node.node_id)) {
          result.push(node)
        }
      })
      
      return result
    },
    // 加载审批人名称
    async loadAssigneeNames() {
      const userIds = new Set()
      const deptIds = new Set()
      const roleIds = new Set()
      
      this.parsedNodes.forEach(node => {
        if (node.user_ids) {
          const ids = node.user_ids.split(',')
          if (node.assignee_type === 'user' || node.assignee_type === 'cc') {
            ids.forEach(id => userIds.add(id.trim()))
          } else if (node.assignee_type === 'dept') {
            ids.forEach(id => deptIds.add(id.trim()))
          } else if (node.assignee_type === 'role') {
            ids.forEach(id => roleIds.add(id.trim()))
          }
        }
      })
      
      this.loadingNames = true
      
      // 批量获取用户名称
      if (userIds.size > 0) {
        try {
          const res = await getAction('/sys/user/getUserIdAndRealnameCombination', {})
          if (res && res.success && res.result) {
            res.result.forEach(user => {
              this.userMap[user.id] = user.realname || user.username
            })
          }
        } catch (e) {
          console.error('获取用户名称失败:', e)
        }
      }
      
      // 批量获取部门名称和部门下的用户
      if (deptIds.size > 0) {
        try {
          // 先尝试批量查询
          const deptIdArray = Array.from(deptIds)
          const res = await getAction('/sys/sysDepart/queryTreeList', {})
          if (res && res.success && res.result) {
            // 递归查找部门
            const findDept = (depts, targetId) => {
              for (const dept of depts) {
                if (dept.id === targetId) {
                  return dept
                }
                if (dept.children && dept.children.length > 0) {
                  const found = findDept(dept.children, targetId)
                  if (found) return found
                }
              }
              return null
            }
            
            // 递归查找部门及其所有子部门
            const findDeptAndChildren = (depts, targetId) => {
              const foundDeptIds = new Set()
              const findDeptById = (deptList, id) => {
                for (const dept of deptList) {
                  if (dept.id === id) {
                    return dept
                  }
                  if (dept.children && dept.children.length > 0) {
                    const found = findDeptById(dept.children, id)
                    if (found) return found
                  }
                }
                return null
              }
              const addDeptAndChildren = (dept) => {
                if (dept) {
                  foundDeptIds.add(dept.id)
                  if (dept.children && dept.children.length > 0) {
                    dept.children.forEach(child => addDeptAndChildren(child))
                  }
                }
              }
              const targetDept = findDeptById(depts, targetId)
              if (targetDept) {
                addDeptAndChildren(targetDept)
              }
              return Array.from(foundDeptIds)
            }
            
            // 使用 Promise.all 等待所有异步操作完成
            await Promise.all(deptIdArray.map(async deptId => {
              const dept = findDept(res.result, deptId)
              if (dept) {
                this.deptMap[deptId] = dept.departName
                
                // 获取该部门及其子部门下的所有用户
                const allDeptIds = findDeptAndChildren(res.result, deptId)
                try {
                  const userRes = await getAction('/sys/user/getUerByDepIds', { ids: allDeptIds.join(',') })
                  if (userRes && userRes.success && userRes.result) {
                    const userNames = userRes.result.map(user => user.realname || user.username).filter(name => name)
                    this.deptUserMap[deptId] = userNames
                  }
                } catch (err) {
                  console.error('获取部门用户失败:', err)
                }
              }
            }))
          }
        } catch (e) {
          // 如果批量查询失败，尝试单个查询
          for (const deptId of deptIds) {
            try {
              const res = await getAction('/sys/sysDepart/queryById', { id: deptId })
              if (res && res.success && res.result) {
                this.deptMap[deptId] = res.result.departName
                
                // 获取该部门下的用户
                try {
                  const userRes = await getAction('/sys/user/getUerByDepIds', { ids: deptId })
                  if (userRes && userRes.success && userRes.result) {
                    const userNames = userRes.result.map(user => user.realname || user.username).filter(name => name)
                    this.deptUserMap[deptId] = userNames
                  }
                } catch (err) {
                  console.error('获取部门用户失败:', err)
                }
              }
            } catch (err) {
              console.error('获取部门名称失败:', err)
            }
          }
        }
      }
      
      // 批量获取角色名称
      if (roleIds.size > 0) {
        try {
          const res = await getAction('/sys/role/queryall', {})
          if (res && res.success && res.result) {
            res.result.forEach(role => {
              this.roleMap[role.id] = role.roleName
            })
          }
        } catch (e) {
          console.error('获取角色名称失败:', e)
        }
      }
      
      this.loadingNames = false
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
          const deptName = this.deptMap[trimmedId] || trimmedId
          const users = this.deptUserMap[trimmedId] || []
          if (users.length > 0) {
            return `${deptName}（${users.join('、')}）`
          }
          return deptName
        } else if (node.assignee_type === 'role') {
          return this.roleMap[trimmedId] || trimmedId
        }
        return trimmedId
      })
      
      return names.join('、')
    },
    getOperationTypeName(operationType) {
      return getOperationTypeLabel(operationType)
    },
    getProjectNames() {
      if (this.formData.proIdArray && this.formData.proIdArray.length > 0) {
        const names = this.formData.proIdArray.map(id => {
          const project = this.projectOptions.find(item => String(item.id) === String(id))
          return project ? project.proName : id
        })
        return names.join('、')
      }
      return '-'
    },
    getNodeTypeName(key) {
      const nameMap = {
        'start': '开始节点',
        'end': '结束节点',
        'user': '审批节点',
        'cc': '抄送节点',
        'condition': '条件节点'
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
    getNodeClass(key) {
      return `node-${key}`
    },
    handleConfirm() {
      this.$emit('confirm')
    },
    handleCancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped lang="less">
.approval-preview-modal {
  /deep/ .ant-modal-body {
    padding: 24px;
    max-height: 80vh;
    overflow-y: auto;
  }
}

.preview-container {
  display: flex;
  gap: 24px;
  min-height: 500px;
}

.preview-left {
  width: 400px;
  flex-shrink: 0;
}

.preview-right {
  flex: 1;
  min-width: 0;
}

.preview-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #f0f0f0;

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
      width: 120px;
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
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 24px;
  background-color: #fafafa;
  border-radius: 4px;
  border: 1px solid #e8e8e8;

  .flow-container {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    width: 100%;
  }

  .process-node {
    display: flex;
    align-items: center;
    gap: 8px;

    .node-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      background-color: #fff;
      border-radius: 8px;
      border: 1px solid #e8e8e8;
      transition: all 0.3s;

      .node-icon {
        font-size: 24px;
        color: #1890ff;
        flex-shrink: 0;
      }

      .node-info {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .node-name {
          font-size: 14px;
          font-weight: 500;
          color: #262626;
        }

        .node-users {
          font-size: 12px;
          color: #8c8c8c;
        }
      }
    }

    .node-arrow {
      font-size: 20px;
      color: #1890ff;
      flex-shrink: 0;
    }
  }
}

.preview-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}
</style>

