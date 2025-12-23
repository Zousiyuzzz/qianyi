<template>
  <a-drawer title="新增审批单" :width="900" :visible="visible" :maskClosable="false" @close="handleCancel"
    :bodyStyle="{ padding: '24px', paddingBottom: '60px', overflow: 'auto' }">
    <approval-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit" :businessType="businessType"
      :showPreview="showPreview" @preview-ready="handlePreviewReady" @update:showPreview="showPreview = $event"
      @submit-error="handleSubmitError">
    </approval-form>
    <div class="drawer-footer">
      <a-button @click="handleCancel" style="margin-bottom: 0;">关闭</a-button>
      <a-button v-if="!showPreview" type="primary" @click="handleOk" :loading="loading"
        style="margin-bottom: 0;">确定</a-button>
      <template v-if="showPreview">
        <a-button @click="handleBackToEdit" style="margin-bottom: 0; margin-right: 8px;">返回编辑</a-button>
        <a-button type="primary" @click="handleSubmit" :loading="loading" style="margin-bottom: 0;">提交</a-button>
      </template>
    </div>
  </a-drawer>
</template>

<script>
import ApprovalForm from './ApprovalForm'
export default {
  name: 'ApprovalFormModal',
  components: {
    ApprovalForm
  },
  props: {
    businessType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      disableSubmit: false,
      showPreview: false,
      loading: false
    }
  },
  methods: {
    add(businessType) {
      this.visible = true
      this.showPreview = false
      this.$nextTick(() => {
        this.$refs.realForm.add(businessType)
      })
    },
    edit(record) {
      this.visible = true
      this.showPreview = false
      this.$nextTick(() => {
        this.$refs.realForm.edit(record)
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
      this.showPreview = false
    },
    handleOk() {
      // 点击确定，解析流程配置并显示预览 
      console.log('handleOk 被调用')
      if (!this.$refs.realForm) {
        console.error('realForm ref 不存在')
        this.$message.error('表单未初始化')
        return
      }

      this.loading = true
      console.log('开始解析流程配置...')
      this.$refs.realForm.parseAndPreview().then(() => {
        console.log('解析成功，显示预览')
        this.showPreview = true
        this.loading = false
      }).catch((error) => {
        this.loading = false
        console.error('解析流程配置失败:', error)
        const errorMsg = error && error.message ? error.message : '解析流程配置失败，请检查表单数据'
        this.$message.error(errorMsg)
      })
    },
    handleSubmit() {
      // 点击提交，真正提交表单
      this.loading = true
      this.$refs.realForm.confirmSubmit()
    },
    handleSubmitError() {
      // 提交失败，停止loading
      this.loading = false
    },
    handleBackToEdit() {
      // 返回编辑模式
      this.showPreview = false
      this.$refs.realForm.$emit('update:showPreview', false)
    },
    handlePreviewReady() {
      this.loading = false
    },
    submitCallback() {
      this.$emit('ok')
      this.visible = false
      this.showPreview = false
      this.loading = false
    },
    handleCancel() {
      this.close()
    }
  }
}
</script>

<style lang="less" scoped>
.drawer-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  left: 0;
  background: #fff;
  border-radius: 0 0 2px 2px;
  z-index: 10;
}

.ant-btn {
  margin-left: 8px;
}
</style>
