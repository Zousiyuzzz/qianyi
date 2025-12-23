<template>
    <a-modal :title="title" :width="800" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk"
        @cancel="handleCancel" cancelText="关闭">

        <a-spin :spinning="confirmLoading">
            <a-form :form="form">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="项目">
                    <JSearchSelectTag placeholder="请选择项目" v-model:value="model.customerId"
                        dict="tab_projectManage,pro_name,id,del_flag = '0'" async :disabled="!!model.id">
                    </JSearchSelectTag>
                </a-form-item>

                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="模板名称">
                    <a-input v-model="model.rebateName" placeholder="请输入模板名称"></a-input>
                </a-form-item>

                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="对公返点">
                    <!-- <a-input-number v-model="model.externalRebate" placeholder="对公返点：消耗数据/(1+客户返点)" :min="0"
                        :precision="2" style="width: 100%;" :formatter="value => `${value}%`"
                        :parser="value => value.replace('%', '')"></a-input-number> -->
                    <a-input v-model="model.externalRebate" placeholder="客户返点" suffix="%">
                    </a-input>
                </a-form-item>
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="对私返点">
                    <!-- <a-input-number v-model="model.privateRebate" placeholder="对私返点：消耗数据*(1-客户返点)" :min="0"
                        :precision="2" style="width: 100%;" :formatter="value => `${value}%`"
                        :parser="value => value.replace('%', '')"></a-input-number> -->
                    <a-input v-model="model.privateRebate" placeholder="客户返点" suffix="%">
                    </a-input>
                </a-form-item>

                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="返点形式">
                    <j-dict-select-tag v-model="model.rebateForm" placeholder="请选择返点形式" dictCode="rebate_type" />
                </a-form-item>

                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="返点模式">
                    <j-dict-select-tag v-model="model.rebateMode" placeholder="请选择返点模式" dictCode="rebate_mode" />
                </a-form-item>

                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="备注">
                    <a-textarea placeholder="请输入备注" v-model="model.remarks" />
                </a-form-item>
            </a-form>
        </a-spin>

    </a-modal>
</template>

<script>
import { JEditableTableModelMixin } from '@/mixins/JEditableTableModelMixin'
import JDate from '@/components/jeecg/JDate'
import JDictSelectTag from "@/components/dict/JDictSelectTag.vue"

export default {
    name: "TemplateRebateModal",
    mixins: [JEditableTableModelMixin],
    components: {
        JDate,
        JDictSelectTag
    },
    data() {
        return {
            //返点99.9是特殊情况直接判空

            title: "操作",
            width: 800,
            visible: false,
            model: {
                externalRebate: '',
                privateRebate: '',
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
            form: this.$form.createForm(this),
            validatorRules: {

            },
            url: {
                add: "/customerRebateTemplate/add",
                edit: "/customerRebateTemplate/edit",
            }
        }
    },
    methods: {
        // 精度处理：将小数转为百分比，避免精度丢失
        toPercent(value) {
            if (!value && value !== 0) return '';
            // 使用 Math.round 保留小数点后10位，然后再转为数字去除多余的0
            return parseFloat((Math.round(value * 100 * 1e10) / 1e10).toFixed(10));
        },
        // 精度处理：将百分比转为小数，避免精度丢失
        toDecimal(value) {
            if (!value && value !== 0) return '';
            // 使用 Math.round 保留小数点后12位，然后再转为数字去除多余的0
            return parseFloat((Math.round(value / 100 * 1e12) / 1e12).toFixed(12));
        },
        add() {
            this.edit();
        },
        edit(record) {
            if (record) {
                // console.log("record", record)
                this.isAdd = false
                this.model = { ...record }

                // 如果是编辑模式，需要将百分比转换为显示格式
                if (this.model.externalRebate) {
                    this.model.externalRebate = this.toPercent(this.model.externalRebate)
                }
                if (this.model.privateRebate) {
                    this.model.privateRebate = this.toPercent(this.model.privateRebate)
                }
            } else {
                this.isAdd = true
            }
            this.visible = true
        },
        close() {
            this.$emit('close');
            this.model = {
                externalRebate: '',
                privateRebate: '',
            }
            this.visible = false;
        },
        handleOk() {
            const that = this;
            // 触发表单验证
            this.form.validateFields((err, values) => {
                if (!err) {
                    // that.confirmLoading = true;
                    // let formData = Object.assign(this.model, values);
                    // 提交时将百分比转换回小数格式

                    let ed = (Number(this.model.externalRebate) / 100) < 99.99
                    let pd = (Number(this.model.privateRebate) / 100) < 99.99

                    if (ed && pd) {
                        let formData = { ...this.model }
                        // 去除前后空格
                        formData.externalRebate = formData.externalRebate.toString().trim();
                        formData.privateRebate = formData.privateRebate.toString().trim();

                        if (formData.externalRebate != '') {
                            formData.externalRebate = this.model.externalRebate / 100;
                        } else {
                            formData.externalRebate = ''
                        }
                        if (formData.privateRebate != '') {
                            formData.privateRebate = this.model.privateRebate / 100;
                        } else {
                            formData.privateRebate = ''
                        }
                        let url = this.url.add, method = 'post';
                        if (this.model.id) {
                            url = this.url.edit;
                            method = 'put';
                        }
                        // console.log(JSON.stringify(formData, null, 2))
                        this.$http({
                            url: url,
                            method: method,
                            data: formData
                        }).then((res) => {
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
                        this.$message.warning('对公返点或对私返点不能大于9999%')
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

<style scoped>
.ant-modal-body {
    padding: 24px;
}

.ant-form-item {
    margin-bottom: 24px;
}

.ant-input-number {
    width: 100%;
}
</style>