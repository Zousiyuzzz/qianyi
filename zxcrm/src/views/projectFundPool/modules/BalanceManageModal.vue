<template>
    <a-modal :visible="visible" title="余额管理" @ok="handleOk" @cancel="handleCancel" :confirmLoading="loading"
        width="600px" destroyOnClose>
        <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }" layout="horizontal">
            <a-form-item label="项目ID">
                <a-input v-decorator="['proId']" disabled />
            </a-form-item>
            <a-form-item label="项目名称">
                <a-input v-decorator="['proName']" disabled />
            </a-form-item>
            <a-form-item label="客户资金">
                <div style="display: grid; grid-template-columns: max-content 1fr max-content 1fr; gap: 4px 8px;">
                    <span>授信额度：</span><span>{{ totalCreditLimit }}</span>
                    <span>总余额：</span><span>{{ totalBalanceSum }}</span>
                    <span>总欠款：</span><span>{{ totalArrears }}</span>
                    <span>可用金额：</span><span>{{ availableBalance }}</span>
                </div>
            </a-form-item>
            <a-form-item label="资金性质" required>
                <a-radio-group v-decorator="['fundsNature', { initialValue: '1' }]">
                    <a-radio value="1">对公</a-radio>
                    <a-radio value="2">对私</a-radio>
                </a-radio-group>
            </a-form-item>
            <a-form-item style="margin-bottom: 0; margin-top: -24px;" :wrapper-col="{ span: 16, offset: 5 }">
                <div style="display: grid; grid-template-columns: max-content 1fr max-content 1fr; gap: 4px 8px;">
                    <template v-if="form.getFieldValue('fundsNature') === '1'">
                        <span>现金备款：</span><span>{{ publicCashReserves }}</span>
                        <span>欠款：</span><span>{{ publicCreditArrears }}</span>
                    </template>
                    <template v-else>
                        <span>现金备款：</span><span>{{ privateCashReserve }}</span>
                        <span>欠款：</span><span>{{ privateCreditArrears }}</span>
                    </template>
                </div>
            </a-form-item>
            <a-form-item label="操作类型" required>
                <a-radio-group v-decorator="['changeType', { initialValue: '1' }]">
                    <a-radio value="1">增加</a-radio>
                    <!-- <a-radio value="2">减少</a-radio> -->
                </a-radio-group>
            </a-form-item>
            <a-form-item label="操作金额" required>
                <a-input v-decorator="['amount', {
                    rules: [
                        { required: true, message: '请输入操作金额' },
                        { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入正确的金额格式' },
                        { validator: this.validateAmount }
                    ]
                }]" placeholder="请输入金额（元）" />
                <!-- <a-input placeholder="请输入金额（元）" /> -->
            </a-form-item>
            <a-form-item label="备注">
                <a-input v-decorator="['remark', {
                    rules: [

                    ]
                }]" placeholder="请输入内容（100字以内）" maxlength="100" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
import { projectFundPool } from '@/api/api'
import pick from 'lodash.pick'

export default {
    name: 'BalanceManageModal',
    props: {
        visible: { type: Boolean, default: false },
        record: { type: Object, default: () => ({}) }
    },
    data() {
        return {
            loading: false,
            totalCreditLimit: '',
            totalBalanceSum: '',
            totalArrears: '',
            availableBalance: '',
            publicCashReserves: '',
            publicCreditArrears: '',
            privateCashReserve: '',
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
                callback(new Error('操作金额必须大于0'));
            } else {
                callback();
            }
        },
        loadData(id) {
            getAction(projectFundPool.queryById, { id }).then(res => {
                if (res.success) {
                    const data = res.result;
                    this.totalCreditLimit = data.totalCreditLimit;
                    this.totalBalanceSum = data.totalBalanceSum;
                    this.totalArrears = data.totalArrears;
                    this.availableBalance = data.availablebBalance;
                    this.publicCashReserves = data.publicCashReserves;
                    this.publicCreditArrears = data.publicCreditArrears;
                    this.privateCashReserve = data.privateCashReserve;
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
                        proId: values.proId,
                        proName: values.proName,
                        fundsNature: values.fundsNature,
                        changeType: values.changeType,
                        money: values.amount,
                        remarks: values.remark,
                        proUniqueId: this.record.proUniqueId
                    }

                    postAction(projectFundPool.balanceManagement, params).then(res => {
                        if (res.success) {
                            this.$message.success(res.message);
                            this.$emit('ok');
                        } else {
                            this.$message.warning(res.message);
                        }
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