<template>
    <a-spin :spinning="confirmLoading">
        <j-form-container :disabled="formDisabled">
            <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
                <a-row>
                    <a-col :span="24">
                        <a-form-model-item label="机器人名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="robotName">
                            <a-input v-model="model.robotName" placeholder="请输入机器人名称"></a-input>
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-model-item label="机器人URL" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="url">
                            <a-input v-model="model.url" placeholder="请输入机器人URL"></a-input>
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-model-item label="SQL语句" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sqlText">
                            <a-textarea v-model="model.sqlText" placeholder="请输入SQL语句" :rows="20"></a-textarea>
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
    name: 'DingtalkRobotForm',
    props: {
        disabled: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    data() {
        return {
            model: {},
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
                robotName: [{ required: true, message: '请输入机器人名称' }],
                url: [{ required: true, message: '请输入机器人URL' }],
                sqlText: [{ required: false, message: '请输入SQL语句' }],
            },
            url: {
                add: '/dingtalkRobotConfig/add',
                edit: '/dingtalkRobotConfig/edit',
                queryById: '/dingtalkRobotConfig/queryById'
            }
        }
    },
    computed: {
        formDisabled() {
            return this.disabled
        },
    },
    created() {
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
            this.$refs.form.validate(valid => {
                if (valid) {
                    that.confirmLoading = true;
                    let httpurl = '';
                    let method = '';
                    if (!this.model.id) {
                        httpurl += this.url.add;
                        method = 'post';
                    } else {
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