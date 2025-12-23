<template>
  <div class="node-approval-config">
    <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="节点名称">
        <a-input v-model="node.label" placeholder="请输入节点名称" />
      </a-form-item>
      
      <a-form-item :label="isCopyNode ? '抄送人类型' : '审批人类型'">
        <a-radio-group v-model="configData.type" @change="onTypeChange">
          <a-radio value="fixed_user">{{ isCopyNode ? '固定抄送人' : '固定审批人' }}</a-radio>
          <a-radio value="fixed_dept">固定部门</a-radio>
          <a-radio value="fixed_role">固定角色</a-radio>
          <a-radio v-if="!isCopyNode" value="dynamic_leader">动态上级</a-radio>
        </a-radio-group>
      </a-form-item>
      
      <!-- 固定用户 -->
      <a-form-item v-if="configData.type === 'fixed_user'" :label="isCopyNode ? '选择用户' : '选择用户'">
        <a-select
          :value="configData.value"
          mode="multiple"
          placeholder="请选择用户"
          :filterOption="filterUserOption"
          showSearch
          :optionFilterProp="'children'"
          @change="handleUserChange"
          style="width: 100%;"
          :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }"
        >
          <a-select-option
            v-for="(user, index) in uniqueUserList"
            :key="`user-${String(user.id)}-${index}`"
            :value="String(user.id)"
          >
            {{ user.realname }} ({{ user.username }})
          </a-select-option>
        </a-select>
      </a-form-item>
      
      <!-- 固定部门 -->
      <a-form-item v-if="configData.type === 'fixed_dept'" label="选择部门">
        <a-tree-select
          v-model="configData.value"
          :tree-data="deptTreeData"
          tree-checkable
          show-checked-strategy="SHOW_PARENT"
          placeholder="请选择部门"
          :replaceFields="{ children: 'children', title: 'title', key: 'id', value: 'id' }"
        />
      </a-form-item>
      
      <!-- 固定角色 -->
      <a-form-item v-if="configData.type === 'fixed_role'" label="选择角色">
        <a-select
          :value="configData.value"
          mode="multiple"
          placeholder="请选择角色"
          @change="handleRoleChange"
          style="width: 100%; min-width: 300px;"
          :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }"
        >
          <a-select-option v-for="(role, index) in roleList" :key="`role-${role.id}-${index}`" :value="role.id">
            {{ role.roleName }}
          </a-select-option>
        </a-select>
      </a-form-item>
      
      <!-- 动态上级（仅审批节点） -->
      <a-form-item v-if="!isCopyNode && configData.type === 'dynamic_leader'" label="上级层级">
        <a-input-number
          v-model="configData.level"
          :min="1"
          :max="10"
          placeholder="输入层级"
          style="width: 100%"
        />
        <div style="margin-top: 8px; color: #999; font-size: 12px">
          1层 = 直接上级，2层 = 上级的上级，以此类推
        </div>
      </a-form-item>
      
      <!-- 审批规则（仅审批节点） -->
      <a-form-item v-if="!isCopyNode" label="审批规则">
        <a-radio-group v-model="configData.ruleType">
          <a-radio value="all">会签（全部通过）</a-radio>
          <a-radio value="any">或签（任一通过）</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
