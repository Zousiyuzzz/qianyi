<template>
    <div>
        <a-spin :spinning="confirmLoading">
            <j-form-container :disabled="formDisabled">
                <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
                    <a-row>
                        <a-col :span="24">
                            <a-form-model-item label="项目" :labelCol="labelCol" :wrapperCol="wrapperCol"
                                prop="proId">
                                <JSearchSelectTag v-if="canEditProject" placeholder="请选择项目" v-model:value="model.proId"
                                    dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
                                <a-input v-else v-model="model.proName" disabled />
                            </a-form-model-item>
                        </a-col>
                        <a-col :span="24">
                            <a-form-model-item label="项目主体" :labelCol="labelCol" :wrapperCol="wrapperCol"
                                prop="customerTitleId">
                                <j-search-select-tag-add v-if="canEditCustomerTitle" ref="customerTitleSelect" placeholder="请选择项目主体"
                                    v-model="model.customerTitleId"
                                    :dict="`tab_bank_account,corporate_name,id,del_flag = '0' and source = '${1}' and customer_id = '${model.proId}'`"
                                    async notFoundText="点击新增" @onAdd="handleAddCustomerTitle" />
                                <a-input v-else v-model="model.customerTitle" disabled />
                            </a-form-model-item>
                        </a-col>
                        <a-col :span="24">
                            <a-form-model-item label="我方主体" :labelCol="labelCol" :wrapperCol="wrapperCol"
                                prop="ourTitleId">
                                <j-search-select-tag-add v-if="canEditOurTitle" ref="ourTitleSelect" placeholder="请选择我方主体"
                                    v-model="model.ourTitleId"
                                    :dict="`tab_bank_account,corporate_name,id,del_flag = '0' and source = '${2}'`"
                                    async notFoundText="点击新增" @onAdd="handleAddOurTitle" />
                                <a-input v-else v-model="model.ourTitle" disabled />
                            </a-form-model-item>
                        </a-col>
                        <a-col :span="24">
                            <a-form-model-item label="还款月份" :labelCol="labelCol" :wrapperCol="wrapperCol"
                                prop="dateMonth">
                                <a-month-picker v-model="model.dateMonth" placeholder="请选择还款月份" value-format="YYYY-MM"
                                    format="YYYY-MM" />
                            </a-form-model-item>
                        </a-col>
                        <a-col :span="24">
                            <a-form-model-item label="到账时间" :labelCol="labelCol" :wrapperCol="wrapperCol"
                                prop="arrivalTime">
                                <a-date-picker v-if="canEditArrivalTime" v-model="model.arrivalTime" placeholder="请选择到账时间"
                                    value-format="YYYY-MM-DD" format="YYYY-MM-DD" />
                                <a-input v-else v-model="model.arrivalTime" disabled />
                            </a-form-model-item>
                        </a-col>
                    </a-row>
                </a-form-model>
            </j-form-container>
        </a-spin>
        <!-- 银行账户新增弹窗 -->
        <tab-bank-account-modal ref="bankAccountModal" @ok="handleBankAccountAddOk"></tab-bank-account-modal>
    </div>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
import TabBankAccountModal from './TabBankAccountModal'

