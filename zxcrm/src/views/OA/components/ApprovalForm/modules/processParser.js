/**
 * 流程解析模块
 * 负责解析审批流程配置，处理节点转换、条件判断等
 */

import { getApprovalProcessConfigByBusinessType } from '@/api/api'

/**
 * 流程解析器类
 */
export class ProcessParser {
  constructor(context, dataLoader) {
    this.context = context
    this.dataLoader = dataLoader
    this.processConfig = null
    this.parsedNodes = []
  }

  /**
   * 获取流程配置并解析
   */
  async loadProcessConfig(businessType) {
    if (!businessType) {
      throw new Error('业务类型不能为空')
    }

    try {
      const res = await getApprovalProcessConfigByBusinessType({ businessType })
      if (res && res.success && res.result) {
        this.processConfig = res.result
        // 解析nodes
        if (res.result.nodes) {
          try {
            const nodesConfig = JSON.parse(res.result.nodes)
            this.parsedNodes = this.parseNodesToSubmitFormat(nodesConfig)
            this.syncToContext()
            return true
          } catch (e) {
            console.error('解析流程节点失败:', e)
            throw new Error('解析流程配置失败')
          }
        } else {
          throw new Error('流程配置中没有节点信息')
        }
      } else {
        throw new Error(res.message || '获取流程配置失败')
      }
    } catch (error) {
      console.error('获取流程配置失败:', error)
      throw error
    }
  }

  /**
   * 解析节点为提交格式
   */
  parseNodesToSubmitFormat(nodesConfig) {
    const result = []

    nodesConfig.forEach(node => {
      const nodeItem = {
        node_id: node.id,
        node_name: node.label || '',
        node_key: this.getNodeKey(node.type)
      }

      // 根据节点类型添加特定字段
      if (node.type === 'approval' && node.approvers) {
        // approvers 是一个对象，不是数组
        const approver = node.approvers
        let userIds = []
        let assigneeType = 'user'

        // 根据审批人类型处理
        if (approver.type === 'fixed_user' && approver.value) {
          // 固定用户
          userIds = Array.isArray(approver.value) ? approver.value : [approver.value]
          assigneeType = 'user'
        } else if (approver.type === 'fixed_dept' && approver.value) {
          // 固定部门
          userIds = Array.isArray(approver.value) ? approver.value : [approver.value]
          assigneeType = 'dept'
        } else if (approver.type === 'fixed_role' && approver.value) {
          // 固定角色
          userIds = Array.isArray(approver.value) ? approver.value : [approver.value]
          assigneeType = 'role'
        } else if (approver.type === 'dynamic_leader') {
          // 动态上级（这里可能需要特殊处理，暂时使用value）
          if (approver.value) {
            userIds = [approver.value.toString()]
          }
          assigneeType = 'user'
        }

        if (userIds.length > 0) {
          nodeItem.assignee_type = assigneeType
          nodeItem.user_ids = userIds.join(',')
          // ruleType: all 表示 and, any 表示 or
          if (approver.ruleType) {
            nodeItem.operation = approver.ruleType === 'all' ? 'and' : 'or'
          }
        }
      } else if (node.type === 'copy' && node.copyUsers) {
        // copyUsers 也是一个对象，不是数组
        const copyUser = node.copyUsers
        let userIds = []
        let assigneeType = 'cc'

        if (copyUser.type === 'fixed_user' && copyUser.value) {
          userIds = Array.isArray(copyUser.value) ? copyUser.value : [copyUser.value]
          assigneeType = 'cc'
        } else if (copyUser.type === 'fixed_dept' && copyUser.value) {
          const deptIds = Array.isArray(copyUser.value) ? copyUser.value : [copyUser.value]
          assigneeType = 'dept'
          userIds = deptIds
        } else if (copyUser.type === 'fixed_role' && copyUser.value) {
          const roleIds = Array.isArray(copyUser.value) ? copyUser.value : [copyUser.value]
          assigneeType = 'role'
          userIds = roleIds
        }

        if (userIds.length > 0) {
          nodeItem.assignee_type = assigneeType
          nodeItem.user_ids = userIds.join(',')
        }
      } else if (node.type === 'operation' && node.operation) {
        // 操作节点
        nodeItem.operation_type = node.operation.operation_type || 'payment'
      }

      result.push(nodeItem)
    })

    return result
  }

  /**
   * 获取节点key
   */
  getNodeKey(type) {
    const keyMap = {
      'start': 'start',
      'end': 'end',
      'approval': 'user',
      'copy': 'cc',
      'condition': 'condition',
      'operation': 'operation'
    }
    return keyMap[type] || type
  }

