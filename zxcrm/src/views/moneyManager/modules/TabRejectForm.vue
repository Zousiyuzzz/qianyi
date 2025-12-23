<template>
    <a-spin :spinning="confirmLoading">
        <j-form-container :disabled="formDisabled">
            <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
                <a-row>
                    <a-col :span="24">
                        <a-form-model-item label="驳回原因" :labelCol="labelCol" :wrapperCol="wrapperCol"
                            prop="rejectReason">
                            <a-textarea v-model="model.rejectReason" rows="4" placeholder="请输入驳回原因" />
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
    name: 'TabRejectForm',
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
                id: '',
                rejectReason: '',
                state: 3
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
                rejectReason: [
                    { required: true, message: '请输入驳回原因!' }
                ]
            },
            url: {
                reject: "/projectRefundRecord/refundApproval"
            }
        }
    },
    computed: {
        formDisabled() {
            return this.disabled
        }
    },
    created() {
        //备份model原始值
        this.modelDefault = JSON.parse(JSON.stringify(this.model));
    },
    methods: {
        add(record) {
            this.model = Object.assign({}, this.modelDefault);
            this.model.id = record.id;
            this.visible = true;
        },
        submitForm() {
            const that = this;
            // 触发表单验证
            this.$refs.form.validate(valid => {
                if (valid) {
                    that.confirmLoading = true;
                    let httpurl = this.url.reject;
                    let method = 'post';

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