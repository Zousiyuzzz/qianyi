<template>
    <a-spin :spinning="confirmLoading">
        <!-- 详情显示模式 -->
        <div v-if="formDisabled" class="detail-view">
            <table class="detail-table">
                <tr>
                    <td class="label">项目</td>
                    <td class="content">{{ model.proName }}</td>
                </tr>
                <tr>
                    <td class="label">退款金额</td>
                    <td class="content">{{ model.refundAmount }}</td>
                </tr>
                <tr>
                    <td class="label">资金性质</td>
                    <td class="content">{{ getFundsNatureName(model.fundsNature) }}</td>
                </tr>
                <tr>
                    <td class="label">项目主体</td>
                    <td class="content">{{ getCustomerTitleName(model.customerTitle) }}</td>
                </tr>
                <tr>
                    <td class="label">我方主体</td>
                    <td class="content">{{ getOurTitleName(model.ourTitle) }}</td>
                </tr>
                <tr>
                    <td class="label">备注</td>
                    <td class="content">{{ model.remarks || '-' }}</td>
                </tr>
            </table>
        </div>

        <!-- 表单编辑模式 -->
        <j-form-container :disabled="formDisabled" v-else>
            <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
                <a-row>
                    <a-col :span="24">
                        <a-form-model-item label="项目" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="proId">
                            <JSearchSelectTag placeholder="请选择项目" v-model:value="model.proId"
                                dict="tab_projectManage,pro_name,id,del_flag = '0'" async>
                            </JSearchSelectTag>
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-model-item label="退款金额" :labelCol="labelCol" :wrapperCol="wrapperCol"
                            prop="refundAmount">
                            <a-input-number v-model="model.refundAmount" placeholder="请输入退款金额" style="width: 100%" />
                            <div v-if="model.proId" style="display: flex;gap: 20px;">
                                <div>
                                    对公可退余额: {{ (moneyData.publicCashReserves) || '-' }}
                                </div>
                                <div>
                                    对私可退余额: {{ (moneyData.privateCashReserve) || '-' }}
                                </div>
                            </div>
                            <span style="color: red;" v-if="getRefundAmount">现金备款不足,请确认是否退款</span>
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-model-item label="资金性质" :labelCol="labelCol" :wrapperCol="wrapperCol"
                            prop="fundsNature">
                            <a-select v-model="model.fundsNature" placeholder="请选择资金性质">
                                <a-select-option value="1">对公</a-select-option>
                                <a-select-option value="2">对私</a-select-option>
                            </a-select>
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-model-item label="项目主体" :labelCol="labelCol" :wrapperCol="wrapperCol"
                            prop="customerTitle">
                            <JSearchSelectTag placeholder="请选择项目主体" v-model:value="model.customerTitle"
                                :dict="`tab_bank_account,corporate_name,id,del_flag = '0' and customer_id = '${model.proId}'and source = '${1}'`"
                                async>
                            </JSearchSelectTag>
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-model-item label="我方主体" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="ourTitle">
                            <JSearchSelectTag placeholder="请选择我方主体" v-model:value="model.ourTitle"
                                :dict="`tab_bank_account,corporate_name,id,del_flag = '0' and source = '${2}'`" async>
                            </JSearchSelectTag>
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-model-item v-if="getRefundAmount" label="超额退款备注" :labelCol="labelCol"
                            :wrapperCol="wrapperCol" prop="chaoeremarks">
                            <a-textarea v-model="model.chaoeremarks" rows="4" placeholder="请输入超额退款备注" />
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-model-item label="银行信息" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="bankRemark">
                            <a-textarea v-model="model.bankRemark" rows="4" placeholder="请输入银行信息" />
                        </a-form-model-item>
                    </a-col>
                </a-row>
            </a-form-model>
        </j-form-container>
    </a-spin>
</template>

<script>

