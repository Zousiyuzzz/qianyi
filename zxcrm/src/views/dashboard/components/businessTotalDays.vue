<template>
    <div class="chart-container">
        <a-spin :spinning="loading" tip="数据加载中...">
            <div ref="chart" style="width: 100%; height: 36vh;"></div>
        </a-spin>
    </div>
</template>

<script>
import { getAction } from '@/api/manage';
import * as echarts from 'echarts';

export default {
    props: {
        dateRange: {
            type: Array,
            default: () => [],
            validator: (value) => value.length === 0 || value.length === 2,
        },
        countType: {
            type: String,
            default: 'day',
        },
        businessIds: {
            type: String,
            default: '',
        },
        businessOptions: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            loading: true,
            businessidList: [],
            myChart: null,
            resizeObserver: null,
            globalthisBusinessIds: '',
            chartOptions: {
                color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'],
                title: {
                    text: '渠道消费对比',
                    subtext: '',
                    left: 'center',
                    textStyle: {
                        fontSize: 22,
                        color: '#333',
                    },
                    subtextStyle: {
                        fontSize: 14,
                        color: '#666',
                    },
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow',
                    },
                    formatter: (params) => {
                        let result = `${params[0].axisValue}<br/>`;
                        params.forEach((item) => {
                            result += `${item.marker} ${item.seriesName}: ￥${item.value.toLocaleString()}<br/>`;
                        });
                        return result;
                    },
                    backgroundColor: 'rgba(50,50,50,0.95)',
                    borderColor: '#333',
                    textStyle: {
                        color: '#fff',
                        fontSize: 14,
                    },
                    confine: true,
                    z: 100,
                },
                legend: {
                    data: [],
                    bottom: 0,
                    textStyle: {
                        fontSize: 12,
                    },
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: { show: true, readOnly: false },
                        magicType: { show: true, type: ['line', 'bar', 'stack'] },
                        restore: { show: true },
                        saveAsImage: { show: true },
                    },
                },
                grid: {
                    left: '15%',
                    right: '5%',
                    top: '20%',
                    bottom: '15%',
                },
                xAxis: {
                    type: 'category',
                    axisTick: { show: false },
                    data: [],
                    axisLabel: {
                        fontSize: 12,
                    },
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        formatter: '￥{value}',
                        fontSize: 12,
                        margin: 15,
                    },
                    name: '金额 (￥)',
                    nameTextStyle: {
                        fontSize: 14,
                    },
                },
                series: [],
            },
        };
    },
    watch: {
        dateRange: {
            handler(newVal) {
                if (newVal && newVal.length === 2) {
                    this.getData();
                }
            },
        },
        businessIds: {
            handler(newVal) {
                if (newVal === '') {
                    this.globalthisBusinessIds = this.businessOptions.map((item) => item.value).join(',');
                } else {
                    this.globalthisBusinessIds = newVal;
                }
                this.getData();
            },
            immediate: true,
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.initChart();
            this.setupResizeObserver();
        });
        window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.myChart) {
            this.myChart.dispose();
            this.myChart = null;
        }
    },
    methods: {
        initChart() {
            if (!this.$refs.chart || !(this.$refs.chart instanceof HTMLElement)) {
                console.warn('Chart ref is not a valid DOM element');
                return;
            }
            try {
                if (this.myChart) {
                    this.myChart.dispose();
                }
                this.myChart = echarts.init(this.$refs.chart);
                this.$nextTick(() => {
                    if (this.myChart) {
                        this.myChart.resize();
                    }
                });
            } catch (error) {
                console.error('Failed to initialize chart:', error);
            }
        },
        setupResizeObserver() {
            if (this.$refs.chart && this.$refs.chart instanceof HTMLElement) {
                this.resizeObserver = new ResizeObserver(() => {
                    if (this.myChart) {
                        this.myChart.resize();
                    }
                });
                this.resizeObserver.observe(this.$refs.chart);
            }
        },
        async getData() {
            try {
                if (!this.dateRange || this.dateRange.length !== 2) return;
                this.loading = true;
                const businessRes = await getAction('/agentdata/getBusinessDayTotal', {
                    businessIds: this.globalthisBusinessIds.split(','),
                    beginDate: this.dateRange[0],
                    endDate: this.dateRange[1],
                }, 'GET');
                if (!businessRes.success) {
                    throw new Error(businessRes.message);
                }
                this.processChartData(businessRes.result);
            } catch (error) {
                this.$message.error(`业务数据加载失败: ${error.message}`);
            } finally {
                this.loading = false;
            }
        },
        processChartData(rawData) {
            const dateMap = {};
            const platforms = new Set();
            rawData.forEach((item) => {
                if (!item.business_name) return;
                if (!dateMap[item.date_time]) {
                    dateMap[item.date_time] = {};
                }
                dateMap[item.date_time][item.business_name] = item.total_charged_in_yuan;
                platforms.add(item.business_name);
            });
            const dates = Object.keys(dateMap).sort();
            const series = [];
            const legendData = [];
            platforms.forEach((platform) => {
                const platformData = dates.map((date) => dateMap[date][platform] || 0);
                // console.log(platform)
                series.push({
                    name: platform,
                    type: 'bar',
                    data: platformData,
                    emphasis: {
                        focus: 'series',
                    },
                });
                legendData.push(platform);
            });
            const options = {
                ...this.chartOptions,
                title: {
                    ...this.chartOptions.title,
                    subtext: `统计周期：${this.dateRange[0]} 至 ${this.dateRange[1]}`,
                    top: 0
                },
                legend: {
                    ...this.chartOptions.legend,
                    data: legendData,
                },
                xAxis: {
                    ...this.chartOptions.xAxis,
                    data: dates,
                    center: ['50%', '62%'],
                },
                series: series,
            };
            if (this.myChart) {
                this.myChart.setOption(options, true);
            }
        },
        handleResize() {
            if (this.myChart) {
                this.myChart.resize();
            }
        },
    },
};
</script>

<style scoped>
.chart-container {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 10px;
    background: #fff;
    min-height: 300px;
    box-sizing: border-box;
}

.ant-spin-nested-loading,
.ant-spin-container {
    height: 100%;
}
</style>