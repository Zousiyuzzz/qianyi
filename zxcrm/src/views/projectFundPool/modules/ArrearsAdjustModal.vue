<template>
    <a-modal :visible="visible" title="欠款调整" @ok="handleOk" @cancel="handleCancel" :confirmLoading="loading"
        width="600px" destroyOnClose>
        <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }" layout="horizontal">
            <a-form-item label="项目ID">
                <a-input v-decorator="['proId']" disabled />
            </a-form-item>
            <a-form-item label="项目名称">
                <a-input v-decorator="['proName']" disabled />
            </a-form-item>
            <a-form-item label="当前欠款">
                <div style="display: grid; grid-template-columns: max-content 1fr max-content 1fr; gap: 4px 8px;">
                    <span>总欠款：</span><span>{{ totalArrears }}</span>
                    <span>对公欠款：</span><span>{{ publicCreditArrears }}</span>
                    <span>对私欠款：</span><span>{{ privateCreditArrears }}</span>
                </div>
            </a-form-item>
            <a-form-item label="资金性质" required>
                <a-radio-group v-decorator="['fundsNature', { initialValue: '1' }]">
                    <a-radio value="1">对公</a-radio>
                    <a-radio value="2">对私</a-radio>
                </a-radio-group>
            </a-form-item>
            <a-form-item label="变更类型" required>
                <a-radio-group v-decorator="['changeType', { initialValue: '1' }]">
                    <a-radio value="1">增加</a-radio>
                    <a-radio value="2">减少</a-radio>
                </a-radio-group>
            </a-form-item>
            <a-form-item label="金额" required>
                <a-input v-decorator="['money', {
                    rules: [
                        { required: true, message: '请输入金额' },
                        { pattern: /^\d+(\.\d{1,3})?$/, message: '请输入正确的金额格式' },
                        { validator: this.validateAmount }
                    ]
                }]" placeholder="请输入金额（元）" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
import { projectFundPool } from '@/api/api'
import pick from 'lodash.pick'

export default {
    name: 'ArrearsAdjustModal',
    props: {
        visible: { type: Boolean, default: false },
        record: { type: Object, default: () => ({}) }
    },
    data() {
        return {
            loading: false,
            totalArrears: '',
            publicCreditArrears: '',
            privateCreditArrears: '',
            form: this.$form.createForm(this),
        }
    },
    watch: {
        record: {
            immediate: true,
            handler(val) {
                if (val && val.id) {
                    this.loadData(val.id);
                }
            }
        }
    },
    methods: {
        validateAmount(rule, value, callback) {
            if (value && Number(value) <= 0) {
                callback(new Error('金额必须大于0'));
            } else {
                callback();
            }
        },
        loadData(id) {
            getAction(projectFundPool.queryById, { id }).then(res => {
                if (res.success) {
                    const data = res.result;
                    this.totalArrears = data.totalArrears;
                    this.publicCreditArrears = data.publicCreditArrears;
                    this.privateCreditArrears = data.privateCreditArrears;

                    this.$nextTick(() => {
                        this.form.setFieldsValue(pick(data, 'proId', 'proName'))
                    })
                }
            })
        },
        handleOk() {
            this.form.validateFields((err, values) => {
                if (!err) {
                    this.loading = true;
                    const params = {
                        id: this.record.id,
                        fundsNature: values.fundsNature,
                        changeType: values.changeType,
                        money: values.money
                    }

                    postAction('/projectFundPool/updataCreditArrears', params).then(res => {
                        if (res.success) {
                            this.$message.success(res.message || '欠款调整成功');
                            this.$emit('ok');
                        } else {
                            this.$message.warning(res.message || '欠款调整失败');
                        }
                    }).catch(error => {
                        this.$message.error('操作失败，请重试');
                    }).finally(() => {
                        this.loading = false;
                        this.handleCancel();
                    })
                }
            });
        },
        handleCancel() {
            this.$emit('cancel');
        }
    }
}
</script>

<style scoped>
/* 可根据需要自定义样式 */
</style>
