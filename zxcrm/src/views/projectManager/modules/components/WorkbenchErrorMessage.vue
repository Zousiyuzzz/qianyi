<template>
    <div class="workbench-error-msg">{{ message }}</div>
</template>

<script>
export default {
    name: 'WorkbenchErrorMessage',
    props: {
        message: {
            type: String,
            required: true
        }
    }
};
</script>

<style scoped>
.workbench-error-msg {
    color: #414040;
    margin-top: 12px;
    font-size: 18px;
    font-weight: bold;
    text-align: left;
    white-space: pre-line;
    background: rgba(239, 241, 239, 0.822);
    border: 1px solid #eff0ee;
    border-radius: 4px;
    padding: 12px;
    line-height: 1.5;
}
</style>