export default {
    components: {
        TabBankAccountModal
    },
    name: 'PreparationAllocateForm',
    props: {
        //表单禁用
        disabled: {
            type: Boolean,
            default: false,
            required: false
        },
        // 来源类型：'bankApi' | 'h5Workbench' | 'fundPool'
        sourceType: {
            type: String,
            default: 'fundPool'
        }
    },
    data() {
        return {
            model: {
                id: '',
                proId: '',
                proName: '',
                customerTitleId: '',
                customerTitle: '',
                ourTitleId: '',
                ourTitle: '',
                dateMonth: '',
                arrivalTime: ''
            },
            labelCol: {
                xs: { span: 24 },
                sm: { span: 5 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
            confirmLoading: false,
            validatorRules: {},
            url: {
                edit: "/projectFundReserve/edit"
            },
            currentAddType: null, // 当前新增类型：'customer' 项目主体 或 'our' 我方主体
            newAddedId: null // 新增后返回的ID
        }
    },
    computed: {
        formDisabled() {
            return this.disabled
        },
        // 情况1（银行API）：仅可以编辑项目
        // 情况2（H5工作台）：仅可以编辑项目主体和我方主体
        // 情况3（资金池）：仅可以编辑项目主体和我方主体
        canEditProject() {
            return this.sourceType === 'bankApi'
        },
        canEditCustomerTitle() {
            return this.sourceType === 'h5Workbench' || this.sourceType === 'fundPool'
        },
        canEditOurTitle() {
            return this.sourceType === 'h5Workbench' || this.sourceType === 'fundPool'
        },
        // 到账时间只在情况2、3可以编辑
        canEditArrivalTime() {
            return this.sourceType === 'h5Workbench' || this.sourceType === 'fundPool'
        }
    },
    created() {
        //备份model原始值
        this.modelDefault = JSON.parse(JSON.stringify(this.model));
    },
    methods: {
        add() {
            this.edit(this.modelDefault);
        },
        edit(record) {
            this.model = Object.assign({}, record);
            this.visible = true;
        },
        submitForm() {
            const that = this;
            // 触发表单验证
            this.$refs.form.validate(valid => {
                if (valid) {
                    that.confirmLoading = true;
                    let httpurl = this.url.edit;
                    let method = 'put';

                    httpAction(httpurl, this.model, method).then((res) => {
                        if (res.success) {
                            that.$message.success(res.message);
                            that.$emit('ok');
                        } else {
                            that.$message.warning(res.message);
                        }
                    }).finally(() => {
                        that.confirmLoading = false;
                    })
                }
            })
        },
        // 处理项目主体新增
        handleAddCustomerTitle(keyword) {
            this.currentAddType = 'customer'
            let proId = this.model.proId ? String(this.model.proId) : ''

            if (!proId && this.$refs.customerTitleSelect) {
                try {
                    const dict = this.$refs.customerTitleSelect.$attrs.dict || this.$refs.customerTitleSelect.dict
                    if (dict) {
                        const match = dict.match(/customer_id\s*=\s*['"]?(\d+)['"]?/i)
                        if (match && match[1]) {
                            proId = match[1]
                        }
                    }
                } catch (e) {
                    console.warn('无法从组件中获取 dict:', e)
                }
            }

            const initialData = {
                source: '1',
                customerId: proId,
                corporateName: keyword || ''
            }

            if (!proId) {
                this.$message.warning('请先选择项目，或确保项目ID已正确设置')
                return
            }
            this.$refs.bankAccountModal.add(initialData)
        },
        // 处理我方主体新增
        handleAddOurTitle(keyword) {
            this.currentAddType = 'our'
            const initialData = {
                source: 2,
                corporateName: keyword || ''
            }
            this.$refs.bankAccountModal.add(initialData)
        },
        // 银行账户新增成功回调
        handleBankAccountAddOk(result) {
            if (result && result.id) {
                this.newAddedId = result.id
            } else {
                const form = this.$refs.bankAccountModal.$refs.realForm
                if (form && form.model && form.model.id) {
                    this.newAddedId = form.model.id
                }
            }

            if (this.newAddedId) {
                this.refreshSelect()
            }
        },
        // 刷新下拉列表并选中新项
        async refreshSelect() {
            if (!this.newAddedId) {
                this.currentAddType = null
                return
            }

            if (this.currentAddType === 'customer' && this.$refs.customerTitleSelect) {
                try {
                    await this.$refs.customerTitleSelect.refreshData()
                    this.$nextTick(() => {
                        this.model.customerTitleId = this.newAddedId
                        this.newAddedId = null
                        this.currentAddType = null
                    })
                } catch (error) {
                    console.error('刷新项目主体下拉失败:', error)
                    this.model.customerTitleId = this.newAddedId
                    this.newAddedId = null
                    this.currentAddType = null
                }
            } else if (this.currentAddType === 'our' && this.$refs.ourTitleSelect) {
                try {
                    await this.$refs.ourTitleSelect.refreshData()
                    this.$nextTick(() => {
                        this.model.ourTitleId = this.newAddedId
                        this.newAddedId = null
                        this.currentAddType = null
                    })
                } catch (error) {
                    console.error('刷新我方主体下拉失败:', error)
                    this.model.ourTitleId = this.newAddedId
                    this.newAddedId = null
                    this.currentAddType = null
                }
            } else {
                this.currentAddType = null
            }
        },
    }
}
</script>

