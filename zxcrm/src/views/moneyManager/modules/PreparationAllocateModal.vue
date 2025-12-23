<template>
    <j-modal :title="title" :width="width" :visible="visible" switchFullscreen @ok="handleOk"
        :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }" @cancel="handleCancel" cancelText="关闭">
        <preparation-allocate-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"
            :sourceType="sourceType"></preparation-allocate-form>
    </j-modal>
</template>

<script>
import PreparationAllocateForm from './PreparationAllocateForm'
export default {
    name: 'PreparationAllocateModal',
    components: {
        PreparationAllocateForm
    },
    data() {
        return {
            title: '',
            width: 800,
            visible: false,
            disableSubmit: false,
            sourceType: 'fundPool' // 'bankApi' | 'h5Workbench' | 'fundPool'
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
            // 根据备注确定来源类型
            this.sourceType = this.getSourceType(record.remarks)
            this.visible = true
            this.$nextTick(() => {
                this.$refs.realForm.edit(record);
            })
        },
        // 根据备注获取来源类型
        getSourceType(remarks) {
            if (!remarks) {
                return 'fundPool'
            }
            const remarksStr = String(remarks).trim()
            if (remarksStr === '银行到账') {
                return 'bankApi'
            } else if (remarksStr === '对公备款' || remarksStr === '对私备款') {
                return 'fundPool'
            } else if (remarksStr.startsWith('对公备款') || remarksStr.startsWith('对私备款')) {
                return 'h5Workbench'
            } else {
                return 'fundPool'
            }
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
