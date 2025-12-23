<template>
    <div class="chart-container">
        <!--媒体渠道KS分类-->
        <a-spin :spinning="loading" tip="数据加载中...">
            <div ref="chart" style="width: 100%; height: 36vh;"></div>
        </a-spin>
    </div>
</template>

<script>
import { getAction } from '@/api/manage'
import * as echarts from 'echarts'
import store from '@/store'

export default {
    name: 'BusinessTotalChart',
    props: {
        dateRange: {
            type: Array,
            default: () => [],
            validator: value => value.length === 0 || value.length === 2
        },
        countType: {
            type: String,
            default: 'day'
        },
        businessIds: {
            handler(newVal) {
                this.getBusinessTotal()
            },
            immediate: true,
        }
    },
    data() {
        return {
            loading: true,
            businessidList: [],
            consumeListByBusiness: [],
            chartList: [],
            myChart: null,
            chartOptions: {
                color: [
                    '#5470c6', '#91cc75', '#fac858', '#ee6666',
                    '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
                ],
                title: {
                    text: '端口消耗占比',
                    subtext: '',
                    left: 'center',
                    textStyle: {
                        fontSize: 18,
                        color: '#333'
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: params => {
                        return `${params.name}<br/>
              金额：￥${params.value}<br/>
              占比：${params.percent}%`
                    },
                    backgroundColor: 'rgba(50,50,50,0.95)',
                    borderColor: '#333',
                    textStyle: {
                        color: '#fff'
                    }
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    top: 'middle',
                    itemWidth: 14,
                    itemHeight: 8,
                    textStyle: {
                        color: '#666'
                    }
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
                            borderWidth: 2
                        },
                        label: {
                            show: true,
                            formatter: '{b|{b}}\n{hr|}\n{d|{d}%}',
                            rich: {
                                b: {
                                    fontSize: 12,
                                    lineHeight: 20
                                },
                                hr: {
                                    borderColor: '#ddd',
                                    width: '100%',
                                    borderWidth: 1,
                                    height: 0
                                },
                                d: {
                                    fontSize: 14,
                                    color: '#999',
                                    padding: [5, 0]
                                }
                            }
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: 16,
                                fontWeight: 'bold'
                            },
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.3)'
                            }
                        }
                    }
                ]
            }
        }
    },
    watch: {
        dateRange: {
            handler(newVal) {
                if (newVal && newVal.length === 2) {
                    this.getBusinessTotal()
                }
            },
            immediate: true,
            deep: true
        }
    },
    mounted() {
        this.initChart()
        window.addEventListener('resize', this.handleResize)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize)
        if (this.myChart) {
            this.myChart.dispose()
            this.myChart = null
        }
    },
    methods: {
        initChart() {
            if (!this.$refs.chart) return

            if (this.myChart) {
                this.myChart.dispose()
            }

            this.myChart = echarts.init(this.$refs.chart)
            this.myChart.on('click', this.handleChartClick)
        },

        async getData() {
            try {
                this.loading = true
                const userRes = await getAction(
                    '/sys/user/queryById',
                    { id: store.getters.userInfo.id },
                    'GET'
                )

                if (!userRes.success) {
                    throw new Error(userRes.message)
                }

                this.businessidList = userRes.result.businessIds
                    ? userRes.result.businessIds.split(',')
                    : []


            } catch (error) {
                this.$message.error(`数据加载失败: ${error.message}`)
            } finally {
                this.loading = false
            }
        },

        async getBusinessTotal() {
            try {
                if (!this.dateRange || this.dateRange.length !== 2) return

                const businessRes = await getAction(
                    '/agentdata/getTotalByPlatform',
                    {
                        businessIds: this.businessIds.split(','),
                        // businessIds: this.businessidList,
                        beginDate: this.dateRange[0],
                        endDate: this.dateRange[1]
                    },
                    'GET'
                )

                if (!businessRes.success) {
                    throw new Error(businessRes.message)
                }

                this.chartList = businessRes.result.map(item => ({
                    ...item,
                    name: item.business_name,
                    value: Number(item.total_charged_in_yuan).toFixed(2)
                }))

                this.updateChart()
            } catch (error) {
                this.$message.error(`业务数据加载失败: ${error.message}`)
            }
        },

        updateChart() {
            if (!this.myChart) return

            const options = {
                ...this.chartOptions,
                title: {
                    ...this.chartOptions.title,
                    subtext: `统计周期：${this.dateRange[0]} 至 ${this.dateRange[1]}`
                },
                series: [
                    {
                        ...this.chartOptions.series[0],
                        data: this.chartList
                    }
                ]
            }

            this.myChart.setOption(options, true)
            this.loading = false
        },

        handleChartClick(params) {
            this.$emit('sector-click', {
                name: params.name,
                value: params.value,
                rawData: params.data
            })
        },

        handleResize() {
            if (this.myChart) {
                this.myChart.resize()
            }
        }
    }
}
</script>

<style scoped>
.chart-container {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 10px;
    background: #fff;

    min-height: 300px;
}

/* 优化加载动画位置 */
.ant-spin-nested-loading {
    height: 100%;
}

.ant-spin-container {
    height: 100%;
}
</style>