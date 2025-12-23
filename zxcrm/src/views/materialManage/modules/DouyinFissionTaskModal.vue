<template>
    <j-modal :title="title" :width="width" :visible="visible" switchFullscreen @ok="handleOk"
        :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }" @cancel="handleCancel" cancelText="关闭">
        <douyin-fission-task-form ref="realForm" @ok="submitCallback"
            :disabled="disableSubmit"></douyin-fission-task-form>
    </j-modal>
</template>

<script>

import DouyinFissionTaskForm from './DouyinFissionTaskForm'
export default {
    name: 'DouyinFissionTaskModal',
    components: {
        DouyinFissionTaskForm
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
            this.title = "新增"
            this.disableSubmit = false
            this.$nextTick(() => {
                this.$refs.realForm.add();
            })
        },
        edit(record) {
            this.visible = true
            this.title = "编辑"
            this.disableSubmit = false
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
