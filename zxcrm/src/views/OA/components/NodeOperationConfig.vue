<template>
  <div class="node-operation-config">
    <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="节点名称">
        <a-input v-model="node.label" placeholder="请输入节点名称" />
      </a-form-item>
      
      <a-form-item label="操作类型">
        <a-select v-model="configData.operation_type" placeholder="请选择操作类型" style="width: 100%">
          <a-select-option v-for="item in operationTypes" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { operationTypes } from '../config/operationTypes'

export default {
  name: 'NodeOperationConfig',
  props: {
    node: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      operationTypes,
      configData: {
        operation_type: ''
      }
    }
  },
  watch: {
    node: {
      immediate: true,
      deep: true,
      handler(newNode) {
        if (newNode && newNode.operation && newNode.operation.operation_type) {
          this.configData = {
            operation_type: newNode.operation.operation_type
          }
        } else {
          // 如果没有配置，默认选择第一个选项
          this.configData = {
            operation_type: this.operationTypes.length > 0 ? this.operationTypes[0].value : ''
          }
        }
      }
    },
    configData: {
      deep: true,
      handler() {
        this.updateNode()
      }
    },
    'node.label'() {
      this.updateNode()
    }
  },
  methods: {
    updateNode() {
      // 更新节点的 operation 属性
      if (!this.node.operation) {
        this.$set(this.node, 'operation', {})
      }
      this.$set(this.node.operation, 'operation_type', this.configData.operation_type)
      
      // 触发更新事件
      this.$emit('update')
    }
  }
}
</script>

<style scoped lang="less">
.node-operation-config {
  padding: 16px 0;
}
</style>

