<template>
  <j-modal :title="title" :width="width" :visible="visible" switchFullscreen @ok="handleOk"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }" @cancel="handleCancel" cancelText="关闭">
    <tab-platformverify-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></tab-platformverify-form>
  </j-modal>
</template>

<script>

import TabPlatformverifyForm from './TabPlatformverifyForm'
export default {
  name: 'TabPlatformverifyModal',
  components: {
    TabPlatformverifyForm
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
    add(record) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.add(record);
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