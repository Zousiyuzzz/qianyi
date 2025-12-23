<template>
    <a-modal :visible="visible" title="服务费录入" @ok="handleOk" @cancel="handleCancel" width="900px"
        :bodyStyle="{ padding: '24px 32px', borderRadius: '8px' }" :confirmLoading="confirmLoading">
        <a-form :model="form">
            <a-form-item label="月份" :labelCol="{ span: 4, style: { textAlign: 'left' } }" :wrapperCol="{ span: 20 }">
                <a-month-picker v-model="form.month" placeholder="请选择月份" style="width: 200px; text-align:left;"
                    @change="handleBatchMonth" />
                <a-button type="primary" style="margin-left: 16px" :disabled="!form.month"
                    @click="handleQuery">查询</a-button>
            </a-form-item>
            <div class="fee-wrap">
                <div class="fee-header">
                    <div class="fee-header-index">序号</div>
                    <div class="fee-header-month">月份</div>
                    <div class="fee-header-port">端口</div>
                    <div class="fee-header-rebate">服务费比例</div>
                    <div class="fee-header-cost">消耗金额</div>
                    <div class="fee-header-money">结算金额</div>
                    <div class="fee-header-action"></div>
                </div>
                <div class="fee-body">
                    <div v-for="(item, idx) in form.rows" :key="idx" class="fee-row"
                        :class="{ 'fee-row-hover': hoverIdx === idx }">
                        <div class="fee-index">{{ idx + 1 }}</div>
                        <div class="fee-item-inner">
                            <a-month-picker v-model="item.month" placeholder="请选择月份" class="fee-input"
                                style="width:110px" @focus="hoverIdx = idx" @blur="hoverIdx = -1" />
                        </div>
                        <div class="fee-item-inner">
                            <a-input v-model="item.port" placeholder="端口" class="fee-input" @focus="hoverIdx = idx"
                                @blur="hoverIdx = -1" />
                        </div>
                        <div class="fee-item-inner fee-rebate">
                            <a-input-number v-model="item.rebate" :min="0" :max="100" :step="0.01" class="fee-input"
                                @change="calcMoney(idx)" @focus="hoverIdx = idx" @blur="hoverIdx = -1" />
                            <span class="fee-percent">%</span>
                        </div>
                        <div class="fee-item-inner">
                            <a-input-number v-model="item.cost" :min="0" :step="0.01" class="fee-input"
                                @change="calcMoney(idx)" @focus="hoverIdx = idx" @blur="hoverIdx = -1" />
                        </div>
                        <div class="fee-item-inner">
                            <a-input v-model="item.money" placeholder="自动计算" class="fee-input" disabled />
                        </div>
                        <div class="fee-item-inner fee-action">
                            <div class="fee-delete-btn" v-show="form.rows.length > 1" @click="removeRow(idx)">
                                <span class="fee-delete-icon">×</span>
                            </div>
                        </div>
                    </div>
                </div>
                <a-button type="dashed" icon="plus" @click="addRow" class="fee-add-btn">添加一行</a-button>
            </div>
        </a-form>
    </a-modal>
</template>

