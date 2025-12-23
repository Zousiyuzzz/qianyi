<template>
    <div class="data-cards-list" :class="{ 'is-loading': loading }">
        <div v-if="loading" class="list-loading-overlay">
            <a-spin tip="加载中..." />
        </div>
        <ul class="cards-list">
            <li v-for="card in cards" :key="card.id"
                :class="['card-list-item', card.cardClass, { 'expanded': expandedCards[card.id] }]"
                @click="handleCardClick(card.id)">
                <div class="card-item-header">
                    <div class="card-item-icon" :class="card.iconClass">
                        <a-icon :type="card.icon" />
                    </div>
                    <div class="card-item-content">
                        <span class="card-item-name">{{ card.name }}</span>
                        <div class="card-item-value-row">
                            <span class="card-item-value">{{ formatAmount(card.value) }}</span>
                            <span :class="['card-item-change', card.change.includes('+') ? 'positive' : 'negative']">
                                {{ card.change }}
                            </span>
                        </div>
                    </div>
                    <a-icon :type="expandedCards[card.id] ? 'up' : 'down'" class="expand-icon" />
                </div>
                <transition name="card-detail">
                    <div v-if="expandedCards[card.id]" class="card-item-detail" @click.stop>
                        <slot name="detail" :card="card" :cardId="card.id"></slot>
                    </div>
                </transition>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'DataCardList',
    props: {
        cards: {
            type: Array,
            required: true
        },
        expandedCards: {
            type: Object,
            default: () => ({})
        },
        loading: {
            type: Boolean,
            default: false
        }
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
        },
        handleCardClick(cardId) {
            this.$emit('card-click', cardId);
        }
    }
};
</script>

<style scoped>
.data-cards-list {
    position: relative;
}

.data-cards-list.is-loading {
    pointer-events: none;
}

.list-loading-overlay {
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

.cards-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.card-list-item {
    background: white;
    border-radius: 12px;
    border: 1px solid #E5E6EB;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
}

.card-list-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
}

.card-item-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
}

.card-item-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    font-size: 24px;
    flex-shrink: 0;
}

.card-item-content {
    flex: 1;
    min-width: 0;
}

.card-item-name {
    display: block;
    font-size: 14px;
    color: #86909C;
    margin-bottom: 8px;
}

.card-item-value-row {
    display: flex;
    align-items: baseline;
    gap: 12px;
}

.card-item-value {
    font-size: 24px;
    font-weight: 700;
    color: #272E3B;
}

.card-item-change {
    font-size: 14px;
    font-weight: 500;
}

.card-item-change.positive {
    color: #FF4D4F;
}

.card-item-change.negative {
    color: #52C41A;
}

.expand-icon {
    color: #86909C;
    font-size: 16px;
    transition: transform 0.3s ease;
    flex-shrink: 0;
}

.card-list-item.expanded .expand-icon {
    transform: rotate(180deg);
}

.card-item-detail {
    border-top: 1px solid #E5E6EB;
    background: #F8FBFF;
    overflow: hidden;
}

/* 卡片展开动画 */
.card-detail-enter-active,
.card-detail-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
}

.card-detail-enter,
.card-detail-leave-to {
    max-height: 0;
    opacity: 0;
    padding-top: 0;
    padding-bottom: 0;
}

.card-detail-enter-to,
.card-detail-leave {
    max-height: 500px;
    opacity: 1;
}
</style>
