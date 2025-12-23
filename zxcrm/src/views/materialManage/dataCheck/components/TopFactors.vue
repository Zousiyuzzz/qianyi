<template>
    <div class="analysis-section" :class="{ 'is-loading': loading }">
        <div v-if="loading" class="section-loading-overlay">
            <a-spin tip="加载中..." />
        </div>
        <h3 class="diagnosis-section-title">
            <a-icon type="fire" class="section-icon" />
            TOP3影响因素
        </h3>
        <ul class="factors-list">
            <li v-for="(factor, index) in factors" :key="index" class="factor-item">
                <div class="factor-rank">{{ index + 1 }}</div>
                <div class="factor-content">
                    <span class="factor-name">{{ factor.name }}</span>
                    <span :class="factor.change.isPositive ? 'positive-value' : 'negative-value'">
                        {{ factor.change.amount }} {{ factor.change.percent }}
                    </span>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'TopFactors',
    props: {
        factors: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
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

.factors-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.factor-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    margin-bottom: 8px;
    background: #F5F7FA;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.factor-item:hover {
    background: #EFF2F5;
    transform: translateX(4px);
}

.factor-rank {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #165DFF;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
}

.factor-item:nth-child(1) .factor-rank {
    background: #FF4D4F;
}

.factor-item:nth-child(2) .factor-rank {
    background: #FAAD14;
}

.factor-item:nth-child(3) .factor-rank {
    background: #52C41A;
}

.factor-content {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.factor-name {
    color: #272E3B;
    font-weight: 500;
}

.positive-value {
    color: #FF4D4F;
    font-weight: 600;
}

.negative-value {
    color: #52C41A;
    font-weight: 600;
}
</style>
