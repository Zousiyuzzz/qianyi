/**
 * 数据加载模块
 * 负责加载用户、部门、角色等基础数据
 */

import { getAction } from '@/api/manage'
import { getUserListNotPage, queryDepartTreeList } from '@/api/api'

/**
 * 数据加载器类
 */
export class DataLoader {
  constructor(context) {
    this.context = context
    this.userList = []
    this.deptTree = []
    this.userMap = {}
    this.deptMap = {}
    this.roleMap = {}
  }

  /**
   * 加载用户和部门数据
   */
  async loadUserAndDeptData() {
    if (this.userList.length > 0 && this.deptTree.length > 0) {
      return // 已经加载过了
    }

    try {
      const [usersRes, deptsRes] = await Promise.all([
        getUserListNotPage(),
        queryDepartTreeList()
      ])

      if (usersRes && usersRes.success) {
        this.userList = usersRes.result || []
        // 构建用户映射
        this.userList.forEach(user => {
          this.userMap[user.id] = user.realname || user.username
          // 提取角色信息
          if (user.roles && Array.isArray(user.roles)) {
            user.roles.forEach(role => {
              if (!this.roleMap[role.id]) {
                this.roleMap[role.id] = role.roleName
              }
            })
          }
        })
      }

      if (deptsRes && deptsRes.success) {
        this.deptTree = deptsRes.result || []
        // 构建部门映射
        const buildDeptMap = (depts) => {
          depts.forEach(dept => {
            this.deptMap[dept.id] = dept.departName
            if (dept.children && dept.children.length > 0) {
              buildDeptMap(dept.children)
            }
          })
        }
        buildDeptMap(this.deptTree)
      }
    } catch (e) {
      console.error('加载用户和部门数据失败:', e)
      throw e
    }

    // 同步到 context
    this.syncToContext()
  }

  /**
   * 获取部门树下的所有用户（包括子部门）
   */
  async getUsersByDeptTree(deptIds) {
    const allUserIds = new Set()

    // 确保已加载部门树数据
    if (this.deptTree.length === 0) {
      await this.loadUserAndDeptData()
    }

    // 递归查找部门及其所有子部门
    const findDeptAndChildren = (depts, targetIds) => {
      const foundDeptIds = new Set()

      const traverse = (nodes) => {
        if (!nodes || !Array.isArray(nodes)) return

        for (const node of nodes) {
          if (targetIds.includes(node.id)) {
            foundDeptIds.add(node.id)
            // 添加所有子部门
            if (node.children && node.children.length > 0) {
              const addChildren = (children) => {
                for (const child of children) {
                  foundDeptIds.add(child.id)
                  if (child.children && child.children.length > 0) {
                    addChildren(child.children)
                  }
                }
              }
              addChildren(node.children)
            }
          } else {
            if (node.children && node.children.length > 0) {
              traverse(node.children)
            }
          }
        }
      }

      traverse(depts)
      return Array.from(foundDeptIds)
    }

    const allDeptIds = findDeptAndChildren(this.deptTree, deptIds)

    if (allDeptIds.length > 0) {
      // 优先从已加载的用户列表中筛选部门用户
      if (this.userList.length > 0) {
        this.userList.forEach(user => {
          if (user.departs && Array.isArray(user.departs)) {
            const userDeptIds = user.departs.map(d => d.id || d)
            if (userDeptIds.some(deptId => allDeptIds.includes(deptId))) {
              allUserIds.add(user.id)
            }
          }
        })
      }

      // 如果没找到，尝试API获取
      if (allUserIds.size === 0) {
        try {
          const userRes = await getAction('/sys/user/getUerByDepIds', { ids: allDeptIds.join(',') })
          if (userRes && userRes.success && userRes.result) {
            userRes.result.forEach(user => {
              allUserIds.add(user.id)
            })
          }
        } catch (e) {
          console.error('获取部门用户失败:', e)
        }
      }
    }

    return Array.from(allUserIds)
  }

  /**
   * 加载审批人名称
   */
  async loadAssigneeNames(parsedNodes) {
    const userIds = new Set()
    const deptIds = new Set()
    const roleIds = new Set()

    parsedNodes.forEach(node => {
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

    // 批量获取用户名称
    if (userIds.size > 0) {
      try {
        // 先尝试从已加载的用户列表中获取
        if (this.userList.length > 0) {
          this.userList.forEach(user => {
            const userIdStr = String(user.id)
            if (userIds.has(userIdStr)) {
              this.userMap[userIdStr] = user.realname || user.username || user.name || userIdStr
            }
          })
        }
        
        // 如果还有未匹配的用户ID，通过API获取
        const unmatchedIds = Array.from(userIds).filter(id => !this.userMap[id])
        if (unmatchedIds.length > 0) {
          const res = await getAction('/sys/user/getUserIdAndRealnameCombination', {})
          if (res && res.success && res.result) {
            res.result.forEach(user => {
              const userIdStr = String(user.id)
              // 同时支持字符串和数字格式的ID
              if (userIds.has(userIdStr) || userIds.has(user.id)) {
                this.userMap[userIdStr] = user.realname || user.username || user.name || userIdStr
                // 同时支持数字格式的key
                if (typeof user.id === 'number') {
                  this.userMap[user.id] = user.realname || user.username || user.name || userIdStr
                }
              }
            })
          }
        }
      } catch (e) {
        console.error('获取用户名称失败:', e)
      }
    }

    // 批量获取部门名称
    if (deptIds.size > 0) {
      try {
        const res = await getAction('/sys/sysDepart/queryTreeList', {})
        if (res && res.success && res.result) {
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
          deptIds.forEach(deptId => {
            const dept = findDept(res.result, deptId)
            if (dept) {
              this.deptMap[deptId] = dept.departName
            }
          })
        }
      } catch (e) {
        console.error('获取部门名称失败:', e)
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

    this.syncToContext()
  }

  /**
   * 同步数据到 context
   */
  syncToContext() {
    if (this.context) {
      this.context.userList = this.userList
      this.context.deptTree = this.deptTree
      this.context.userMap = this.userMap
      this.context.deptMap = this.deptMap
      this.context.roleMap = this.roleMap
    }
  }

  /**
   * 从 context 同步数据
   */
  syncFromContext() {
    if (this.context) {
      this.userList = this.context.userList || []
      this.deptTree = this.context.deptTree || []
      this.userMap = this.context.userMap || {}
      this.deptMap = this.context.deptMap || {}
      this.roleMap = this.context.roleMap || {}
    }
  }

  /**
   * 获取用户名称
   */
  getUserName(userId) {
    return this.userMap[userId] || userId
  }

  /**
   * 获取部门名称
   */
  getDeptName(deptId) {
    return this.deptMap[deptId] || deptId
  }

  /**
   * 获取角色名称
   */
  getRoleName(roleId) {
    return this.roleMap[roleId] || roleId
  }
}

