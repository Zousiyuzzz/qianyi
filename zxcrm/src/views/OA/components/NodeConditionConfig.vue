<template>
  <div class="node-condition-config">
    <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <!-- 节点名称和条件类型在一行 -->
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="节点名称" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
            <a-input v-model="node.label" placeholder="请输入节点名称" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="条件类型" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
            <a-select v-model="node.condition.type" @change="onConditionTypeChange" style="width: 100%">
              <a-select-option value="dept">部门判断</a-select-option>
              <a-select-option value="role">角色判断</a-select-option>
              <a-select-option value="form_field">表单字段</a-select-option>
              <a-select-option value="user_field">用户字段</a-select-option>
              <a-select-option value="amount">金额判断</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 条件分支配置 -->
      <a-form-item label="条件分支">
        <a-alert message="配置多个条件分支，每个分支有独立的名称和条件规则" type="info" show-icon style="margin-bottom: 12px">
          <template slot="description">
            <div style="margin-top: 4px;">
              <div>• 每个分支可以设置独立的条件规则</div>
              <div>• 分支名称将显示在连线上，用于标识该分支</div>
              <div>• 创建连线时，选择对应的分支名称即可</div>
            </div>
          </template>
        </a-alert>

        <!-- 条件分支列表（拖拽排序） -->
        <div class="branch-list-container">
          <draggable v-model="sortedBranches" handle=".drag-handle" @end="onDragEnd">
            <div v-for="(branch, index) in sortedBranches" :key="branch.sortOrder || index" class="branch-list-item"
              @click="handleEditBranch(branch, index)">
              <div class="drag-handle">
                <a-icon type="menu" />
              </div>
              <div class="branch-order">{{ branch.sortOrder || (index + 1) }}</div>
              <div class="branch-name">{{ branch.name || `分支${index + 1}` }}</div>
              <div class="branch-rules-count">
                <a-tag color="blue">{{ branch.rules ? branch.rules.length : 0 }} 条规则</a-tag>
              </div>
              <div class="branch-actions">
                <a-button type="link" size="small" icon="edit"
                  @click.stop="handleEditBranch(branch, index)">编辑</a-button>
                <a-button type="link" size="small" icon="delete" @click.stop="removeBranch(index)"
                  :disabled="sortedBranches.length <= 1">删除</a-button>
              </div>
            </div>
          </draggable>
        </div>

        <!-- 添加分支按钮 -->
        <a-button type="dashed" @click="addBranch" style="width: 100%; margin-top: 12px;">
          <a-icon type="plus" /> 添加条件分支
        </a-button>
      </a-form-item>

      <!-- 分支编辑抽屉 -->
      <a-drawer title="编辑条件分支" :visible="branchDrawerVisible" :width="800" placement="right"
        @close="handleBranchDrawerClose" :bodyStyle="{ padding: '24px' }">
        <BranchEditForm v-if="editingBranch" :branch="editingBranch" :conditionType="node.condition.type"
          :fieldOptions="getAvailableFields(node.condition.type)" :getFieldType="getFieldType"
          :getFieldConfig="getFieldConfig" :getSelectOptions="getSelectOptions" @save="handleBranchSave"
          @cancel="handleBranchDrawerClose" />
      </a-drawer>
    </a-form>
  </div>
</template>

<script>
import { getDictItems } from '@/components/dict/JDictSelectUtil'
import JSearchSelectTag from '@/components/dict/JSearchSelectTag'
import draggable from 'vuedraggable'
import BranchEditForm from './BranchEditForm.vue'

