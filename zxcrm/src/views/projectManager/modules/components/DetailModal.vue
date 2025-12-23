<template>
    <div class="detail-modal" @click="$emit('close')">
        <div class="detail-modal-content" @click.stop>
            <div class="detail-modal-header">
                <h3>充转退明细查询</h3>
                <div class="header-actions">
                    <button class="filter-btn" @click="$emit('filter')">
                        筛选
                    </button>
                    <button class="close-btn" @click="$emit('close')">×</button>
                </div>
            </div>
            <div class="detail-modal-body" @scroll="$emit('scroll', $event)">
                <div v-if="loading" class="detail-loading">
                    <div class="loading-spinner"></div>
                    <div>加载中...</div>
                </div>
                <div v-else-if="records.length === 0" class="detail-empty">
                    暂无明细记录
                </div>
                <div v-else class="detail-list">
                    <div v-for="(record, index) in records" :key="`${record.id}-${index}`" class="detail-item"
                        @click="$emit('item-click', record)">
                        <div class="detail-item-main">
                            <!-- 转入方信息 -->
                            <div v-if="record.targetAdvertiserId || record.targetAdvertiserName" class="detail-section">
                                <div class="detail-entity-name">
                                    <span class="detail-section-title">转入方</span>
                                    {{ record.targetAdvertiserName || '未知账户' }}
                                </div>
                                <div class="detail-account-id">账户ID：{{ record.targetAdvertiserId }}</div>
                            </div>

                            <!-- 转出方信息 -->
                            <div v-if="record.sourceAdvertiserId || record.sourceAdvertiserName" class="detail-section">
                                <div class="detail-entity-name">
                                    <span class="detail-section-title">转出方</span>
                                    {{ record.sourceAdvertiserName || '未知账户' }}
                                </div>
                                <div class="detail-account-id">账户ID：{{ record.sourceAdvertiserId }}</div>
                            </div>

                            <div class="detail-time">
                                {{ record.createTime }}
                            </div>
                        </div>
                        <div class="detail-item-right">
                            <div class="detail-amount">
                                {{ parseFloat(record.amount || 0).toFixed(3) }}
                            </div>
                            <div class="detail-status"
                                :class="{ 'success': record.state === '1', 'processing': record.state === '2', 'failed': record.state === '3' }">
                                {{ getStateText(record.state) }}
                            </div>
                            <div class="detail-action">
                                <button class="view-image-btn" @click.stop="$emit('view-image', record)">
                                    点击图片查看
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 加载更多提示 -->
                    <div v-if="hasMore || loadingMore" class="load-more-section">
                        <div v-if="loadingMore" class="loading-more">
                            <div class="loading-spinner"></div>
                            <div>加载更多中...</div>
                        </div>
                        <div v-else-if="hasMore" class="load-more-tip">
                            滚动到底部加载更多
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getStateText } from '../parsers';

export default {
    name: 'DetailModal',
    props: {
        records: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        },
        hasMore: {
            type: Boolean,
            default: false
        },
        loadingMore: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        getStateText
    }
};
</script>

<style scoped>
.detail-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.detail-modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
    max-height: 90%;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.detail-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
}

.detail-modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.header-actions .filter-btn {
    background: none;
    border: none;
    color: #1890ff;
    font-size: 14px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.header-actions .filter-btn:hover {
    background-color: #f0f0f0;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
}

.close-btn:hover {
    background-color: #f0f0f0;
}

.detail-modal-body {
    padding: 20px;
    max-height: calc(90vh - 100px);
    overflow-y: auto;
}

.detail-loading {
    text-align: center;
    padding: 40px;
    color: #666;
}

.loading-spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #1890ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 10px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.detail-empty {
    text-align: center;
    padding: 40px;
    color: #999;
    font-size: 16px;
}

.detail-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    background: white;
    transition: all 0.2s;
    cursor: pointer;
}

.detail-item:hover {
    border-color: #1890ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.detail-item-main {
    flex: 1;
    min-width: 0;
}

.detail-section {
    margin-bottom: 12px;
}

.detail-section-title {
    font-size: 14px;
    font-weight: bold;
    color: #666;
    margin-right: 8px;
}

.detail-entity-name {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
}

.detail-account-id {
    color: #666;
    font-size: 14px;
    margin-bottom: 4px;
}

.detail-time {
    color: #999;
    font-size: 12px;
}

.detail-item-right {
    text-align: right;
    min-width: 120px;
}

.detail-amount {
    font-size: 20px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
}

.detail-status {
    font-size: 14px;
    margin-bottom: 8px;
}

.detail-status.success {
    color: #52c41a;
}

.detail-status.processing {
    color: #faad14;
}

.detail-status.failed {
    color: #ff4d4f;
}

.view-image-btn {
    background: #1890ff;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
    margin-bottom: 4px;
    position: relative;
    z-index: 10;
}

.view-image-btn:hover {
    background: #40a9ff;
}

.load-more-section {
    text-align: center;
    padding: 20px;
    border-top: 1px solid #f0f0f0;
}

.loading-more {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 14px;
}

.loading-more .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #1890ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.load-more-tip {
    color: #999;
    font-size: 14px;
}
</style>
