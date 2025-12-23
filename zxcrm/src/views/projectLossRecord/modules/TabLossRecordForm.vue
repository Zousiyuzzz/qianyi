<template>
    <a-spin :spinning="confirmLoading">
        <!-- 表单编辑模式 -->
        <j-form-container>
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
                        <a-form-model-item label="损失金额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="lossAmount">
                            <a-input-number v-model="model.lossAmount" placeholder="请输入损失金额" style="width: 100%" />
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
                        <a-form-model-item label="变更类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="changeType">
                            <a-radio-group v-model="model.changeType">
                                <a-radio value="1">增加</a-radio>
                                <a-radio value="2">减少</a-radio>
                            </a-radio-group>
                        </a-form-model-item>
                    </a-col>
                    <!-- <a-col :span="24">
                        <a-form-model-item label="状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="state">
                            <a-select v-model="model.state" placeholder="请选择状态">
                                <a-select-option value="1">登记成功</a-select-option>
                                <a-select-option value="2">退回成功</a-select-option>
                            </a-select>
                        </a-form-model-item>
                    </a-col> -->

                    <a-col :span="24">
                        <a-form-model-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="remarks">
                            <a-textarea v-model="model.remarks" rows="4" placeholder="请输入备注" />
                        </a-form-model-item>
                    </a-col>
                </a-row>
            </a-form-model>
        </j-form-container>
    </a-spin>
</template>

<script>

import { httpAction } from '@/api/manage'

export default {
    name: 'TabLossRecordForm',
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
            model: {
                proId: '',
                lossAmount: null,
                fundsNature: '1',
                changeType: '2',
                state: '1',
                remarks: ''
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
                proId: [
                    { required: true, message: '请选择项目!' }
                ],
                lossAmount: [
                    { required: true, message: '请输入损失金额!' }
                ],
                fundsNature: [
                    { required: true, message: '请选择资金性质!' }
                ],
                changeType: [
                    { required: true, message: '请选择变更类型!' }
                ],
                state: [
                    { required: true, message: '请选择状态!' }
                ]
            },
            url: {
                add: "/projectLossRecord/add",
                edit: "/projectLossRecord/edit",
                queryById: "/projectLossRecord/queryById"
            }
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
    }
}
</script>
