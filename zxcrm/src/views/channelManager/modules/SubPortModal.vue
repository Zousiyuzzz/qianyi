<template>
    <j-modal :title="title" :width="width" :visible="visible" switchFullscreen @ok="handleOk"
        :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }" @cancel="handleCancel" cancelText="关闭">
        <sub-port-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></sub-port-form>
    </j-modal>
</template>

<script>
import SubPortForm from './SubPortForm'
export default {
    name: 'SubPortModal',
    components: {
        SubPortForm
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
        add(channelSign) {
            this.visible = true
            this.$nextTick(() => {
                this.$refs.realForm.add(channelSign);
            })
        },
        edit(record, channelSign) {
            this.visible = true
            this.$nextTick(() => {
                this.$refs.realForm.edit(record, channelSign);
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