<template>
  <j-modal :title="title" :width="width" :visible="visible" switchFullscreen @ok="handleOk"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }" @cancel="handleCancel" cancelText="关闭">
    <tab-advertiser-info-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></tab-advertiser-info-form>
  </j-modal>
</template>

<script>

import TabAdvertiserInfoForm from './TabAdvertiserInfoForm'
export default {
  name: 'TabAdvertiserInfoModal',
  components: {
    TabAdvertiserInfoForm
  },
  data() {
    return {
      title: '新增',
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