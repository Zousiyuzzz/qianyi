<template>
    <div class="chart-container">
        <a-spin :spinning="loading" tip="数据加载中...">
            <div ref="chart" style="width: 100%; height: 50vh;"></div>
        </a-spin>
    </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
    props: {
        dateRange: {
            type: Array,
            default: () => [],
        },
        proRechargeList: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            loading: false,
            chartData: [],
            myChart: null,
            chartOptions: {
                color: ['#52c41a'],
                title: {
                    text: '项目充值',
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
                        const param = params[0];
                        const { name, value } = param;
                        return `${name}<br/>金额：￥${value.toFixed(3)}`;
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
                toolbox: {
                    show: true,
                    feature: {
                        dataView: { show: true, readOnly: false },
                        saveAsImage: { show: true },
                    },
                },
                grid: {
                    left: '6%',
                    right: '5%',
                    bottom: '22%',
                    containLabel: true,
                },
                dataZoom: [
                    {
                        type: 'slider',
                        xAxisIndex: 0,
                        show: true,
                        start: 0,
                        end: 10,
                        height: 20,
                        bottom: 10,
                        textStyle: {
                            fontSize: 12,
                        },
                    },
                    {
                        type: 'inside',
                        xAxisIndex: 0,
                        start: 0,
                        end: 10,
                    },
                ],
                xAxis: {
                    type: 'category',
                    axisLabel: {
                        rotate: 45,
                        fontSize: 12,
                        interval: 'auto',
                        formatter: (value) => (value.length > 8 ? value.slice(0, 8) + '...' : value),
                    },
                    axisTick: {
                        alignWithLabel: true,
                    },
                },
                yAxis: {
                    type: 'value',
                    name: '金额 (￥)',
                    nameTextStyle: {
                        fontSize: 14,
                    },
                    axisLabel: {
                        formatter: '￥{value}',
                        fontSize: 12,
                    },
                },
                series: [
                    {
                        type: 'bar',
                        barMaxWidth: 20,
                        barMinWidth: 5,
                        itemStyle: {
                            borderRadius: [4, 4, 0, 0],
                            borderColor: '#fff',
                            borderWidth: 1,
                        },
                        label: {
                            show: false,
                        },
                        animationDuration: 300,
                    },
                ],
            },
        };
    },
    watch: {
        proRechargeList: {
            handler(newVal) {
                this.processChartData(newVal);
            },
            immediate: true,
            deep: true,
        },
        dateRange: {
            handler(newVal) {
                this.updateChartTitle();
            },
            immediate: true,
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.initChart();
            // Re-process chart data after initialization to ensure chart is updated
            if (this.proRechargeList.length) {
                this.processChartData(this.proRechargeList);
            }
        });
        window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
        if (this.myChart) {
            this.myChart.dispose();
        }
    },
    methods: {
        sumByProject(data) {
            const resultMap = new Map();
            data.forEach((item) => {
                const key = `${item.id}_${item.pro_name}`;
                const existing = resultMap.get(key);
                if (existing) {
                    existing.amount = parseFloat(
                        (existing.amount + item.amount).toFixed(3)
                    );
                } else {
                    resultMap.set(key, {
                        ...item,
                        amount: parseFloat(item.amount.toFixed(3)),
                    });
                }
            });
            return Array.from(resultMap.values());
        },
        processChartData(rawData) {
            this.loading = true;
            this.chartData = this.sumByProject(rawData)
                .sort((a, b) => b.amount - a.amount)
                .map((item) => ({
                    name: item.pro_name,
                    value: item.amount,
                    rawData: item,
                }));

            const dataCount = this.chartData.length;
            const zoomEnd = Math.min(100, (20 / dataCount) * 100);
            this.chartOptions.dataZoom[0].end = zoomEnd;
            this.chartOptions.dataZoom[1].end = zoomEnd;

            this.updateChart();
        },
        initChart() {
            if (!this.$refs.chart) {
                console.warn('Chart ref is not available yet');
                return;
            }
            this.myChart = echarts.init(this.$refs.chart);
            this.myChart.on('click', this.handleChartClick);
        },
        updateChart() {
            if (!this.myChart) {
                this.initChart();
                if (!this.myChart) {
                    console.warn('Chart not initialized, skipping update');
                    this.loading = false;
                    return;
                }
            }

            const options = {
                ...this.chartOptions,
                xAxis: {
                    ...this.chartOptions.xAxis,
                    data: this.chartData.map((item) => item.name),
                },
                series: [
                    {
                        ...this.chartOptions.series[0],
                        data: this.chartData,
                    },
                ],
            };

            this.myChart.setOption(options, { notMerge: true, lazyUpdate: true });
            this.loading = false;
        },
        updateChartTitle() {
            if (!this.myChart) {
                return;
            }
            const subtext =
                this.dateRange.length === 2
                    ? `统计周期：${this.dateRange[0]} 至 ${this.dateRange[1]}`
                    : '';

            this.myChart.setOption({
                title: {
                    ...this.chartOptions.title,
                    subtext,
                },
            });
        },
        handleChartClick(params) {
            const { name, value, data } = params;
            this.$emit('bar-click', {
                name,
                value,
                rawData: data.rawData,
            });
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
    min-height: 400px;
}

.ant-spin-nested-loading,
.ant-spin-container {
    height: 100%;
}
</style>
