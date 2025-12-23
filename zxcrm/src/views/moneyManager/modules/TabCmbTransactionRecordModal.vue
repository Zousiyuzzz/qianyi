<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    switchFullscreen
    @ok="handleOk"
    :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
    @cancel="handleCancel"
    cancelText="关闭">
    <tab-cmb-transaction-record-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></tab-cmb-transaction-record-form>
  </j-modal>
</template>

<script>
import TabCmbTransactionRecordForm from './TabCmbTransactionRecordForm'
export default {
  name: 'TabCmbTransactionRecordModal',
  components: {
    TabCmbTransactionRecordForm
  },
  data () {
    return {
      title:'',
      width:1000,
      visible: false,
      disableSubmit: false
    }
  },
  methods: {
    add (initialData) {
      this.visible=true
      this.$nextTick(()=>{
        this.$refs.realForm.add(initialData);
      })
    },
    edit (record) {
      this.visible=true
      this.$nextTick(()=>{
        this.$refs.realForm.edit(record);
      })
    },
    close () {
      this.$emit('close');
      this.visible = false;
    },
    handleOk () {
      this.$refs.realForm.submitForm();
    },
    submitCallback(result){
      this.$emit('ok', result);
      this.visible = false;
    },
    handleCancel () {
      this.close()
    }
  }
}
</script>
