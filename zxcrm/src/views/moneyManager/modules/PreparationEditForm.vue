<template>
    <div>
        <a-spin :spinning="confirmLoading">
            <j-form-container :disabled="formDisabled">
                <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
                    <a-row>
                        <a-col :span="24" v-if="model.proId">
                            <a-form-model-item label="项目主体" :labelCol="labelCol" :wrapperCol="wrapperCol"
                                prop="customerTitleId">
                                <j-search-select-tag-add ref="customerTitleSelect" placeholder="请选择项目主体"
                                    v-model="model.customerTitleId"
                                    :dict="`tab_bank_account,corporate_name,id,del_flag = '0' and source = '${1}' and customer_id = '${model.proId}'`"
                                    async notFoundText="点击新增" @onAdd="handleAddCustomerTitle" />
                            </a-form-model-item>
                        </a-col>
                        <a-col :span="24">
                            <a-form-model-item label="我方主体" :labelCol="labelCol" :wrapperCol="wrapperCol"
                                prop="ourTitleId">
                                <j-search-select-tag-add ref="ourTitleSelect" placeholder="请选择我方主体"
                                    v-model="model.ourTitleId"
                                    :dict="`tab_bank_account,corporate_name,id,del_flag = '0' and source = '${2}'`"
                                    async notFoundText="点击新增" @onAdd="handleAddOurTitle" />
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
                                <a-date-picker v-model="model.arrivalTime" placeholder="请选择到账时间"
                                    value-format="YYYY-MM-DD" format="YYYY-MM-DD" />
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
    name: 'PreparationEditForm',
    props: {
        //表单禁用
        disabled: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    data() {
        return {
            model: {
                id: '',
                customerTitleId: '',
                ourTitleId: '',
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
            validatorRules: {
                // customerTitleId: [
                //     { required: true, message: '请输入项目主体!' }
                // ],
                // ourTitleId: [
                //     { required: true, message: '请输入我方主体!' }
                // ]
            },
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
            // 确保 proId 正确传递，转换为字符串
            let proId = this.model.proId ? String(this.model.proId) : ''

            // 如果 model.proId 为空，尝试从字典字符串中提取
            if (!proId && this.$refs.customerTitleSelect) {
                // 从模板中的字典字符串中提取 customer_id 的值
                // 格式: tab_bank_account,corporate_name,id,del_flag = '0' and source = '1' and customer_id = '1955924704290406401'
                const dictStr = `tab_bank_account,corporate_name,id,del_flag = '0' and source = '${1}' and customer_id = '${this.model.proId}'`
                // 但这里 this.model.proId 已经是空的了，所以我们需要从实际的 dict prop 中获取
                // 或者直接从模板中获取
                // 实际上，我们可以通过 $attrs 或者直接访问组件的 props
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
                source: '1', // 使用字符串，因为字典组件可能返回字符串
                customerId: proId,
                corporateName: keyword || ''
            }

            // 调试信息
            console.log('handleAddCustomerTitle - model.proId:', this.model.proId)
            console.log('handleAddCustomerTitle - model:', this.model)
            console.log('handleAddCustomerTitle - 提取的 proId:', proId)
            console.log('handleAddCustomerTitle - initialData:', initialData)

            // 如果 proId 为空，给出提示
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
            console.log('handleBankAccountAddOk 接收到 result:', result)
            // 从返回结果中获取新增的银行账户ID
            if (result && result.id) {
                this.newAddedId = result.id
                console.log('handleBankAccountAddOk 从 result 获取到 ID:', this.newAddedId)
            } else {
                // 如果没有ID，从表单中获取
                const form = this.$refs.bankAccountModal.$refs.realForm
                if (form && form.model && form.model.id) {
                    this.newAddedId = form.model.id
                    console.log('handleBankAccountAddOk 从 form.model 获取到 ID:', this.newAddedId)
                } else {
                    console.warn('handleBankAccountAddOk 无法获取新增的ID')
                }
            }

            // 刷新对应的下拉列表并选中新添加的项
            if (this.newAddedId) {
                this.refreshSelect()
            } else {
                console.error('handleBankAccountAddOk newAddedId 为空，无法刷新')
            }
        },
        // 刷新下拉列表并选中新项
        async refreshSelect() {
            if (!this.newAddedId) {
                this.currentAddType = null
                return
            }

            console.log('refreshSelect 开始刷新，newAddedId:', this.newAddedId, 'currentAddType:', this.currentAddType)

            if (this.currentAddType === 'customer' && this.$refs.customerTitleSelect) {
                // 先刷新项目主体下拉，等待数据加载完成
                try {
                    console.log('refreshSelect 刷新项目主体下拉')
                    await this.$refs.customerTitleSelect.refreshData()
                    console.log('refreshSelect 项目主体下拉刷新完成，options数量:', this.$refs.customerTitleSelect.options && this.$refs.customerTitleSelect.options.length)
                    // 数据加载完成后，设置选中值
                    this.$nextTick(() => {
                        console.log('refreshSelect 设置 customerTitleId:', this.newAddedId)
                        this.model.customerTitleId = this.newAddedId
                        this.newAddedId = null
                        this.currentAddType = null
                    })
                } catch (error) {
                    console.error('刷新项目主体下拉失败:', error)
                    // 即使失败也尝试设置值
                    this.model.customerTitleId = this.newAddedId
                    this.newAddedId = null
                    this.currentAddType = null
                }
            } else if (this.currentAddType === 'our' && this.$refs.ourTitleSelect) {
                // 先刷新我方主体下拉，等待数据加载完成
                try {
                    console.log('refreshSelect 刷新我方主体下拉')
                    await this.$refs.ourTitleSelect.refreshData()
                    console.log('refreshSelect 我方主体下拉刷新完成，options数量:', this.$refs.ourTitleSelect.options && this.$refs.ourTitleSelect.options.length)
                    // 数据加载完成后，设置选中值
                    this.$nextTick(() => {
                        console.log('refreshSelect 设置 ourTitleId:', this.newAddedId)
                        this.model.ourTitleId = this.newAddedId
                        this.newAddedId = null
                        this.currentAddType = null
                    })
                } catch (error) {
                    console.error('刷新我方主体下拉失败:', error)
                    // 即使失败也尝试设置值
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