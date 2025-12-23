<template>
    <div class="transaction-table-container">
        <div class="table-header">
            <button class="download-btn" @click="$emit('download')">
                <span>📥</span> 下载图片
            </button>
            <h3 class="table-title">交易记录</h3>
        </div>
        <div class="table-image-wrapper">
            <img v-if="imageUrl" :src="imageUrl" alt="交易记录" class="table-image" @click="$emit('view-image')" />
            <div v-else class="table-loading">生成图片中...</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TransactionTable',
    props: {
        records: {
            type: Array,
            default: () => []
        },
        imageUrl: {
            type: String,
            default: ''
        }
    }
};
</script>

<style scoped>
.transaction-table-container {
    margin-top: 20px;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 4px;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.download-btn {
    padding: 8px 12px;
    font-size: 14px;
    background: #1890ff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    gap: 5px;
}

.download-btn:hover {
    background: #40a9ff;
}

.table-title {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
}

.table-image-wrapper {
    text-align: center;
    margin: 20px 0;
}

.table-image {
    max-width: 100%;
    height: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-image:hover {
    transform: scale(1.02);
}

.table-loading {
    padding: 40px;
    color: #666;
    font-size: 16px;
}
</style>
