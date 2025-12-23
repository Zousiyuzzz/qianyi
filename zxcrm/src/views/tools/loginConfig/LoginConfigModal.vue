<template>
    <j-modal :title="title" :width="width" :visible="visible" switchFullscreen @ok="handleOk"
        :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }" @cancel="handleCancel" cancelText="关闭">
        <login-config-form ref="realForm" @ok="submitCallback" @ricecow="handleRicecow"
            :disabled="disableSubmit"></login-config-form>
    </j-modal>
</template>

<script>
import LoginConfigForm from './LoginConfigForm'
export default {
    name: 'LoginConfigModal',
    components: {
        LoginConfigForm
    },
    data() {
        return {
            title: '',
            width: 600,
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
        },
        handleRicecow(data) {
            // 触发父组件的授权事件
            this.$emit('ricecow', data);
        }
    }
}
</script>