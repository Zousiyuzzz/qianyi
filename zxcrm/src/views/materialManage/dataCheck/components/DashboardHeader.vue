<template>
    <header class="dashboard-header">
        <div class="header-content">
            <div class="title-section">
                <a-icon type="bar-chart" class="header-icon" />
                <h1 class="main-title">返点数据洞察</h1>
            </div>
            <div class="header-actions">
                <div class="update-time">
                    <span>数据更新时间: {{ new Date().toLocaleDateString() }}</span>
                    <a-button type="link" size="small" class="refresh-link" @click="$emit('refresh')">
                        <a-icon type="reload" />
                        刷新
                    </a-button>
                </div>
                <div class="filter-group">
                    <a-select v-model="localPeriod" placeholder="5月" class="filter-select" @change="handlePeriodChange">
                        <a-select-option v-for="month in 12" :key="month" :value="`${month}月`">
                            {{ month }}月
                        </a-select-option>
                    </a-select>
                    <a-select v-model="localYear" placeholder="2025" class="filter-select" @change="handleYearChange">
                        <a-select-option value="2024">2024</a-select-option>
                        <a-select-option value="2025">2025</a-select-option>
                    </a-select>
                    <a-select v-model="localType" placeholder="综代政策" class="filter-select" @change="handleTypeChange">
                        <a-select-option value="综代政策">综代政策</a-select-option>
                        <a-select-option value="汽车政策">汽车政策</a-select-option>
                    </a-select>
                    <a-select v-model="localCompany" class="filter-select company-select" @change="handleCompanyChange">
                        <a-select-option value="上海岂量信息科技有限公司">上海岂量信息科技有限公司</a-select-option>
                    </a-select>
                </div>
            </div>
        </div>
    </header>
</template>

<script>
export default {
    name: 'DashboardHeader',
    props: {
        selectedPeriod: {
            type: String,
            default: '5月'
        },
        selectedYear: {
            type: String,
            default: '2025'
        },
        selectedType: {
            type: String,
            default: '综代政策'
        },
        selectedCompany: {
            type: String,
            default: '上海岂量信息科技有限公司'
        }
    },
    data() {
        return {
            localPeriod: this.selectedPeriod,
            localYear: this.selectedYear,
            localType: this.selectedType,
            localCompany: this.selectedCompany
        };
    },
    watch: {
        selectedPeriod(val) {
            this.localPeriod = val;
        },
        selectedYear(val) {
            this.localYear = val;
        },
        selectedType(val) {
            this.localType = val;
        },
        selectedCompany(val) {
            this.localCompany = val;
        }
    },
    methods: {
        handlePeriodChange(val) {
            this.$emit('update:selectedPeriod', val);
        },
        handleYearChange(val) {
            this.$emit('update:selectedYear', val);
        },
        handleTypeChange(val) {
            this.$emit('update:selectedType', val);
        },
        handleCompanyChange(val) {
            this.$emit('update:selectedCompany', val);
        }
    }
};
</script>

<style scoped>
.dashboard-header {
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    position: sticky;
    top: 0;
    z-index: 50;
    border-bottom: 1px solid #E5E6EB;
}

.header-content {
    max-width: 100%;
    margin: 0 auto;
    padding: 16px 24px;
}

.title-section {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
}

.header-icon {
    font-size: 24px;
    color: #165DFF;
    margin-right: 12px;
}

.main-title {
    font-size: 20px;
    font-weight: 600;
    color: #272E3B;
    margin: 0;
}

.header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
}

.update-time {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #86909C;
    font-size: 14px;
}

.refresh-link {
    color: #165DFF;
    padding: 0;
}

.filter-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.filter-select {
    min-width: 120px;
}

.company-select {
    min-width: 200px;
}
</style>
