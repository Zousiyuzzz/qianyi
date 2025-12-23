<template>
    <a-spin :spinning="confirmLoading" style="padding-top: 40px;">
        <j-form-container :disabled="formDisabled">
            <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
                <a-row>
                    <a-col :span="24">
                        <a-form-model-item label="代理商" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="agentId">
                            <JSearchSelectTag placeholder="请选择代理商" v-model="model.agentId"
                                :dict="`tab_advertiser_info,advertiser_name,id,del_flag = '0' and channel_sign = '${channelSign}'`"
                                async allowClear />
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-model-item label="项目" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="proId">
                            <JSearchSelectTag placeholder="请选择项目" v-model="model.proId"
                                dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24" v-if="model.proId">
                        <a-form-model-item label="返点模板" :labelCol="labelCol" :wrapperCol="wrapperCol"
                            prop="rebateTeptId">
                            <JSearchSelectTag placeholder="请选择返点模板" v-model="model.rebateTeptId"
                                :dict="`tab_customer_rebate_template,rebate_name,id,del_flag = '0' and customer_id=${model.proId}`"
                                async allowClear />
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-model-item label="二级代理ID" :labelCol="labelCol" :wrapperCol="wrapperCol"
                            prop="secondaryAgentId">
                            <a-input-number v-model="model.secondaryAgentId" placeholder="请输入二级代理ID"
                                style="width: 100%"></a-input-number>
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-model-item label="二级代理名称" :labelCol="labelCol" :wrapperCol="wrapperCol"
                            prop="secondaryAgentName">
                            <a-input v-model="model.secondaryAgentName" placeholder="请输入二级代理名称"></a-input>
                        </a-form-model-item>
                    </a-col>
                    <!-- <a-col :span="24">
                        <a-form-model-item label="渠道标识" :labelCol="labelCol" :wrapperCol="wrapperCol"
                            prop="channelSign">
                            <j-dict-select-tag v-model="model.channelSign" placeholder="渠道标识"
                                dictCode="channelSign_system" />
                        </a-form-model-item>
                    </a-col> -->
                </a-row>
            </a-form-model>
        </j-form-container>
    </a-spin>
</template>

<script>
import { addSecondaryAgentInfo, editSecondaryAgentInfo } from '@/api/api'

export default {
    name: 'SubPortForm',
    data() {
        return {
            channelSign: '',
            model: {
                agentId: undefined,
                proId: undefined,
                rebateTeptId: undefined,
                secondaryAgentId: undefined,
                secondaryAgentName: '',
                channelSign: 'KS-CLYQ',
                status: 1,
                remark: ''
            },
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 }
            },
            confirmLoading: false,
            validatorRules: {
                agentId: [
                    { required: true, message: '请选择代理商!' }
                ],
                proId: [
                    { required: true, message: '请选择项目!' }
                ],
                secondaryAgentId: [
                    { required: true, message: '请输入二级代理ID!' }
                ],
                secondaryAgentName: [
                    { required: true, message: '请输入二级代理名称!' }
                ],
                channelSign: [
                    { required: true, message: '请选择渠道标识!' }
                ]
            }
        }
    },
    computed: {
        formDisabled() {
            return this.confirmLoading
        }
    },
    methods: {
        add(channelSign) {
            this.edit({}, channelSign);
        },
        edit(record, channelSign) {
            // console.log(record, 'record')
            this.model = Object.assign({}, record);
            // 如果传入了channelSign参数，则设置到model中
            if (channelSign) {
                this.channelSign = channelSign;
            }
        },
        submitForm() {
            const that = this;
            // console.log('submitForm called, model:', this.model);

            // 触发表单验证
            this.$refs.form.validate(valid => {
                // console.log('form validation result:', valid);
                if (valid) {
                    that.confirmLoading = true;
                    let formData = Object.assign(this.model, {})

                    // 时间格式化 - 检查是否为moment对象
                    if (formData.createTime && typeof formData.createTime.format === 'function') {
                        formData.createTime = formData.createTime.format("YYYY-MM-DD HH:mm:ss")
                    }
                    if (formData.updateTime && typeof formData.updateTime.format === 'function') {
                        formData.updateTime = formData.updateTime.format("YYYY-MM-DD HH:mm:ss")
                    }

                    // console.log('formData to submit:', formData);
                    // console.log('is edit mode:', !!this.model.id);

                    let obj;
                    if (this.model.id) {
                        // console.log('calling editSecondaryAgentInfo');
                        obj = editSecondaryAgentInfo(formData)
                    } else {
                        // console.log('calling addSecondaryAgentInfo');
                        obj = addSecondaryAgentInfo(formData)
                    }
                    obj.then((res) => {
                        // console.log('API response:', res);
                        if (res.success) {
                            that.$message.success(res.message);
                            that.$emit('ok');
                        } else {
                            that.$message.warning(res.message);
                        }
                    }).catch((error) => {
                        console.error('API error:', error);
                        that.$message.error('操作失败: ' + (error.message || error));
                    }).finally(() => {
                        that.confirmLoading = false;
                    })
                } else {
                    // console.log('form validation failed');
                    that.$message.error('请检查表单填写是否正确');
                }
            })
        }
    }
}
</script>