  /**
   * 解析节点为用户ID（用于提交到后端，过滤条件节点）
   */
  async parseNodesToUserIds(formData) {
    // 先按流程顺序排序，并根据条件判断只走一条路径
    let sortedNodes = this.parsedNodes
    let nodesConfig = null
    if (this.processConfig && this.processConfig.nodes) {
      try {
        nodesConfig = JSON.parse(this.processConfig.nodes)
        // 传入表单数据，用于条件判断
        sortedNodes = this.sortNodesByFlow(nodesConfig, this.parsedNodes, formData)
      } catch (e) {
        console.error('解析节点配置失败:', e)
      }
    }

    // 确保已加载用户和部门数据（用于判断ID类型）
    if (!this.dataLoader.userMap || Object.keys(this.dataLoader.userMap).length === 0 ||
      !this.dataLoader.roleMap || Object.keys(this.dataLoader.roleMap).length === 0) {
      await this.dataLoader.loadUserAndDeptData()
    }

    const result = []

    for (const node of sortedNodes) {
      // 只跳过条件节点，保留开始和结束节点
      if (node.node_key === 'condition') {
        continue
      }

      // 构建节点对象（不包含assignee_type）
      const nodeItem = {
        node_id: node.node_id,
        node_name: node.node_name,
        node_key: node.node_key
      }

      // 开始和结束节点不需要用户ID
      if (node.node_key === 'start' || node.node_key === 'end') {
        result.push(nodeItem)
        continue
      }

      // 操作节点：添加 operation_type
      if (node.node_key === 'operation') {
        if (node.operation_type) {
          nodeItem.operation_type = node.operation_type
        } else if (nodesConfig) {
          const originalNode = nodesConfig.find(n => n.id === node.node_id)
          if (originalNode && originalNode.operation && originalNode.operation.operation_type) {
            nodeItem.operation_type = originalNode.operation.operation_type
          } else if (originalNode && originalNode.operation_type) {
            nodeItem.operation_type = originalNode.operation_type
          } else {
            nodeItem.operation_type = 'payment' // 默认值
          }
        } else {
          nodeItem.operation_type = 'payment' // 默认值
        }
        result.push(nodeItem)
        continue
      }

      // 解析用户ID（审批节点和抄送节点）
      if (node.user_ids && node.assignee_type) {
        let userIds = []

        if (node.assignee_type === 'user') {
          // 直接是用户ID
          userIds = node.user_ids.split(',').map(id => id.trim()).filter(id => id)
        } else if (node.assignee_type === 'cc') {
          // 抄送节点：如果assignee_type是'cc'，说明是固定用户，直接使用
          userIds = node.user_ids.split(',').map(id => id.trim()).filter(id => id)
        } else if (node.assignee_type === 'dept') {
          // 部门ID，需要获取部门树下的所有用户（包括子部门）
          const deptIds = node.user_ids.split(',').map(id => id.trim()).filter(id => id)
          userIds = await this.dataLoader.getUsersByDeptTree(deptIds)
        } else if (node.assignee_type === 'role') {
          // 角色ID，需要获取角色下的所有用户
          const roleIds = node.user_ids.split(',').map(id => id.trim()).filter(id => id)

          // 确保已加载用户数据
          if (this.dataLoader.userList.length === 0) {
            await this.dataLoader.loadUserAndDeptData()
          }

          // 从已加载的用户列表中筛选角色用户
          this.dataLoader.userList.forEach(user => {
            if (user.roles && Array.isArray(user.roles)) {
              const userRoleIds = user.roles.map(r => r.id || r)
              if (userRoleIds.some(roleId => roleIds.includes(roleId))) {
                userIds.push(user.id)
              }
            }
          })

          // 如果没找到，尝试API获取
          if (userIds.length === 0) {
            try {
              const { getAction } = await import('@/api/manage')
              const res = await getAction('/sys/user/getUserByRoleIds', { ids: roleIds.join(',') })
              if (res && res.success && res.result) {
                userIds = res.result.map(user => user.id)
              }
            } catch (e) {
              console.error('获取角色用户失败:', e)
            }
          }
        }

        // 设置用户ID（逗号分隔），不设置assignee_type
        if (userIds.length > 0) {
          nodeItem.user_ids = userIds.join(',')
        }
      }

      // 只有审批节点才有operation
      if (node.operation && node.node_key === 'user') {
        nodeItem.operation = node.operation
      }

      result.push(nodeItem)
    }

    return result
  }

  /**
   * 判断条件节点的分支（根据表单数据）
   */
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
  }

  /**
   * 获取表单字段值
   */
  getFormFieldValue(formData, fieldName) {
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
  }

  /**
   * 按流程顺序排序节点（根据条件判断只走一条路径）
   */
  sortNodesByFlow(nodesConfig, parsedNodes, formData) {
    const nodeMap = new Map()
    parsedNodes.forEach(node => {
      nodeMap.set(node.node_id, node)
    })

    const result = []
    const visited = new Set()

    const startNodeConfig = nodesConfig.find(n => n.type === 'start')
    if (!startNodeConfig) {
      return parsedNodes
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

      // 如果是条件节点，根据表单数据判断走哪条分支
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
  }

  /**
   * 同步数据到 context
   */
  syncToContext() {
    if (this.context) {
      this.context.processConfig = this.processConfig
      this.context.parsedNodes = this.parsedNodes
    }
  }

  /**
   * 从 context 同步数据
   */
  syncFromContext() {
    if (this.context) {
      this.processConfig = this.context.processConfig || null
      this.parsedNodes = this.context.parsedNodes || []
    }
  }
}

