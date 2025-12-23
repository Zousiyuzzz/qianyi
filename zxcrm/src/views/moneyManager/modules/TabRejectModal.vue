<template>
    <j-modal :title="title" :width="width" :visible="visible" switchFullscreen @ok="handleOk"
        :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }" @cancel="handleCancel" cancelText="关闭">
        <tab-reject-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></tab-reject-form>
    </j-modal>
</template>

<script>

import TabRejectForm from './TabRejectForm'
export default {
    name: 'TabRejectModal',
    components: {
        TabRejectForm
    },
    data() {
        return {
            title: '驳回原因',
            width: 600,
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