import { httpAction, getAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'

export default {
    name: 'TabRefundForm',
    components: {
    },
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
            remarks: '',
            bankRemark: '',
            model: {
            },
            moneyData: {},
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
                // proId: [
                //     { required: true, message: '请选择项目!' }
                // ],
                // collaborationMode: [
                //     { required: true, message: '请选择合作方式!' }
                // ],
                // refundAmount: [
                //     { required: true, message: '请输入退款金额!' }
                // ],
                // fundsNature: [
                //     { required: true, message: '请选择资金性质!' }
                // ],
                chaoeremarks: [
                    { required: true, message: '请输入超额退款备注!' }
                ],
                bankRemark: [
                    { required: true, message: '请输入银行信息!' }
                ]
            },
            url: {
                add: "/projectRefundRecord/refundRequest",
                edit: "/projectRefundRecord/edit",
                queryById: "/projectRefundRecord/queryById"
            }
        }
    },
    created() {
        //备份model原始值
        this.modelDefault = JSON.parse(JSON.stringify(this.model));
    },
    watch: {
        'model.proId': {
            handler(newVal) {
                if (newVal) {
                    if (!this.formDisabled) {
                        getAction('/projectFundPool/list', {
                            proId: newVal
                        }).then(res => {
                            if (res.success) {
                                if (res.result.records && res.result.records.length > 0) {
                                    this.moneyData = res.result.records[0] || {}
                                }
                            }
                        })
                    }
                }
            },
        },

    },
    computed: {
        formDisabled() {
            return this.disabled
        },
        getRefundAmount() {
            if (this.model.fundsNature == 1) {
                if (this.model.refundAmount > this.moneyData.publicCashReserves) {
                    return true
                }
            }
            if (this.model.fundsNature == 2) {
                if (this.model.refundAmount > this.moneyData.privateCashReserve) {
                    return true
                }
            }
            return false
        }
    },
    methods: {
        add() {
            this.edit(this.modelDefault);
        },
        edit(record) {
            this.model = Object.assign({}, record);
            this.visible = true;
        },
        // 获取项目名称
        getProjectName(proId) {
            if (!proId) return '-';
            // 这里可以根据实际需求从缓存或重新请求获取项目名称
            // 暂时返回ID，实际使用时可能需要从字典或缓存中获取
            return proId;
        },
        // 获取资金性质名称
        getFundsNatureName(fundsNature) {
            if (!fundsNature) return '-';
            const fundsNatureMap = {
                '1': '对公',
                '2': '对私'
            };
            return fundsNatureMap[fundsNature] || fundsNature;
        },
        // 获取项目主体名称
        getCustomerTitleName(customerTitle) {
            if (!customerTitle) return '-';
            // 这里可以根据实际需求从缓存或重新请求获取项目主体名称
            // 暂时返回ID，实际使用时可能需要从字典或缓存中获取
            return customerTitle;
        },
        // 获取我方抬头名称
        getOurTitleName(ourTitle) {
            if (!ourTitle) return '-';
            // 这里可以根据实际需求从缓存或重新请求获取我方抬头名称
            // 暂时返回ID，实际使用时可能需要从字典或缓存中获取
            return ourTitle;
        },
        submitForm() {
            const that = this;
            // 触发表单验证
            this.$refs.form.validate(valid => {
                if (valid) {
                    that.confirmLoading = true;
                    let httpurl = '';
                    let method = '';
                    if (!this.model.id) {
                        //新增---httpurl
                        httpurl += this.url.add;
                        method = 'post';
                    } else {
                        //编辑---httpurl
                        httpurl += this.url.edit;
                        method = 'put';
                    }
                    let formData = {
                        ...this.model,
                        remarks: `超额退款备注:${this.model.chaoeremarks} 银行信息:${this.model.bankRemark}`
                    }
                    httpAction(httpurl, formData, method).then((res) => {
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
    }
}
</script>

<style scoped>
.detail-view {
    padding: 16px;
    background: #fafafa;
    border-radius: 6px;
}

.detail-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #d9d9d9;
}

.detail-table tr {
    border-bottom: 1px solid #d9d9d9;
}

.detail-table tr:last-child {
    border-bottom: none;
}

.detail-table .label {
    width: 200px;
    min-width: 200px;
    max-width: 200px;
    background: #f5f5f5;
    font-weight: 500;
    color: #333;
    text-align: center;
    padding: 12px 16px;
    border-right: 1px solid #d9d9d9;
    white-space: nowrap;
    vertical-align: middle;
}

.detail-table .content {
    padding: 12px 16px;
    color: #666;
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;
    vertical-align: top;
}
</style>