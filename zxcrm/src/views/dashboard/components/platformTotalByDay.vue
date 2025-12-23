<template>
    <div class="chart-container">
        <a-spin :spinning="loading" tip="数据加载中...">
            <div ref="chart" style="width: 100%; height: 40vh;"></div>
        </a-spin>
    </div>
</template>

<script>
import { getAction } from '@/api/manage';
import * as echarts from 'echarts';

export default {
    name: 'PlatformTotalByDay',
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
        // 新增props用于接收充值和退款数据
        rechargeData: {
            type: Object,
            default: () => ({})
        },
        refundData: {
            type: Object,
            default: () => ({})
        },
        // 新增净收入数据
        netData: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            m: {
                DY: '字节',
                KS: '快手',
                GDT: '腾讯',
                XHS: '小红书',
                CJHC: '超级汇川',
            },
            loading: true,
            myChart: null,
            resizeObserver: null,
            chartOptions: {
                color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'],
                title: {
                    text: '数据对比图表',
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
                    bottom: 30,
                    textStyle: {
                        fontSize: 12,
                    },
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: { show: true, readOnly: false },
                        magicType: { show: true, type: ['bar', 'line', 'stack'] },
                        restore: { show: true },
                        saveAsImage: { show: true },
                    },
                },
                grid: {
                    left: '6%',
                    right: '5%',
                    top: '20%',
                    bottom: '25%',
                    containLabel: true,
                },
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
                    data: [],
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        formatter: '￥{value}',
                        fontSize: 12,
                        margin: 10,
                    },
                    name: '金额 (￥)',
                    nameTextStyle: {
                        fontSize: 12,
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            type: 'dashed',
                            color: '#e0e0e0'
                        }
                    }
                },
                dataZoom: [
                    {
                        type: 'slider',
                        xAxisIndex: 0,
                        show: true,
                        start: 0,
                        end: 10,
                        height: 20,
                        bottom: 5,
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
            immediate: true,
            deep: true,
        },
        // 监听充值和退款数据变化
        rechargeData: {
            handler() {
                this.updateChartWithSummaryData();
            },
            deep: true,
        },
        refundData: {
            handler() {
                this.updateChartWithSummaryData();
            },
            deep: true,
        },
        // 监听净收入数据变化
        netData: {
            handler() {
                this.updateChartWithSummaryData();
            },
            deep: true,
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
                const res = await getAction('/agentdata/iconData', {
                    beginDate: this.dateRange[0],
                    endDate: this.dateRange[1],
                }, 'GET');
                if (!res.success) {
                    throw new Error(res.message);
                }
                this.processChartData(Array.isArray(res.result) ? res.result : []);
            } catch (error) {
                this.$message.error(`业务数据加载失败: ${error.message}`);
            }
        },
        processChartData(rawData) {
            // 收集日期与平台
            const dates = rawData.map(r => r.date_time).filter(Boolean).sort();
            const prefixToCode = { ks: 'KS', dy: 'DY', gdt: 'GDT', xhs: 'XHS', cjhc: 'CJHC' };
            const codesOrder = ['KS', 'DY', 'GDT', 'XHS', 'CJHC'];
            const legendData = [];
            const series = [];

            // 添加平台数据
            codesOrder.forEach(code => {
                // 判断该平台是否在数据中出现
                const lowerPrefix = Object.keys(prefixToCode).find(k => prefixToCode[k] === code);
                const keyName = `${lowerPrefix}_total_charged`;
                const hasAny = rawData.some(r => r[keyName] != null);
                if (!hasAny) return;
                legendData.push(this.m[code] || code);
                const dataArr = dates.map(d => {
                    const row = rawData.find(r => r.date_time === d) || {};
                    return Number(row[keyName]) || 0;
                });
                series.push({
                    name: this.m[code] || code,
                    type: 'bar',
                    data: dataArr,
                    emphasis: { focus: 'series' },
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
                });
            });

            // 添加充值和退款数据
            if (this.rechargeData && Object.keys(this.rechargeData).length > 0) {
                legendData.push('充值金额');
                series.push({
                    name: '充值金额',
                    type: 'line',
                    data: dates.map(() => this.rechargeData.amount || 0),
                    emphasis: { focus: 'series' },
                    itemStyle: {
                        color: '#52c41a',
                    },
                    lineStyle: {
                        color: '#52c41a',
                        width: 3,
                    },
                    symbol: 'circle',
                    symbolSize: 8,
                    label: {
                        show: false,
                    },
                    animationDuration: 300,
                });
            }

            if (this.refundData && Object.keys(this.refundData).length > 0) {
                legendData.push('退款金额');
                series.push({
                    name: '退款金额',
                    type: 'line',
                    data: dates.map(() => this.refundData.amount || 0),
                    emphasis: { focus: 'series' },
                    itemStyle: {
                        color: '#ff4d4f',
                    },
                    lineStyle: {
                        color: '#ff4d4f',
                        width: 3,
                    },
                    symbol: 'circle',
                    symbolSize: 8,
                    label: {
                        show: false,
                    },
                    animationDuration: 300,
                });
            }

            // 添加净收入柱状图
            if (this.netData && Object.keys(this.netData).length > 0) {
                legendData.push('净收入');
                series.push({
                    name: '净收入',
                    type: 'bar',
                    data: dates.map(() => this.netData.amount || 0),
                    emphasis: { focus: 'series' },
                    barMaxWidth: 30,
                    barMinWidth: 8,
                    itemStyle: {
                        borderRadius: [4, 4, 0, 0],
                        borderColor: '#fff',
                        borderWidth: 1,
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#1890ff' },
                            { offset: 1, color: '#40a9ff' }
                        ])
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: (params) => {
                            return params.value > 0 ? `+${params.value.toLocaleString()}` : params.value.toLocaleString();
                        },
                        fontSize: 10,
                        color: '#666'
                    },
                    animationDuration: 300,
                });
            }

            const options = {
                ...this.chartOptions,
                title: {
                    ...this.chartOptions.title,
                    subtext: `统计周期：${this.dateRange[0]} 至 ${this.dateRange[1]}`,
                },
                legend: {
                    ...this.chartOptions.legend,
                    data: legendData,
                },
                xAxis: {
                    ...this.chartOptions.xAxis,
                    data: dates,
                },
                series,
            };
            if (this.myChart) {
                this.myChart.setOption(options, true);
            }
            this.loading = false;
        },
        handleResize() {
            if (this.myChart) {
                this.myChart.resize();
            }
        },
        refreshData() {
            this.getData();
        },
        updateChartWithSummaryData() {
            // 如果图表已经初始化，更新图表数据
            if (this.myChart) {
                this.getData();
            }
        }
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
    min-height: 350px;
    box-sizing: border-box;
    overflow: hidden;
}

.ant-spin-nested-loading,
.ant-spin-container {
    height: 100%;
}
</style>