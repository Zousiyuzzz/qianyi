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
            consumeListByBusiness: [],
            chartList: [],
            myChart: null,
            resizeObserver: null,
            globalthisBusinessIds: '',
            m: {
                DY: '字节',
                KS: '快手',
                GDT: '腾讯',
                XHS: '小红书',
                CJHC: '超级汇川',
            },
            chartOptions: {
                color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'],
                title: {
                    text: '渠道消耗占比',
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
                    trigger: 'item',
                    formatter: (params) => {
                        return `${params.name}<br/>金额：￥${params.value.toFixed(3)}<br/>占比：${params.percent}%`;
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
                    orient: 'vertical',
                    left: 'left',
                    top: 'middle',
                    itemWidth: 14,
                    itemHeight: 8,
                    textStyle: {
                        color: '#666',
                        fontSize: 12,
                    },
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: { show: true, readOnly: false },
                        saveAsImage: { show: true },
                    },
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['30%', '70%'],
                        center: ['50%', '55%'],
                        avoidLabelOverlap: true,
                        itemStyle: {
                            borderRadius: 6,
                            borderColor: '#fff',
                            borderWidth: 2,
                        },
                        label: {
                            show: true,
                            formatter: '{b|{b}}\n{hr|}\n{d|{d}%}',
                            rich: {
                                b: {
                                    fontSize: 14,
                                    lineHeight: 22,
                                },
                                hr: {
                                    borderColor: '#ddd',
                                    width: '100%',
                                    borderWidth: 1,
                                    height: 0,
                                },
                                d: {
                                    fontSize: 16,
                                    color: '#999',
                                    padding: [5, 0],
                                },
                            },
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: 18,
                                fontWeight: 'bold',
                            },
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.3)',
                            },
                        },
                    },
                ],
            },
        };
    },
    watch: {
        dateRange: {
            handler(newVal) {
                if (newVal && newVal.length === 2) {
                    this.getBusinessTotal();
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
                this.getBusinessTotal();
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
                this.myChart.on('click', this.handleChartClick);
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
        async getBusinessTotal() {
            try {
                if (!this.dateRange || this.dateRange.length !== 2) return;
                this.loading = true;
                const res = await getAction('/agentdata/getBusinessTotal', {
                    businessIds: this.globalthisBusinessIds.split(','),
                    beginDate: this.dateRange[0],
                    endDate: this.dateRange[1],
                }, 'GET');
                if (!res.success) {
                    throw new Error(res.message);
                }
                this.chartList = res.result.map((item) => ({
                    ...item,
                    name: item.business_name,
                    value: item.total_charged_in_yuan,
                }));
                this.updateChart();
            } catch (error) {
                this.$message.error(`业务数据加载失败: ${error.message}`);
            } finally {
                this.loading = false;
            }
        },
        updateChart() {
            if (!this.myChart) {
                this.initChart();
                if (!this.myChart) {
                    console.warn('Chart not initialized, skipping update');
                    return;
                }
            }
            const options = {
                ...this.chartOptions,
                title: {
                    ...this.chartOptions.title,
                    subtext: `统计周期：${this.dateRange[0]} 至 ${this.dateRange[1]}`,
                    top: 0,
                },
                series: [
                    {
                        ...this.chartOptions.series[0],
                        data: this.chartList,
                        center: ['50%', '62%'],
                    },
                ],
            };
            this.myChart.setOption(options, true);
        },
        handleChartClick(params) {
            this.$emit('sector-click', {
                name: params.name,
                value: params.value,
                rawData: params.data,
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
    min-height: 300px;
    box-sizing: border-box;
}

.ant-spin-nested-loading,
.ant-spin-container {
    height: 100%;
}
</style>