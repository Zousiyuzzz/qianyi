<template>
    <div class="data-comparison-container">
        <!-- 页面标题和筛选器 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">数据对比报表</h1>
                <div class="filter-section">
                    <div class="date-filter">
                        <span class="filter-label">日期范围：</span>
                        <a-range-picker v-model="dateRange" :ranges="dateRanges" format="YYYY-MM-DD"
                            @change="handleDateChange" style="width: 240px;" />
                    </div>
                    <a-button type="primary" @click="refreshData" :loading="loading">
                        <a-icon type="reload" />
                        刷新数据
                    </a-button>
                </div>
            </div>
        </div>

        <!-- 图表区域 -->
        <div class="chart-section">
            <div class="chart-card">
                <div class="chart-header">
                    <h3 class="chart-title">数据对比图表</h3>
                    <div class="chart-info">
                        <span class="info-text">统计周期：{{ dateRangeText }}</span>
                    </div>
                </div>
                <div class="chart-container">
                    <PlatformTotalByDay ref="platformTotalByDay" :dateRange="dateRange">
                    </PlatformTotalByDay>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import PlatformTotalByDay from './components/platformTotalByDay.vue';

export default {
    name: 'DataComparison',
    components: {
        PlatformTotalByDay
    },
    data() {
        return {
            loading: false,
            dateRange: [
                moment().subtract(7, 'days').format('YYYY-MM-DD'),
                moment().format('YYYY-MM-DD')
            ],
            dateRanges: {
                '最近7天': [moment().subtract(7, 'days'), moment()],
                '最近30天': [moment().subtract(30, 'days'), moment()],
                '最近90天': [moment().subtract(90, 'days'), moment()],
                '本月': [moment().startOf('month'), moment().endOf('month')],
                '上月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };
    },
    computed: {
        dateRangeText() {
            if (this.dateRange && this.dateRange.length === 2) {
                return `${this.dateRange[0]} 至 ${this.dateRange[1]}`;
            }
            return '请选择日期范围';
        }
    },
    mounted() {
        // 页面加载时自动获取数据
        this.refreshData();
    },
    methods: {
        handleDateChange(dates) {
            if (dates && dates.length === 2) {
                this.dateRange = [
                    dates[0].format('YYYY-MM-DD'),
                    dates[1].format('YYYY-MM-DD')
                ];
                this.refreshData();
            }
        },
        refreshData() {
            this.loading = true;
            // 使用 nextTick 确保 DOM 更新后再刷新图表
            this.$nextTick(() => {
                if (this.$refs.platformTotalByDay && this.$refs.platformTotalByDay.refreshData) {
                    this.$refs.platformTotalByDay.refreshData();
                }
                this.loading = false;
            });
        }
    }
};
</script>

<style lang="less" scoped>
.data-comparison-container {
    padding: 24px;
    background: #f5f5f5;
    min-height: 100vh;
}

.page-header {
    background: white;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
}

.page-title {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
}

.filter-section {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.date-filter {
    display: flex;
    align-items: center;
    gap: 8px;
}

.filter-label {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
}

.chart-section {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-card {
    width: 100%;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
}

.chart-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
}

.chart-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.info-text {
    font-size: 14px;
    color: #6b7280;
}

.chart-container {
    height: 500px;
    min-height: 400px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .data-comparison-container {
        padding: 16px;
    }

    .header-content {
        flex-direction: column;
        align-items: flex-start;
    }

    .filter-section {
        width: 100%;
        justify-content: space-between;
    }

    .chart-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .chart-container {
        height: 400px;
    }
}
</style>
