<template>
  <div class="branch-edit-form">
    <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <!-- 分支名称 -->
      <a-form-item label="分支名称" :required="true">
        <a-input v-model="localBranch.name" placeholder="例如：金额大于1万" />
        <div v-if="!localBranch.name" style="color: #ff4d4f; font-size: 12px; margin-top: 4px;">
          分支名称不能为空，将显示在连线上
        </div>
      </a-form-item>

      <!-- 分支条件规则 -->
      <a-form-item label="条件规则">
        <div v-for="(rule, ruleIndex) in (localBranch.rules || [])" :key="ruleIndex"
          style="margin-bottom: 12px; padding: 12px; background: #fafafa; border: 1px solid #e8e8e8; border-radius: 4px; position: relative;">
          <!-- 删除按钮 -->
          <a-button type="danger" size="small" icon="delete" @click="removeRule(ruleIndex)"
            style="position: absolute; top: 8px; right: 8px; z-index: 10;" />

          <!-- 字段选择 -->
          <div style="margin-bottom: 8px;">
            <div style="margin-bottom: 4px; color: #666; font-size: 12px;">字段</div>
            <a-select v-model="rule.field" placeholder="选择字段" style="width: 100%">
              <a-select-option v-for="(field, fieldIndex) in fieldOptions"
                :key="`field-${field.value}-${fieldIndex}`" :value="field.value">
                {{ field.label }}
              </a-select-option>
            </a-select>
          </div>

          <!-- 操作符 -->
          <div style="margin-bottom: 8px;">
            <div style="margin-bottom: 4px; color: #666; font-size: 12px;">操作符</div>
            <a-select v-model="rule.operator" placeholder="选择操作符" style="width: 100%">
              <a-select-option value="=">等于</a-select-option>
              <a-select-option value="!=">不等于</a-select-option>
              <a-select-option value=">">大于</a-select-option>
              <a-select-option value=">=">大于等于</a-select-option>
              <a-select-option value="<">小于</a-select-option>
              <a-select-option value="<=">小于等于</a-select-option>
              <a-select-option value="in">包含于</a-select-option>
              <a-select-option value="not_in">不包含于</a-select-option>
              <a-select-option value="contains">包含</a-select-option>
            </a-select>
          </div>

          <!-- 值输入 -->
          <div>
            <div style="margin-bottom: 4px; color: #666; font-size: 12px;">值</div>
            <!-- JSearchSelectTag 类型：搜索选择组件（优先判断） -->
            <j-search-select-tag
              v-if="getFieldType(rule.field) === 'JSearchSelectTag' && getFieldConfig(rule.field)"
              v-model="rule.value" v-bind="getFieldConfig(rule.field).props" placeholder="选择值"
              style="width: 100%" />
            <!-- a-select 类型：普通下拉选择 -->
            <a-select v-else-if="getFieldType(rule.field) === 'a-select' && getFieldConfig(rule.field)"
              v-model="rule.value"
              :mode="rule.operator === 'in' || rule.operator === 'not_in' ? 'multiple' : 'default'"
              placeholder="选择值" style="width: 100%">
              <a-select-option v-for="(option, optionIndex) in getSelectOptions(rule.field)"
                :key="`option-${option.value}-${optionIndex}`" :value="option.value">
                {{ option.label }}
              </a-select-option>
            </a-select>
            <!-- text 类型或没有配置：普通文本输入框 -->
            <a-input v-else v-model="rule.value" placeholder="输入值" style="width: 100%" />
          </div>
        </div>
        <a-button type="dashed" size="small" @click="addRule" style="width: 100%">
          <a-icon type="plus" /> 添加条件规则
        </a-button>
      </a-form-item>

      <!-- 分支组合逻辑 -->
      <a-form-item v-if="localBranch.rules && localBranch.rules.length > 1" label="组合逻辑">
        <a-radio-group v-model="localBranch.logic">
          <a-radio value="AND">全部满足（AND）</a-radio>
          <a-radio value="OR">任一满足（OR）</a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 操作按钮 -->
      <a-form-item>
        <a-button type="primary" @click="handleSave" style="margin-right: 8px">保存</a-button>
        <a-button @click="handleCancel">取消</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import JSearchSelectTag from '@/components/dict/JSearchSelectTag'

export default {
  name: 'BranchEditForm',
  components: {
    JSearchSelectTag
  },
  props: {
    branch: {
      type: Object,
      required: true
    },
    conditionType: {
      type: String,
      default: ''
    },
    fieldOptions: {
      type: Array,
      default: () => []
    },
    getFieldType: {
      type: Function,
      required: true
    },
    getFieldConfig: {
      type: Function,
      required: true
    },
    getSelectOptions: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      localBranch: {
        name: '',
        rules: [],
        logic: 'AND'
      }
    }
  },
  watch: {
    branch: {
      handler(newVal) {
        if (newVal) {
          // 深拷贝并确保有默认值
          const cloned = JSON.parse(JSON.stringify(newVal))
          if (!cloned.rules || !Array.isArray(cloned.rules)) {
            cloned.rules = [{
              field: '',
              operator: '=',
              value: ''
            }]
          }
          if (!cloned.logic) {
            cloned.logic = 'AND'
          }
          this.localBranch = cloned
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    // 确保初始化
    if (this.branch) {
      const cloned = JSON.parse(JSON.stringify(this.branch))
      if (!cloned.rules || !Array.isArray(cloned.rules)) {
        cloned.rules = [{
          field: '',
          operator: '=',
          value: ''
        }]
      }
      if (!cloned.logic) {
        cloned.logic = 'AND'
      }
      this.localBranch = cloned
    }
  },
  methods: {
    addRule() {
      if (!this.localBranch.rules) {
        this.$set(this.localBranch, 'rules', [])
      }
      this.localBranch.rules.push({
        field: '',
        operator: '=',
        value: ''
      })
    },
    removeRule(ruleIndex) {
      if (!this.localBranch.rules || this.localBranch.rules.length <= 1) {
        this.$message.warning('至少需要保留一个条件规则')
        return
      }
      this.localBranch.rules.splice(ruleIndex, 1)
    },
    handleSave() {
      if (!this.localBranch.name || !this.localBranch.name.trim()) {
        this.$message.warning('请输入分支名称')
        return
      }
      this.$emit('save', this.localBranch)
    },
    handleCancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="less" scoped>
.branch-edit-form {
  padding: 0;
  
  /deep/ .ant-form-item {
    margin-bottom: 24px;
  }
  
  /deep/ .ant-form-item:last-child {
    margin-bottom: 0;
  }
}
</style>

