<template>
  <a-drawer :title="drawerTitle" :width="drawerWidth" :visible="visible" :maskClosable="false" :closable="true"
    @close="handleClose" class="approval-drawer">
    <a-spin :spinning="loading">
      <!-- 新增模式 -->
      <process-flow-form v-if="mode === 'add'" :business-type="businessType" :initial-form-data="formData"
        @preview="handlePreview" @cancel="handleClose" />

      <!-- 预览模式 -->
      <process-preview v-else-if="mode === 'preview'" :process-config="processConfig" :parsed-nodes="parsedNodes"
        :user-map="userMap" :dept-map="deptMap" :role-map="roleMap" :current-node-id="currentNodeId"
        :form-data="formData" :loading="submitLoading" @confirm="handlePreviewConfirm" @cancel="handlePreviewCancel">
        <template #form-preview>
          <slot name="form-preview" :form-data="formData"></slot>
        </template>
      </process-preview>

      <!-- 详情模式 -->
      <process-detail v-else-if="mode === 'detail'" :loading="loading" :approval-detail="approvalDetail"
        :form-data="formData" :file-list="fileList" :parsed-nodes="parsedNodes" :node-person-configs="nodePersonConfigs"
        :process-nodes="processNodes" :user-map="userMap" :current-node-id="currentNodeId" :list-item-id="listItemId"
        :show-actions="showActions" @refresh="handleDetailRefresh">
        <template #form-detail="slotProps">
          <slot name="form-detail" :form-data="slotProps.formData" :business-type="slotProps.businessType"></slot>
        </template>
      </process-detail>
    </a-spin>
  </a-drawer>
</template>

<script>
import ProcessFlowForm from './ProcessFlowForm.vue'
import ProcessPreview from './ProcessPreview.vue'
import ProcessDetail from './ProcessDetail.vue'

export default {
  name: 'ApprovalDrawer',
  components: {
    ProcessFlowForm,
    ProcessPreview,
    ProcessDetail
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'add', // 'add' | 'preview' | 'detail'
      validator: (value) => ['add', 'preview', 'detail'].includes(value)
    },
    businessType: {
      type: String,
      default: ''
    },
    // 预览模式相关
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
    fileList: {
      type: Array,
      default: () => []
    },
    // 详情模式相关
    nodePersonConfigs: {
      type: Array,
      default: () => []
    },
    processNodes: {
      type: Array,
      default: () => []
    },
    approvalDetail: {
      type: Object,
      default: null
    },
    listItemId: {
      type: [String, Number],
      default: null
    },
    showActions: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    submitLoading: {
      type: Boolean,
      default: false
    },
    drawerWidth: {
      type: [String, Number],
      default: 1200
    }
  },
  computed: {
    drawerTitle() {
      const titleMap = {
        'add': '新增审批',
        'preview': '审批预览',
        'detail': '审批详情'
      }
      return titleMap[this.mode] || '审批'
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleSubmit(data) {
      this.$emit('submit', data)
    },
    handlePreview(data) {
      // 从 ProcessFlowForm 接收预览数据，通知父组件切换到预览模式
      this.$emit('preview', data)
    },
    handlePreviewConfirm() {
      this.$emit('preview-confirm', {
        formData: this.formData,
        processConfig: this.processConfig,
        parsedNodes: this.parsedNodes
      })
    },
    handlePreviewCancel() {
      // 返回编辑模式，通知父组件
      this.$emit('preview-cancel')
    },
    handleDetailRefresh() {
      this.$emit('detail-refresh')
    }
  }
}
</script>

<style scoped lang="less">
.approval-drawer {
  :deep(.ant-drawer-body) {
    padding: 24px;
  }
}
</style>
