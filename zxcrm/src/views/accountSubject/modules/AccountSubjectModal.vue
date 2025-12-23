<template>
    <a-modal :title="title" :width="600" :top="300" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk"
        @cancel="handleCancel" cancelText="关闭">
        <a-spin :spinning="confirmLoading">
            <a-form-model ref="form" :model="model" :rules="validatorRules">
                <a-row>
                    <a-col :span="24">
                        <a-form-model-item label="项目" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" prop="proId">
                            <JSearchSelectTag placeholder="请选择项目" v-model="model.proId"
                                dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24" v-if="model.proId">
                        <a-form-model-item label="返点政策模板" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }"
                            prop="rebateTeptId">
                            <JSearchSelectTag placeholder="请选择返点模板" v-model="model.rebateTeptId"
                                :dict="`tab_customer_rebate_template,rebate_name,id,del_flag = '0' and customer_id='${model.proId}'`"
                                async allowClear />
                        </a-form-model-item>
                    </a-col>
                </a-row>
            </a-form-model>
        </a-spin>
    </a-modal>
</template>

<script>
import { postAction, putAction } from '@/api/manage'


export default {
    name: "AccountSubjectModal",
    data() {
        return {
            title: "操作",
            visible: false,
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

            },
            url: {
                add: "/accountSubject/add",
                edit: "/accountSubject/binDingPro",
            }
        }
    },
    created() {
    },
    watch: {
        'model.proId': {
            handler(val) {
                if (val) {
                    this.model.rebateTeptId = '';
                }
            }
        }
    },
    methods: {
        add() {
            this.edit({});
        },
        edit(record) {
            this.model = Object.assign({}, record);
            this.visible = true;
        },
        close() {
            this.$emit('close');
            this.visible = false;
        },
        handleOk() {
            const that = this;
            // 触发表单验证
            this.$refs.form.validate(valid => {
                if (valid) {
                    that.confirmLoading = true;
                    let formData = Object.assign({}, this.model);

                    if (!this.model.id) {
                        //新增
                        postAction(this.url.add, formData).then((res) => {
                            if (res.success) {
                                that.$message.success(res.message);
                                that.$emit('ok');
                            } else {
                                that.$message.warning(res.message);
                            }
                        }).finally(() => {
                            that.confirmLoading = false;
                            that.close();
                        })
                    } else {
                        //编辑
                        postAction(this.url.edit, formData).then((res) => {
                            if (res.success) {
                                that.$message.success(res.message);
                                that.$emit('ok');
                            } else {
                                that.$message.warning(res.message);
                            }
                        }).finally(() => {
                            that.confirmLoading = false;
                            that.close();
                        })
                    }
                }
            })
        },
        handleCancel() {
            this.close()
        }
    }
}
</script>
