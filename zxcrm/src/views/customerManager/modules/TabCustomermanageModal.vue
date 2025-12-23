<template>
  <j-modal :title="title" :width="width" :visible="visible" switchFullscreen @ok="handleOk"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }" @cancel="handleCancel" cancelText="关闭"
    :myBodyStyle="{ top: '20px' }">
    <tab-customermanage-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></tab-customermanage-form>
  </j-modal>
</template>

<script>
import TabCustomermanageForm from './TabCustomermanageForm'
export default {
  name: 'TabCustomermanageModal',
  components: {
    TabCustomermanageForm
  },
  data() {
    return {
      title: '',
      width: 800,
      visible: false,
      disableSubmit: false
    }
  },
  methods: {
    add() {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.add();
      })
    },
    edit(record) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.edit(record);
      })
    },
    close() {
      this.$emit('close');
      this.visible = false;
    },
    handleOk() {
      this.$refs.realForm.submitForm();
    },
    submitCallback() {
      this.$emit('ok');
      this.visible = false;
    },
    handleCancel() {
      this.close()
    }
  }
}
</script>

<style scoped>
/* 全局样式 */
.custom-modal-style .ant-modal-content {
  border-radius: 10px;
  background-color: #f0f2f5;
}
</style>