export default {
  name: 'NodeConditionConfig',
  components: {
    JSearchSelectTag,
    draggable,
    BranchEditForm
  },
  props: {
    node: {
      type: Object,
      required: true
    },
    allNodes: {
      type: Array,
      default: () => []
    },
    businessType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      formFieldOptions: [], // 从数据字典加载的表单字段列表
      fieldConfigMap: {}, // 字段配置映射 { fieldName: { type, dict } }
      loadingFormFields: false,
      branchDrawerVisible: false,
      editingBranch: null,
      editingBranchIndex: -1
    }
  },
  computed: {
    sortedBranches: {
      get() {
        const branches = this.node.condition.branches || []
        // 确保每个分支都有 sortOrder
        branches.forEach((branch, index) => {
          if (branch.sortOrder === undefined || branch.sortOrder === null) {
            this.$set(branch, 'sortOrder', index + 1)
          }
        })
        // 按 sortOrder 排序
        return [...branches].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      },
      set(newBranches) {
        // 更新 sortOrder
        newBranches.forEach((branch, index) => {
          this.$set(branch, 'sortOrder', index + 1)
        })
        // 更新原始数组
        this.$set(this.node.condition, 'branches', newBranches)
        this.$emit('update')
      }
    },
    availableNodes() {
      // 排除当前节点和开始节点
      return this.allNodes.filter(n => {
        const nodeData = n.getData ? n.getData() : n
        return nodeData.id !== this.node.id && nodeData.type !== 'start'
      }).map(n => {
        const nodeData = n.getData ? n.getData() : n
        return {
          id: nodeData.id,
          label: nodeData.label || nodeData.id,
          type: nodeData.type || 'unknown'
        }
      })
    },

    fieldOptions() {
      return {
        dept: [
          { label: '部门ID', value: 'departIds' },
          { label: '第一个部门ID', value: 'departId' }
        ],
        role: [
          { label: '角色ID', value: 'roleIds' }
        ],
        form_field: this.formFieldOptions, // 从数据字典动态获取
        user_field: [
          { label: '用户ID', value: 'userId' },
          { label: '用户身份', value: 'userIdentity' },
          { label: '部门ID', value: 'departIds' }
        ],
        amount: [
          { label: '金额', value: 'amount' }
        ]
      }
    }
  },
  watch: {
    businessType: {
      handler(newVal, oldVal) {
        console.log('businessType watch 触发，newVal:', newVal, 'oldVal:', oldVal)
        if (newVal && newVal.trim()) {
          this.loadFormFieldsFromDict(newVal.trim())
        } else {
          console.warn('businessType 为空，清空表单字段')
          this.formFieldOptions = []
          this.fieldConfigMap = {}
        }
      },
      immediate: true
    }
  },
  mounted() {
    // 组件挂载时，如果 businessType 已有值，立即加载
    if (this.businessType && this.businessType.trim()) {
      console.log('mounted 时加载表单字段，businessType:', this.businessType)
      this.loadFormFieldsFromDict(this.businessType.trim())
    }
  },
  methods: {
    // 从数据字典加载表单字段
    async loadFormFieldsFromDict(businessType) {
      console.log('loadFormFieldsFromDict 被调用，businessType:', businessType)
      if (!businessType) {
        console.warn('businessType 为空，清空表单字段')
        this.formFieldOptions = []
        this.fieldConfigMap = {}
        return
      }

      this.loadingFormFields = true
      try {
        // 第一步：查询映射字典 flow_to_dict_code，获取字段字典code
        const mappingDictItems = await getDictItems('flow_to_dict_code')
        console.log('映射字典 flow_to_dict_code 数据:', mappingDictItems)

        // 查找映射项：可能是 value 匹配 businessType，也可能是 text 匹配 businessType
        let mappingItem = mappingDictItems.find(item => item.value === businessType)
        if (!mappingItem) {
          // 如果 value 不匹配，尝试用 text 匹配（因为字典配置可能是反过来的）
          mappingItem = mappingDictItems.find(item => item.text === businessType || item.label === businessType)
        }
        console.log('找到的映射项:', mappingItem)

        if (!mappingItem) {
          console.warn(`业务类型 ${businessType} 在 flow_to_dict_code 字典中未找到映射`)
          this.formFieldOptions = []
          this.fieldConfigMap = {}
          return
        }

        // 字段字典 code：如果 value 是业务类型，则 text 是字段字典 code；否则 value 是字段字典 code
        const fieldDictCode = mappingItem.value === businessType ? mappingItem.text : mappingItem.value
        console.log('字段字典 code:', fieldDictCode, '（从 mappingItem.value 获取）')
        console.log('字段字典 code:', fieldDictCode)

        // 第二步：查询字段字典，获取字段列表
        const fieldDictItems = await getDictItems(fieldDictCode)
        console.log('字段字典数据:', fieldDictItems)

        // 解析字段配置
        this.formFieldOptions = []
        this.fieldConfigMap = {}

        fieldDictItems.forEach(item => {
          const fieldName = item.value // 例如：proId

          // 解析 JSON 配置字符串
          // 支持的 type：
          // 1. "text" - 普通文本输入框（a-input）
          // 2. "JSearchSelectTag" - 搜索选择组件
          // 3. "a-select" - 普通下拉选择（a-select），需要在 props.options 中提供选项数组
          // 
          // 规则格式：{"type":"组件名","props":{"属性名":"属性值"}}
          // 例如：
          //   {"type":"text"} - 文本输入框
          //   {"type":"JSearchSelectTag","props":{"dict":"sys_user,realname,id,del_flag = '0'","async":true}}
          //   {"type":"a-select","props":{"options":[{"label":"选项1","value":"1"},{"label":"选项2","value":"2"}]}}
          let fieldConfig = null
          let fieldLabel = fieldName // 默认使用字段名作为标签

          try {
            // 配置可能在 text、description 或 title 字段中
            // 优先使用 description，因为用户的数据在 description 中
            const configStr = item.description || item.text || ''
            console.log(`字段 ${fieldName} 的配置字符串:`, configStr)

            // 如果 configStr 是 JSON 配置，则从其他地方获取标签
            if (configStr && configStr.trim().startsWith('{')) {
              const parsed = JSON.parse(configStr)
              console.log(`字段 ${fieldName} 解析后的配置:`, parsed)

              // 如果配置中有 label 字段，使用它作为标签
              if (parsed.label) {
                fieldLabel = parsed.label
              } else {
                // 否则使用 title 或 label 字段，如果都没有则使用字段名
                fieldLabel = item.title || item.label || item.text || fieldName
              }

              // 新格式：{"type":"组件名","props":{...}}
              if (parsed.type && parsed.props) {
                fieldConfig = {
                  type: parsed.type,
                  props: parsed.props
                }
                console.log(`字段 ${fieldName} 配置类型: ${parsed.type}`, fieldConfig)
              }
              // 只有 type，没有 props（如 {"type":"text"}）
              else if (parsed.type) {
                fieldConfig = {
                  type: parsed.type,
                  props: parsed.props || {}
                }
                console.log(`字段 ${fieldName} 配置类型: ${parsed.type} (无props)`, fieldConfig)
              }
              // 兼容旧格式：{"type":"Jselect","dict":"..."}
              else if (parsed.type && parsed.dict) {
                fieldConfig = {
                  type: parsed.type === 'Jselect' ? 'JSearchSelectTag' : parsed.type,
                  props: {
                    dict: parsed.dict
                  }
                }
                console.log(`字段 ${fieldName} 配置类型: ${parsed.type} (旧格式)`, fieldConfig)
              }
            } else {
              // 如果 configStr 不是 JSON，则 configStr 就是字段标签
              fieldLabel = configStr || item.title || item.label || fieldName
              // 如果没有配置或配置为空，默认为 text 类型
              if (!configStr || configStr.trim() === '') {
                fieldConfig = {
                  type: 'text',
                  props: {}
                }
              }
            }
          } catch (e) {
            console.warn(`字段 ${fieldName} 的配置解析失败:`, e, 'item:', item)
            // 解析失败时，使用 text 或 title 作为标签
            fieldLabel = item.text || item.title || item.label || fieldName
            // 解析失败时，默认为 text 类型
            fieldConfig = {
              type: 'text',
              props: {}
            }
          }

          // 添加到字段选项列表
          console.log(`添加字段选项: ${fieldName} -> ${fieldLabel}`, '配置:', fieldConfig)
          this.formFieldOptions.push({
            value: fieldName,
            label: fieldLabel
          })

          // 存储字段配置（即使 fieldConfig 为 null，也要存储，确保能正确判断）
          if (fieldConfig) {
            this.fieldConfigMap[fieldName] = fieldConfig
            console.log(`存储字段配置: ${fieldName}`, this.fieldConfigMap[fieldName])
          } else {
            console.log(`字段 ${fieldName} 没有配置，将使用默认 text 类型`)
          }
        })

        // 如果没有获取到数据，使用默认字段（兼容性处理）
        if (this.formFieldOptions.length === 0) {
          console.warn(`字段字典 ${fieldDictCode} 不存在或为空，使用默认字段`)
          this.formFieldOptions = [
            { label: '金额', value: 'amount' },
            { label: '项目ID', value: 'projectId' }
          ]
        } else {
          console.log('成功加载表单字段，数量:', this.formFieldOptions.length, '字段列表:', this.formFieldOptions)
        }
      } catch (error) {
        console.error('加载表单字段失败:', error)
        // 出错时使用默认字段
        this.formFieldOptions = [
          { label: '金额', value: 'amount' },
          { label: '项目ID', value: 'projectId' }
        ]
        this.fieldConfigMap = {}
      } finally {
        this.loadingFormFields = false
      }
    },

    // 获取字段配置
    getFieldConfig(fieldName) {
      return this.fieldConfigMap[fieldName] || null
    },

    // 获取字段类型
    getFieldType(fieldName) {
      const fieldConfig = this.getFieldConfig(fieldName)
      if (fieldConfig && fieldConfig.type) {
        return fieldConfig.type
      }
      // 内置字段类型判断
      if (['departIds', 'departId', 'roleIds'].includes(fieldName)) {
        return 'a-select'
      }
      return 'text' // 默认返回文本类型
    },

    // 获取 a-select 的选项列表
    getSelectOptions(fieldName) {
      const fieldConfig = this.getFieldConfig(fieldName)
      if (fieldConfig && fieldConfig.props && fieldConfig.props.options) {
        // 从配置中获取选项
        return fieldConfig.props.options
      }
      // 内置字段的选项
      if (fieldName === 'departIds' || fieldName === 'departId') {
        // 这里可以返回部门列表，如果需要的话
        return []
      }
      if (fieldName === 'roleIds') {
        // 这里可以返回角色列表，如果需要的话
        return []
      }
      return []
    },

    getAvailableFields(conditionType) {
      return this.fieldOptions[conditionType] || []
    },

    getFieldOptions(field) {
      // 根据字段返回选项列表（如果需要）
      return []
    },

    isSelectField(field) {
      // 判断字段是否需要下拉选择（用于兼容旧代码）
      const fieldType = this.getFieldType(field)
      return ['JSearchSelectTag', 'a-select'].includes(fieldType)
    },


    addBranch() {
      if (!this.node.condition.branches) {
        this.$set(this.node.condition, 'branches', [])
      }
      const maxOrder = this.sortedBranches.length > 0
        ? Math.max(...this.sortedBranches.map(b => b.sortOrder || 0))
        : 0
      const newBranch = {
        name: `分支${this.node.condition.branches.length + 1}`,
        sortOrder: maxOrder + 1,
        rules: [{
          field: '',
          operator: '=',
          value: ''
        }],
        logic: 'AND'
      }
      this.node.condition.branches.push(newBranch)
      // 打开编辑抽屉
      this.handleEditBranch(newBranch, this.node.condition.branches.length - 1)
      this.$emit('update')
    },
    onDragEnd() {
      // 拖拽结束后，重新计算 sortOrder
      this.sortedBranches.forEach((branch, index) => {
        this.$set(branch, 'sortOrder', index + 1)
      })
      this.$emit('update')
    },
    handleEditBranch(branch, index) {
      // 深拷贝分支数据，避免直接修改原数据
      this.editingBranch = JSON.parse(JSON.stringify(branch))
      this.editingBranchIndex = index
      this.branchDrawerVisible = true
    },
    handleBranchDrawerClose() {
      this.branchDrawerVisible = false
      this.editingBranch = null
      this.editingBranchIndex = -1
    },
    handleBranchSave(branchData) {
      // 更新分支数据
      if (this.editingBranchIndex >= 0 && this.editingBranchIndex < this.node.condition.branches.length) {
        // 保留 sortOrder
        branchData.sortOrder = this.node.condition.branches[this.editingBranchIndex].sortOrder
        this.$set(this.node.condition.branches, this.editingBranchIndex, branchData)
        this.$emit('update')
      }
      this.handleBranchDrawerClose()
    },

    removeBranch(index) {
      if (this.sortedBranches.length <= 1) {
        this.$message.warning('至少需要保留一个条件分支')
        return
      }
      // 找到要删除的分支
      const branchToRemove = this.sortedBranches[index]
      // 从原始数组中删除
      const originalIndex = this.node.condition.branches.findIndex(b =>
        b === branchToRemove || (b.sortOrder === branchToRemove.sortOrder && b.name === branchToRemove.name)
      )
      if (originalIndex >= 0) {
        this.node.condition.branches.splice(originalIndex, 1)
        // 重新计算 sortOrder
        this.node.condition.branches.forEach((b, i) => {
          this.$set(b, 'sortOrder', i + 1)
        })
        this.$emit('update')
      }
    },

    addBranchRule(branchIndex) {
      const branch = this.node.condition.branches[branchIndex]
      if (!branch.rules) {
        this.$set(branch, 'rules', [])
      }
      branch.rules.push({
        field: '',
        operator: '=',
        value: ''
      })
      this.$emit('update')
    },

    removeBranchRule(branchIndex, ruleIndex) {
      const branch = this.node.condition.branches[branchIndex]
      if (branch.rules.length <= 1) {
        this.$message.warning('至少需要保留一个条件规则')
        return
      }
      branch.rules.splice(ruleIndex, 1)
      this.$emit('update')
    },

    onConditionTypeChange() {
      // 切换条件类型时，清空规则
      if (!this.node.condition.rules || this.node.condition.rules.length === 0) {
        this.$set(this.node.condition, 'rules', [{
          field: '',
          operator: '=',
          value: ''
        }])
      }
      this.$emit('update')
    },

    // 获取节点类型标签
    getNodeTypeLabel(type) {
      const typeMap = {
        'start': '开始',
        'approval': '审批',
        'condition': '条件',
        'copy': '抄送',
        'end': '结束'
      }
      return typeMap[type] || type || '未知'
    },

    // 节点选择器过滤
    filterNodeOption(input, option) {
      if (!input) return true
      let text = ''
      if (option.componentOptions && option.componentOptions.children) {
        const firstChild = option.componentOptions.children[0]
        if (firstChild && firstChild.children && firstChild.children[0]) {
          text = firstChild.children[0].text || ''
        } else if (firstChild && firstChild.text) {
          text = firstChild.text || ''
        }
      }
      return text.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
  },
  watch: {
    node: {
      handler(newVal) {
        // 确保 condition 对象存在
        if (!newVal.condition) {
          this.$set(newVal, 'condition', {
            type: 'form_field',
            branches: [
              {
                name: '分支1',
                rules: [{
                  field: '',
                  operator: '=',
                  value: ''
                }],
                logic: 'AND'
              }
            ]
          })
        } else {
          // 确保 branches 存在
          if (!newVal.condition.branches || !Array.isArray(newVal.condition.branches)) {
            this.$set(newVal.condition, 'branches', [{
              name: '分支1',
              rules: [{
                field: '',
                operator: '=',
                value: ''
              }],
              logic: 'AND'
            }])
          } else {
            // 迁移旧数据格式（兼容旧版本）
            if (newVal.condition.branches.length > 0) {
              const firstBranch = newVal.condition.branches[0]
              // 如果分支有 condition 属性（旧格式），转换为新格式
              if (firstBranch && firstBranch.hasOwnProperty('condition')) {
                const newBranches = []
                newVal.condition.branches.forEach((oldBranch, index) => {
                  newBranches.push({
                    name: oldBranch.label || (oldBranch.condition ? '满足条件' : '不满足条件'),
                    rules: newVal.condition.rules || [{
                      field: '',
                      operator: '=',
                      value: ''
                    }],
                    logic: newVal.condition.logic || 'AND'
                  })
                })
                this.$set(newVal.condition, 'branches', newBranches)
                // 清空旧的 rules 和 logic（已迁移到分支中）
                if (newVal.condition.rules) {
                  delete newVal.condition.rules
                }
                if (newVal.condition.logic) {
                  delete newVal.condition.logic
                }
              }
            }
          }
        }
        // 触发更新事件
        this.$emit('update')
      },
      immediate: true,
      deep: true
    }
  }
}
</script>

<style scoped lang="less">
.node-condition-config {
  .error {
    border-color: #ff4d4f;
  }

  .branch-list-container {
    margin-top: 12px;
  }

  .branch-list-item {
    padding: 7px 16px;
    margin-bottom: 6px;
    background-color: #ffffff;
    border-radius: 8px;
    border: 1px solid #e5e5e7;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;

    &:hover {
      background-color: #ffffff;
      border-color: #d1d1d6;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transform: translateY(-1px);
    }

    .drag-handle {
      cursor: move;
      color: #86868b;
      font-size: 16px;
      display: flex;
      align-items: center;
      padding: 4px;

      &:hover {
        color: #1d1d1f;
      }
    }

    .branch-order {
      font-size: 14px;
      font-weight: 500;
      color: #1890ff;
      min-width: 30px;
      text-align: center;
    }

    .branch-name {
      font-size: 14px;
      font-weight: 500;
      color: #1d1d1f;
      flex: 1;
      letter-spacing: -0.01em;
      line-height: 1.3;
    }

    .branch-rules-count {
      flex-shrink: 0;
    }

    .branch-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
  }
}
</style>
