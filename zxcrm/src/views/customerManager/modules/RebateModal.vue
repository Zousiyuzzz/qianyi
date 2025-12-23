<template>
  <j-modal :title="title" :width="width" :visible="visible" switchFullscreen @ok="handleOk"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }" @cancel="handleCancel" cancelText="关闭">
    <RebateForm ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></RebateForm>
  </j-modal>
</template>

<script>

import RebateForm from './RebateForm.vue'
export default {
  name: 'RebateModal',
  components: {
    RebateForm
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