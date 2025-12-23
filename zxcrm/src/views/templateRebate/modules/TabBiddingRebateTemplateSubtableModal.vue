<template>
  <j-modal :title="title" :width="width" :visible="visible" switchFullscreen @ok="handleOk"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }" @cancel="handleCancel" cancelText="关闭">
    <tab-bidding-rebate-template-subtable-form ref="realForm" @ok="submitCallback"
      :disabled="disableSubmit"></tab-bidding-rebate-template-subtable-form>
  </j-modal>
</template>

<script>

import TabBiddingRebateTemplateSubtableForm from './TabBiddingRebateTemplateSubtableForm'
export default {
  name: 'TabBiddingRebateTemplateSubtableModal',
  components: {
    TabBiddingRebateTemplateSubtableForm
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
    add(biddingRebateId) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.add(biddingRebateId);
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