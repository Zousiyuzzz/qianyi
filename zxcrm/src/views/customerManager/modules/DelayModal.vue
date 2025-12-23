<template>
    <a-modal title="项目延期" :width="600" :visible="visible" :confirmLoading="confirmLoading" @ok="handleSubmit"
        @cancel="handleCancel" :maskClosable="false">
        <a-form-model ref="form" :model="model" :rules="validatorRules">
            <a-col :span="24">
                <a-form-model-item label="项目" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="proId">
                    <JSearchSelectTag placeholder="请选择项目" v-model="model.proId"
                        dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear disabled
                        @change="handleProjectChange" />
                </a-form-model-item>
            </a-col>
            <a-col :span="24">
                <a-form-model-item label="月份" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="month">
                    <a-month-picker v-model="model.month" placeholder="请选择月份" :value-format="'YYYY-MM'"
                        style="width: 100%;" disabled />
                </a-form-model-item>
            </a-col>
            <a-col :span="24">
                <a-form-model-item label="延期天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="delayDays">
                    <a-input-number v-model="model.delayDays" :min="1" :max="30" placeholder="请输入延期天数（1-30天）"
                        style="width: 100%" />
                </a-form-model-item>
            </a-col>
            <a-col :span="24">
                <a-form-model-item label="延期原因" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="submit_reason">
                    <j-dict-select-tag placeholder="请选择延期原因" v-model="model.submit_reason"
                        dictCode="delay_reason"></j-dict-select-tag>
                </a-form-model-item>
            </a-col>
        </a-form-model>
    </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'

export default {
    name: 'DelayModal',
    data() {
        return {
            visible: false,
            confirmLoading: false,
            model: {
                proId: '',
                proName: '',
                month: '',
                delayDays: null,
                submit_reason: ''
            },
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
            validatorRules: {
                proId: [
                    { required: true, message: '请选择项目!' }
                ],
                month: [
                    { required: true, message: '请选择月份!' }
                ],
                delayDays: [
                    { required: true, message: '请输入延期天数!' },
                    { type: 'number', min: 1, max: 30, message: '延期天数必须在1-30之间!' }
                ],
                submit_reason: [
                    { required: true, message: '请选择延期原因!' }
                ]
            }
        }
    },
    methods: {
        open(data) {
            this.visible = true

            // 如果传入了数据，则使用传入的数据作为默认值
            if (data) {
                this.$set(this.model, 'proId', data.proId || '')
                this.$set(this.model, 'proName', data.proName || '')
                this.$set(this.model, 'month', data.month || '')
                this.$set(this.model, 'delayDays', null)
                this.$set(this.model, 'submit_reason', '')
            } else {
                // 重置表单数据
                this.$set(this.model, 'proId', '')
                this.$set(this.model, 'proName', '')
                this.$set(this.model, 'month', '')
                this.$set(this.model, 'delayDays', null)
                this.$set(this.model, 'submit_reason', '')
            }
            this.$nextTick(() => {
                this.$refs.form && this.$refs.form.clearValidate()
            })
        },
        // 项目选择变化处理
        handleProjectChange(value, option) {
            this.$set(this.model, 'proName', option ? option.text : '')
        },
        close() {
            this.visible = false
            this.model = {
                proId: '',
                proName: '',
                month: '',
                delayDays: null,
                submit_reason: ''
            }
        },
        handleSubmit() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.confirmLoading = true
                    const formData = {
                        proId: this.model.proId,
                        month: this.model.month,
                        delayDays: this.model.delayDays,
                        submitReason: this.model.submit_reason
                    }

                    httpAction('/projectPaymentDelay/add', formData, 'POST').then((res) => {
                        if (res.success) {
                            this.$message.success('延期申请提交成功')
                            this.close()
                            this.$emit('ok')
                        } else {
                            this.$message.error(res.message || '延期申请提交失败')
                        }
                    }).catch((error) => {
                        console.error('延期申请提交失败:', error)
                        this.$message.error('延期申请提交失败')
                    }).finally(() => {
                        this.confirmLoading = false
                    })
                }
            })
        },
        handleCancel() {
            this.close()
        }
    }
}
</script>

<style scoped></style>
