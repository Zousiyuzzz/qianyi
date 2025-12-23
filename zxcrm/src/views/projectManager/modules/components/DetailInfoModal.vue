<template>
    <div class="image-modal" @click="$emit('close')">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>明细详情</h3>
                <button class="close-btn" @click="$emit('close')">×</button>
            </div>
            <div class="modal-body">
                <div v-if="record" class="detail-info-content">
                    <div class="detail-info-section">
                        <h4>基本信息</h4>
                        <div class="detail-info-row">
                            <span class="detail-info-label">交易时间：</span>
                            <span class="detail-info-value">{{ record.createTime }}</span>
                        </div>
                        <div class="detail-info-row">
                            <span class="detail-info-label">业务平台：</span>
                            <span class="detail-info-value">{{ record.channelName || '-' }}</span>
                        </div>
                        <div class="detail-info-row">
                            <span class="detail-info-label">交易金额：</span>
                            <span class="detail-info-value amount">{{ parseFloat(record.amount || 0).toFixed(3)
                                }}</span>
                        </div>
                        <div class="detail-info-row">
                            <span class="detail-info-label">交易状态：</span>
                            <span class="detail-info-value status"
                                :class="{ 'success': record.state === '1', 'processing': record.state === '2', 'failed': record.state === '3' }">
                                {{ getStateText(record.state) }}
                            </span>
                        </div>
                        <div class="detail-info-row">
                            <span class="detail-info-label">交易类型：</span>
                            <span class="detail-info-value">{{ getTradeTypeText(record.tradeType) }}</span>
                        </div>
                        <div class="detail-info-row">
                            <span class="detail-info-label">交易批次号：</span>
                            <span class="detail-info-value">{{ record.batchNumber || '-' }}</span>
                        </div>
                    </div>

                    <div class="detail-info-section">
                        <h4>账户信息</h4>
                        <div v-if="record.targetAdvertiserId || record.targetAdvertiserName" class="detail-info-row">
                            <span class="detail-info-label">转入方：</span>
                            <span class="detail-info-value">{{ record.targetAdvertiserName || '未知账户' }} ({{
                                record.targetAdvertiserId }})</span>
                        </div>
                        <div v-if="record.sourceAdvertiserId || record.sourceAdvertiserName" class="detail-info-row">
                            <span class="detail-info-label">转出方：</span>
                            <span class="detail-info-value">{{ record.sourceAdvertiserName || '未知账户' }} ({{
                                record.sourceAdvertiserId }})</span>
                        </div>
                    </div>

                    <div v-if="record.errMsg" class="detail-info-section">
                        <h4>错误信息</h4>
                        <div class="detail-info-row">
                            <span class="detail-info-label">失败原因：</span>
                            <span class="detail-info-value error">{{ record.errMsg }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getStateText, getTradeTypeText } from '../parsers';

export default {
    name: 'DetailInfoModal',
    props: {
        record: {
            type: Object,
            default: null
        }
    },
    methods: {
        getStateText,
        getTradeTypeText
    }
};
</script>

<style scoped>
.image-modal {
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

.modal-content {
    background: white;
    border-radius: 8px;
    max-width: 90%;
    max-height: 90%;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
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

.modal-body {
    padding: 20px;
    text-align: center;
    max-height: calc(90vh - 100px);
    overflow: auto;
}

.detail-info-content {
    text-align: left;
}

.detail-info-section {
    margin-bottom: 24px;
}

.detail-info-section h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: bold;
    color: #333;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
}

.detail-info-row {
    display: flex;
    margin-bottom: 8px;
    line-height: 1.5;
}

.detail-info-label {
    min-width: 100px;
    color: #666;
    font-size: 14px;
}

.detail-info-value {
    flex: 1;
    color: #333;
    font-size: 14px;
    word-break: break-all;
}

.detail-info-value.amount {
    font-size: 16px;
    font-weight: bold;
    color: #1890ff;
}

.detail-info-value.status {
    font-weight: bold;
}

.detail-info-value.status.success {
    color: #52c41a;
}

.detail-info-value.status.processing {
    color: #faad14;
}

.detail-info-value.status.failed {
    color: #ff4d4f;
}

.detail-info-value.error {
    color: #ff4d4f;
    background: #fff2f0;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #ffccc7;
}
</style>
