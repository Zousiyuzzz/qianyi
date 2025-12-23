<template>
  <j-modal :title="title" :width="width" :visible="visible" switchFullscreen @ok="handleOk"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }" @cancel="handleCancel" cancelText="关闭">
    <tab-fund-allocations-form ref="realForm" @ok="submitCallback"
      :disabled="disableSubmit"></tab-fund-allocations-form>
  </j-modal>
</template>

<script>

import TabFundAllocationsForm from './TabFundAllocationsForm'
export default {
  name: 'TabFundAllocationsModal',
  components: {
    TabFundAllocationsForm
  },
  data() {
    return {
      title: '分配资金',
      width: 800,
      visible: false,
      disableSubmit: false
    }
  },
  methods: {
    add(id) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.add(id);
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