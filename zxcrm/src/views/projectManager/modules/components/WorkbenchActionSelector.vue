<template>
    <div class="workbench-form-row">
        <select :value="value" class="workbench-select" @change="$emit('change', $event.target.value)">
            <option value="查询客户余额">查询客户余额</option>
            <option value="查询账户余额">查询账户余额</option>
            <option value="查询钱包余额">查询钱包余额</option>
            <option value="充值模板">充值模板</option>
            <option value="退款模板">退款模板</option>
            <option value="转账模板(单笔)">转账模板(单笔)</option>
            <option value="转账模板(批量)">转账模板(批量)</option>
            <option value="钱包充值模板">钱包充值模板</option>
            <option value="钱包退款模板">钱包退款模板</option>
            <option value="子端口对公充值">子端口对公充值</option>
            <option value="子端口对私充值">子端口对私充值</option>
        </select>
        <button class="workbench-detail-btn" @click="$emit('detail')">
            明细记录
        </button>
    </div>
</template>

<script>
export default {
    name: 'WorkbenchActionSelector',
    props: {
        value: {
            type: String,
            default: '查询客户余额'
        }
    }
};
</script>

<style scoped>
.workbench-form-row {
    display: flex;
    align-items: center;
    gap: 12px;
    white-space: nowrap;
    justify-content: space-between;
}

.workbench-select {
    min-width: 160px;
    padding: 8px 16px;
    font-size: 16px;
    border-radius: 4px;
    border: 1px solid #b7b7b9bb;
    white-space: nowrap;
}

.workbench-select:focus {
    border-color: #40a9ff;
    outline: none;
    box-shadow: 0 0 0 2px #40a9ff22;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.workbench-detail-btn {
    margin-left: auto;
    min-width: 160px;
    white-space: nowrap;
    padding: 6px 16px;
    font-size: 14px;
    background: #fff;
    border: 1px solid #1890ff;
    color: #1890ff;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
}

.workbench-detail-btn:hover {
    background: #e6f7ff;
}

@media (max-width: 768px) {
    .workbench-form-row {
        flex-direction: column;
        align-items: stretch;
        white-space: normal;
        gap: 8px;
    }

    .workbench-select,
    .workbench-detail-btn {
        width: 100%;
        min-width: unset;
        max-width: 100%;
    }
}
</style>
