<template>
    <a-modal title="变更客户" :visible="visible" @ok="handleOk" @cancel="handleCancel" :confirmLoading="loading"
        width="500px" destroyOnClose>
        <a-form :form="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
            <a-form-item label="钱包名称">
                <a-input v-model="formData.walletName" disabled />
            </a-form-item>
            <a-form-item label="钱包ID">
                <a-input v-model="formData.walletId" disabled />
            </a-form-item>
            <!-- <a-form-model-item label="媒体平台" prop="isMediaPlatform">
                <a-select v-model="formData.isMediaPlatform" placeholder="请选择媒体平台">
                    <a-select-option value="0">是</a-select-option>
                    <a-select-option value="1">否</a-select-option>
                </a-select>
            </a-form-model-item> -->
            <a-form-item label="归属项目" :validateStatus="validateStatus" :help="validateHelp" required>
                <JSearchSelectTag placeholder="请选择项目" v-model="formData.proId"
                    dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
            </a-form-item>
            <a-form-item label="返点模板" v-if="formData.proId">
                <JSearchSelectTag placeholder="请选择返点模板" v-model="formData.rebateTeptId"
                    :dict="`tab_customer_rebate_template,rebate_name,id,del_flag = '0' and customer_id='${formData.proId}'`"
                    async allowClear />
            </a-form-item>

        </a-form>
    </a-modal>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
    name: 'ChangeProjectModal',
    props: {
        visible: Boolean,
        record: Object,
        // activeTab: String
    },
    data() {
        return {
            form: this.$form.createForm(this),
            formData: {
                id: '',
                walletId: '',
                walletName: '',
                proId: '',
                rebateTeptId: ''
            },
            customerList: [
                // 示例数据，实际可通过接口获取
                { id: '1', name: '客户A' },
                { id: '2', name: '客户B' }
            ],
            loading: false,
            validateStatus: '',
            validateHelp: ''
        }
    },
    watch: {
        record: {
            immediate: true,
            handler(val) {
                if (val) {
                    this.formData.id = val.id || ''
                    this.formData.walletName = val.walletName || ''
                    this.formData.walletId = val.walletId || ''
                    this.formData.proId = val.proId || ''
                    this.formData.rebateTeptId = val.rebateTeptId || ''
                }
            }
        },
        'formData.proId': {
            handler(newVal, oldVal) {
                if (newVal !== oldVal) {
                    // 当归属项目改变时，清空返点模板选择
                    this.formData.rebateTeptId = ''
                }
            }
        }
    },
    methods: {
        async handleOk() {
            if (!this.formData.proId) {
                this.validateStatus = 'error'
                this.validateHelp = '请选择归属项目'
                return
            }
            this.validateStatus = ''
            this.validateHelp = ''
            this.loading = true
            try {
                const params = {
                    id: this.formData.id,
                    walletId: this.formData.walletId,
                    walletName: this.formData.walletName,
                    proId: this.formData.proId,
                    rebateTeptId: this.formData.rebateTeptId,
                    // isMediaPlatform: this.formData.isMediaPlatform
                }
                const res = await postAction('/advertiserWalletInfo/bindingPro', params)
                if (res.success) {
                    this.$message.success(res.message || '变更成功')
                    this.$emit('ok')
                } else {
                    this.$message.error(res.message || '变更失败')
                }
            } catch (e) {
                this.$message.error('请求异常')
            } finally {
                this.loading = false
            }
        },
        handleCancel() {
            // this.formData.capitalType = ''
            this.$emit('cancel')
        }
    }
}
</script>