<template>
    <div class="analysis-section" :class="{ 'is-loading': loading }">
        <div v-if="loading" class="section-loading-overlay">
            <a-spin tip="加载中..." />
        </div>
        <h3 class="diagnosis-section-title">
            <a-icon type="line-chart" class="section-icon" />
            整体趋势分析
        </h3>
        <div class="trend-summary">
            <div class="trend-item">
                <span class="trend-label">业绩消耗趋势：</span>
                <span class="trend-value">{{ formatAmount(perfConsumption) }}</span>
                <span :class="perfChange.includes('+') ? 'trend-down' : 'trend-up'">
                    {{ perfChange }}
                </span>
            </div>
            <div class="trend-item">
                <span class="trend-label">返点总额：</span>
                <span class="trend-value">{{ formatAmount(totalRebateAmount) }}</span>
                <span :class="totalRebateChange.includes('+') ? 'trend-down' : 'trend-up'">
                    {{ totalRebateChange }}
                </span>
            </div>
            <div class="trend-item">
                <span class="trend-label">返点率：</span>
                <span class="trend-value">{{ rebateRate }}%</span>
                <span :class="rebateRateChange.includes('+') ? 'trend-down' : 'trend-up'">
                    {{ rebateRateChange }}
                </span>
            </div>
            <div class="trend-item">
                <span class="trend-label">竞价基础返点：</span>
                <span class="trend-value">{{ formatAmount(biddingRiskControlRebate) }}</span>
                <span :class="biddingChange.includes('+') ? 'trend-down' : 'trend-up'">
                    {{ biddingChange }}
                </span>
            </div>
            <div class="trend-item">
                <span class="trend-label">优质素材消耗：</span>
                <span class="trend-value">{{ formatAmount(highQualityConsumption) }}</span>
                <span :class="highQualityChange.includes('+') ? 'trend-down' : 'trend-up'">
                    {{ highQualityChange }}
                </span>
            </div>
            <div class="trend-item">
                <span class="trend-label">首发素材消耗：</span>
                <span class="trend-value">{{ formatAmount(firstReleaseConsumption) }}</span>
                <span :class="firstReleaseChange.includes('+') ? 'trend-down' : 'trend-up'">
                    {{ firstReleaseChange }}
                </span>
            </div>
            <div class="trend-item">
                <span class="trend-label">直播返点：</span>
                <span class="trend-value">{{ formatAmount(liveConsumption) }}</span>
                <span :class="liveChange.includes('+') ? 'trend-down' : 'trend-up'">
                    {{ liveChange }}
                </span>
            </div>
            <div class="trend-item">
                <span class="trend-label">预付指标：</span>
                <span class="trend-value">{{ formatAmount(prepaidConsumption) }}</span>
                <span :class="prepaidChange.includes('+') ? 'trend-down' : 'trend-up'">
                    {{ prepaidChange }}
                </span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TrendAnalysis',
    props: {
        perfConsumption: { type: Number, default: 0 },
        totalRebateAmount: { type: Number, default: 0 },
        rebateRate: { type: Number, default: 0 },
        biddingRiskControlRebate: { type: Number, default: 0 },
        highQualityConsumption: { type: Number, default: 0 },
        firstReleaseConsumption: { type: Number, default: 0 },
        liveConsumption: { type: Number, default: 0 },
        prepaidConsumption: { type: Number, default: 0 },
        perfChange: { type: String, default: '' },
        totalRebateChange: { type: String, default: '' },
        rebateRateChange: { type: String, default: '' },
        biddingChange: { type: String, default: '' },
        highQualityChange: { type: String, default: '' },
        firstReleaseChange: { type: String, default: '' },
        liveChange: { type: String, default: '' },
        prepaidChange: { type: String, default: '' },
        loading: { type: Boolean, default: false }
    },
    methods: {
        formatAmount(value) {
            const absValue = Math.abs(value);
            let unit = '元';
            let divisor = 1;

            if (absValue >= 100000000) {
                unit = '亿元';
                divisor = 100000000;
            } else if (absValue >= 10000) {
                unit = '万元';
                divisor = 10000;
            }

            return `${(value / divisor).toFixed(2)}${unit}`;
        }
    }
};
</script>

<style scoped>
.analysis-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
    border: 1px solid #E5E6EB;
    position: relative;
}

.analysis-section.is-loading {
    pointer-events: none;
}

.section-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 12px;
}

.diagnosis-section-title {
    font-size: 15px;
    font-weight: 600;
    color: #272E3B;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.section-icon {
    color: #165DFF;
    font-size: 16px;
}

.trend-summary {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.trend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    padding: 12px;
    background: #F5F7FA;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.trend-item:hover {
    background: #EFF2F5;
}

.trend-label {
    color: #86909C;
    min-width: 80px;
}

.trend-value {
    color: #272E3B;
    font-weight: 500;
}

.trend-up {
    color: #52C41A;
    font-weight: 600;
}

.trend-down {
    color: #FF4D4F;
    font-weight: 600;
}

@media (max-width: 768px) {
    .trend-summary {
        grid-template-columns: 1fr;
    }
}
</style>
