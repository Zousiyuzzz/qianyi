<template>
    <a-spin :spinning="confirmLoading">
        <j-form-container :disabled="formDisabled">
            <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
                <a-row>
                    <a-col :span="24">
                        <a-form-model-item label="账号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="userName">
                            <a-input v-model="model.userName" placeholder="请输入账号"></a-input>
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-model-item label="密码" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="password">
                            <a-input-password v-model="model.password" placeholder="请输入密码"></a-input-password>
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24" v-if="model.userName && model.password">
                        <a-form-model-item label="授权" :labelCol="labelCol" :wrapperCol="wrapperCol">
                            <a-button type="primary" @click="handleRicecow">授权登录</a-button>
                        </a-form-model-item>
                    </a-col>
                </a-row>
            </a-form-model>
        </j-form-container>
    </a-spin>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
export default {
    name: 'LoginConfigForm',
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
                userName: [{ required: true, message: '请输入账号' }],
                password: [{ required: true, message: '请输入密码' }],
            },
            url: {
                add: '/promotionPlatformAccount/add',
                edit: '/promotionPlatformAccount/edit',
                queryById: '/promotionPlatformAccount/queryById'
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
        handleRicecow() {
            // 触发父组件的授权事件
            this.$emit('ricecow', {
                userName: this.model.userName,
                password: this.model.password
            });
        }
    }
}
</script>