<script>
import { addServiceCost } from '@/api/api'
import { getAction } from '@/api/manage'
export default {
    name: 'ServiceCostModal',
    props: {
        visible: Boolean,
        proId: String
    },
    data() {
        return {
            form: {
                month: null,
                rows: [this.emptyRow()]
            },
            hoverIdx: -1,
            confirmLoading: false,
            queryResult: [],
            queryColumns: [
                { title: '月份', dataIndex: 'month', key: 'month' },
                { title: '端口', dataIndex: 'port', key: 'port' },
                { title: '服务费比例', dataIndex: 'rebate', key: 'rebate' },
                { title: '消耗金额', dataIndex: 'cost', key: 'cost' },
                { title: '结算金额', dataIndex: 'money', key: 'money' }
            ]
        }
    },
    watch: {
        visible(val) {
            if (val) {
                this.resetForm()
            }
        }
    },
    methods: {
        emptyRow() {
            return { month: null, port: '', rebate: null, cost: null, money: '', proId: this.proId }
        },
        addRow() {
            const newRow = this.emptyRow();
            if (this.form.month) {
                newRow.month = this.form.month;
            }
            this.form.rows.push(newRow);
        },
        removeRow(idx) {
            this.form.rows.splice(idx, 1)
        },
        calcMoney(idx) {
            const row = this.form.rows[idx]
            if (row.rebate != null && row.cost != null) {
                const rebateNum = Number(row.rebate) / 100
                row.money = row.cost * rebateNum ? (row.cost * rebateNum).toFixed(2) : ''
            } else {
                row.money = ''
            }
        },
        handleBatchMonth(val) {
            this.form.rows.forEach(row => { row.month = val })
        },
        handleOk() {
            // 校验
            for (const row of this.form.rows) {
                if (!row.month || !row.port || row.rebate == null || row.cost == null) {
                    this.$message.warning('请完整填写每一行数据，包括月份')
                    return
                }
            }
            // 组装数据
            const params = this.form.rows.map(row => ({
                port: row.port,
                proId: this.proId,
                rebate: Number(row.rebate) / 100,
                money: row.money,
                cost: row.cost,
                month: row.month && row.month.format ? row.month.format('YYYY-MM') : row.month
            }))
            this.confirmLoading = true
            addServiceCost(params).then(res => {
                if (res.success) {
                    this.$message.success('提交成功')
                    this.$emit('success')
                } else {
                    this.$message.error(res.message)
                }
            }).finally(() => {
                this.confirmLoading = false
            })
        },
        handleCancel() {
            this.$emit('cancel')
        },
        resetForm() {
            this.form = {
                month: null,
                rows: [this.emptyRow()]
            }
            this.hoverIdx = -1
        },
        async handleQuery() {
            if (!this.form.month) {
                this.$message.warning('请选择月份');
                return;
            }
            const params = {
                proId: this.proId,
                month: this.form.month.format ? this.form.month.format('YYYY-MM') : this.form.month
            };
            try {
                const res = await getAction('/serviceCost/listNotPage', params);
                let records = [];
                if (res.success && res.result && Array.isArray(res.result.records)) {
                    records = res.result.records;
                } else if (res.success && Array.isArray(res.result)) {
                    records = res.result;
                }
                if (records.length > 0) {
                    this.form.rows = records.map(item => ({
                        month: item.month,
                        port: item.port,
                        rebate: item.rebate != null ? (Number(item.rebate) * 100) : null, // 转为百分比
                        cost: item.cost,
                        money: item.money,
                        proId: this.proId
                    }));
                } else {
                    this.form.rows = [this.emptyRow()];
                    this.$message.info('未查询到数据');
                }
            } catch (e) {
                this.form.rows = [this.emptyRow()];
                this.$message.error('查询失败');
            }
        }
    }
}
</script>

<style scoped>
.fee-wrap {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    background: #fff;
    padding: 0 0 12px 0;
    margin-bottom: 0;
}

.fee-header {
    display: flex;
    background: #fafafa;
    border-bottom: 1px solid #d9d9d9;
    border-radius: 8px 8px 0 0;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    padding: 10px 0 10px 0;
}

.fee-header-index,
.fee-index {
    width: 60px;
    min-width: 60px;
    text-align: center;
}

.fee-header-month {
    width: 120px;
    min-width: 120px;
    text-align: center;
}

.fee-header-port {
    width: 120px;
    min-width: 120px;
    text-align: center;
}

.fee-header-rebate {
    width: 140px;
    min-width: 140px;
    text-align: center;
}

.fee-header-cost {
    width: 140px;
    min-width: 140px;
    text-align: center;
}

.fee-header-money {
    width: 140px;
    min-width: 140px;
    text-align: center;
}

.fee-header-action {
    width: 60px;
    min-width: 60px;
    text-align: center;
}

.fee-body {
    padding: 0 0 0 0;
}

.fee-row {
    display: flex;
    align-items: center;
    font-size: 14px;
    border-radius: 4px;
    margin-bottom: 4px;
    transition: background 0.2s, box-shadow 0.2s;
    background: #fff;
}

.fee-index {
    width: 60px;
    min-width: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.fee-item-inner {
    display: flex;
    align-items: center;
    width: 100%;
    background: #fff;
    /* border: 1px solid #d9d9d9; */
    border-radius: 4px;
    padding: 6px 0px;
    margin: 0 4px;
    transition: border-color 0.2s, background 0.2s;
}

.fee-item-inner.fee-action {
    width: 60px;
    min-width: 60px;
    justify-content: center;
    border: none;
    background: transparent;
    margin: 0;
}

.fee-item-inner .fee-input[disabled] {
    background: #fafafa;
}

.fee-item-inner .ant-picker {
    width: 100%;
}

.fee-row-hover,
.fee-row:hover {
    background: #f5f5f5;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.08);
}

.fee-input {
    width: 100%;
}

.fee-input[disabled] {
    background: #fafafa;
}

.fee-rebate {
    display: flex;
    align-items: center;
}

.fee-percent {
    margin-left: 2px;
    color: #888;
}

.fee-action {
    justify-content: center;
    border: none;
    background: transparent;
}

.fee-delete-btn {
    display: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    margin-left: 8px;
}

.fee-delete-icon {
    font-size: 16px;
    color: #8c8c8c;
}

.fee-row:hover .fee-delete-btn,
.fee-row-hover .fee-delete-btn {
    display: flex;
}

.fee-delete-btn:hover {
    background: #ff4d4f;
}

.fee-delete-btn:hover .fee-delete-icon {
    color: #fff;
}

.fee-add-btn {
    margin-top: 8px;
    width: 100%;
    border-radius: 4px;
}

.fee-row-hover .fee-item-inner,
.fee-row:hover .fee-item-inner {
    border-color: #255cc2;
    background: #f5f5f5;
}
</style>