export default {
  name: 'NodeApprovalConfig',
  props: {
    node: {
      type: Object,
      required: true
    },
    userList: {
      type: Array,
      default: () => []
    },
    deptTree: {
      type: Array,
      default: () => []
    },
    roleList: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    isCopyNode() {
      return this.node.type === 'copy'
    },
    configData() {
      // 根据节点类型返回对应的配置对象
      if (this.isCopyNode) {
        return this.node.copyUsers || { type: 'fixed_user', value: [] }
      } else {
        return this.node.approvers || { type: 'fixed_user', value: [], ruleType: 'all' }
      }
    },
    deptTreeData() {
      return this.formatDeptTree(this.deptTree)
    },
    // 去重后的用户列表，确保没有重复的用户 ID
    uniqueUserList() {
      if (!this.userList || !Array.isArray(this.userList)) {
        return []
      }
      const userMap = new Map()
      this.userList.forEach(user => {
        if (user && user.id && !userMap.has(String(user.id))) {
          userMap.set(String(user.id), user)
        }
      })
      return Array.from(userMap.values())
    }
  },
  methods: {
    normalizeIds(value) {
      if (!Array.isArray(value)) return []
      const normalized = value
        .filter(v => v !== undefined && v !== null && v !== '')
        .map(v => String(v))
      return Array.from(new Set(normalized))
    },

    formatDeptTree(tree) {
      if (!Array.isArray(tree)) return []
      return tree.map(node => ({
        id: node.id,
        title: node.departName || node.title,
        value: node.id,
        key: node.id,
        children: node.children ? this.formatDeptTree(node.children) : undefined
      }))
    },
    
    onTypeChange() {
      // 切换类型时清空值
      const newType = this.configData.type
      
      if (this.isCopyNode) {
        // 抄送节点不支持 dynamic_leader，所以直接设置为空数组
        this.$set(this.node, 'copyUsers', {
          type: newType,
          value: []
        })
      } else {
        // 审批节点
        const newConfig = {
          type: newType,
          value: newType === 'dynamic_leader' ? 1 : [],
          ruleType: this.node.approvers && this.node.approvers.ruleType ? this.node.approvers.ruleType : 'all'
        }
        // 如果是动态上级，设置默认层级
        if (newType === 'dynamic_leader') {
          newConfig.level = 1
        }
        // 完全替换配置对象，确保清空所有旧值
        this.$set(this.node, 'approvers', newConfig)
      }
      this.$emit('update')
    },
    
    filterUserOption(input, option) {
      const text = option.componentOptions.children[0].text
      return text.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
    
    handleUserChange(value) {
      console.log('用户选择变化:', value)
      // 确保 configData.value 是数组，并去重
      const newValue = this.normalizeIds(value)
      console.log('去重后的值:', newValue)
      
      // 直接更新，不使用 $nextTick，避免延迟导致的重复渲染问题
      if (this.isCopyNode) {
        if (!this.node.copyUsers) {
          this.$set(this.node, 'copyUsers', {
            type: 'fixed_user',
            value: []
          })
        }
        this.$set(this.node.copyUsers, 'value', newValue)
      } else {
        if (!this.node.approvers) {
          this.$set(this.node, 'approvers', {
            type: 'fixed_user',
            value: [],
            ruleType: 'all'
          })
        }
        this.$set(this.node.approvers, 'value', newValue)
      }
      
      // 触发更新事件
      this.$emit('update')
    },
    
    handleRoleChange(value) {
      // 确保 configData.value 是数组
      const newValue = Array.isArray(value) ? value : []
      
      if (this.isCopyNode) {
        if (!this.node.copyUsers) {
          this.$set(this.node, 'copyUsers', {
            type: 'fixed_role',
            value: []
          })
        }
        this.$set(this.node.copyUsers, 'value', newValue)
      } else {
        if (!this.node.approvers) {
          this.$set(this.node, 'approvers', {
            type: 'fixed_role',
            value: [],
            ruleType: 'all'
          })
        }
        this.$set(this.node.approvers, 'value', newValue)
      }
      
      // 触发更新事件
      this.$emit('update')
    }
  },
  watch: {
    node: {
      handler(newVal) {
        if (this.isCopyNode) {
          // 确保 copyUsers 对象存在
          if (!newVal.copyUsers) {
            this.$set(newVal, 'copyUsers', {
              type: 'fixed_user',
              value: []
            })
          }
        } else {
          // 确保 approvers 对象存在
          if (!newVal.approvers) {
            this.$set(newVal, 'approvers', {
              type: 'fixed_user',
              value: [],
              ruleType: 'all'
            })
          }
        }

        const target = this.isCopyNode ? newVal.copyUsers : newVal.approvers
        if (target) {
          const normalizedValue = this.normalizeIds(target.value)
          const originalValue = Array.isArray(target.value) ? target.value.map(v => String(v)) : []
          const hasDifference =
            normalizedValue.length !== originalValue.length ||
            normalizedValue.some((id, index) => id !== originalValue[index])

          if (hasDifference) {
            this.$set(target, 'value', normalizedValue)
          }
        }
        // 触发更新事件
        this.$emit('update')
      },
      immediate: true,
      deep: true
    }
    // 移除 configData 的 watch，避免循环更新
    // configData: {
    //   handler(newVal) {
    //     // 同步配置数据到节点
    //     if (this.isCopyNode) {
    //       this.$set(this.node, 'copyUsers', newVal)
    //     } else {
    //       this.$set(this.node, 'approvers', newVal)
    //     }
    //     this.$emit('update')
    //   },
    //   deep: true
    // }
  }
}
</script>

<style scoped lang="less">
.node-approval-config {
  // 样式
  
  // 选择框样式，确保文字显示完整
  :deep(.ant-select) {
    width: 100%;
    min-width: 350px;
    
    .ant-select-selection {
      min-height: 32px;
    }
    
    .ant-select-selection__choice {
      max-width: 100%;
      margin: 2px 4px 2px 0;
      
      .ant-select-selection__choice__content {
        overflow: visible;
        white-space: normal;
        word-break: break-all;
      }
    }
  }
  
  :deep(.ant-tree-select) {
    width: 100%;
    min-width: 350px;
    
    .ant-select-selection {
      min-height: 32px;
    }
    
    .ant-select-selection__choice {
      max-width: 100%;
      margin: 2px 4px 2px 0;
      
      .ant-select-selection__choice__content {
        overflow: visible;
        white-space: normal;
        word-break: break-all;
      }
    }
  }
}
</style>
