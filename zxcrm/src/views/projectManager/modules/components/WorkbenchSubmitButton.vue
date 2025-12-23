<template>
    <button class="workbench-submit-btn" :disabled="disabled || loading" @click="$emit('click')">
        <span v-if="loading">处理中...</span>
        <span v-else>提交</span>
    </button>
</template>

<script>
export default {
    name: 'WorkbenchSubmitButton',
    props: {
        loading: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        }
    }
};
</script>

<style scoped>
.workbench-submit-btn {
    width: 100%;
    padding: 16px 0;
    font-size: 20px;
    background: #1890ff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    margin-top: 16px;
    transition: background 0.2s;
    position: relative;
    opacity: 1;
}

.workbench-submit-btn[disabled] {
    background: #bfbfbf;
    cursor: not-allowed;
    opacity: 0.7;
}

.workbench-submit-btn:hover:not([disabled]) {
    background: #40a9ff;
}
</style>
