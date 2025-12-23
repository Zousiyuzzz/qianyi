<template>
    <div class="workbench-form-row">
        <textarea :value="value" class="workbench-textarea" :placeholder="placeholder" rows="5"
            @input="$emit('input', $event.target.value)"></textarea>
    </div>
</template>

<script>
export default {
    name: 'WorkbenchInputArea',
    props: {
        value: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: '请输入内容'
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

.workbench-textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 20px;
    font-size: 20px;
    border-radius: 4px;
    border: 1px solid #d9d9d9;
    resize: vertical;
    min-width: 0;
    max-width: 100%;
}

.workbench-textarea:focus {
    border-color: #40a9ff;
    outline: none;
    box-shadow: 0 0 0 2px #40a9ff22;
    transition: border-color 0.2s, box-shadow 0.2s;
}

@media (max-width: 768px) {
    .workbench-textarea {
        width: 100%;
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
        display: block;
    }
}
</style>
