<template>
    <div style="width: 100%;">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <span style="margin-right: 8px;">排序字段:</span>
            <a-select v-model="sortKey" style="width: 140px;">
                <a-select-option value="customer_name">客户名称</a-select-option>
                <a-select-option value="total_charged">总消耗</a-select-option>
                <a-select-option value="cash_drain">现金消耗</a-select-option>
                <a-select-option value="revenue">应回款</a-select-option>
                <a-select-option value="payment_money">已回款</a-select-option>
                <a-select-option value="actual_net_profit">实际净利</a-select-option>
                <a-select-option value="estimated_gross_profit">预估毛利</a-select-option>
                <a-select-option value="actual_gross_profit">实际毛利润</a-select-option>
                <a-select-option value="estimated_net_profit">预估净利</a-select-option>
                <a-select-option value="actual_net_profit2">实际净利润</a-select-option>
            </a-select>
            <span style="margin-right: 8px;">排序方式:</span>
            <a-radio-group v-model="sortOrder">
                <a-radio-button value="desc">降序</a-radio-button>
                <a-radio-button value="asc">升序</a-radio-button>
            </a-radio-group>
        </div>
        <div style="margin-bottom: 16px; text-align: right;">
            <a-month-picker v-model="month" placeholder="请选择月份" :value-format="'YYYY-MM'" style="width: 200px;"
                @change="onMonthChange" />
        </div>
        <div style="width: 100%; height: 400px; position: relative;">
            <a-spin :spinning="loading">
                <div ref="chart" style="width: 100%; height: 400px;"></div>
            </a-spin>
        </div>
    </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
    name: 'CompareLineChart',
    props: {
        chartData: {
            type: Array,
            required: true
        },
        chartType: {
            type: String,
            default: 'bar'
        },
        value: {
            type: String,
            default: ''
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            month: this.value,
            sortKey: 'total_charged',
            sortOrder: 'desc',
        }
    },
    watch: {
        chartData: {
            handler() {
                this.initChart();
            },
            deep: true
        },
        chartType() {
            this.initChart();
        },
        value(val) {
            this.month = val;
        },
        month(val) {
            this.$emit('input', val);
            this.$emit('month-change', val);
        },
        sortKey() {
            this.initChart();
        },
        sortOrder() {
            this.initChart();
        }
    },
    mounted() {
        this.initChart();
    },
    methods: {
        getSortedData() {
            let data = [...(this.chartData || [])];
            const key = this.sortKey;
            // 兼容实际净利润字段
            const getValue = (item) => {
                if (key === 'actual_net_profit2') {
                    return Number(item.actual_net_profit) || 0;
                }
                if (key === 'customer_name') {
                    return item.customer_name || '';
                }
                return Number(item[key]) || 0;
            };
            data.sort((a, b) => {
                let valA = getValue(a);
                let valB = getValue(b);
                if (key === 'customer_name') {
                    return this.sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                }
                return this.sortOrder === 'asc' ? valA - valB : valB - valA;
            });
            return data;
        },
        initChart() {
            if (!this.$refs.chart) return;
            const chart = echarts.init(this.$refs.chart);
            const data = this.getSortedData();
            const xData = data.map(i => i.customer_name);
            const to3 = v => (Number(v) || 0).toFixed(3) * 1;
            const totalCharged = data.map(i => to3(i.total_charged));
            const cashDrain = data.map(i => to3(i.cash_drain));
            const revenue = data.map(i => to3(i.revenue));
            const paymentMoney = data.map(i => to3(i.payment_money));
            const actualNetProfit = data.map(i => {
                const revenue = Number(i.revenue) || 0;
                const actual_rebate_amount = Number(i.actual_rebate_amount) || 0;
                const project_cost = Number(i.project_cost) || 0;
                const material_cost = Number(i.material_cost) || 0;
                return (revenue - actual_rebate_amount - project_cost - material_cost).toFixed(3) * 1;
            });
            // 新增利润相关系列
            const estimatedGrossProfit = data.map(i => Number(i.estimated_gross_profit) || 0);
            const actualGrossProfit = data.map(i => Number(i.actual_gross_profit) || 0);
            const estimatedNetProfit = data.map(i => Number(i.estimated_net_profit) || 0);
            const actualNetProfit2 = data.map(i => Number(i.actual_net_profit) || 0);

            // --- start: 计算右侧Y轴的动态范围 ---
            const rightAxisData = paymentMoney.concat(actualNetProfit);
            let yAxis2Options = {};

            if (rightAxisData.length > 0) {
                let minVal = Math.min(...rightAxisData);
                let maxVal = Math.max(...rightAxisData);

                // 确保0在范围内，如果所有值都为正，则从0开始
                if (minVal > 0) {
                    minVal = 0;
                }

                if (minVal === maxVal) {
                    const delta = Math.abs(minVal) * 0.2 || 10;
                    minVal -= delta;
                    maxVal += delta;
                } else {
                    const padding = (maxVal - minVal) * 0.1;
                    // 只在maxVal上加padding，避免minVal低于实际最小值太多
                    if (maxVal !== 0) {
                        maxVal += padding;
                    }
                    // 如果minVal是负数，也给它一点padding
                    if (minVal < 0) {
                        minVal -= padding;
                    }
                }

                if (minVal === maxVal) {
                    maxVal += 1;
                }

                yAxis2Options = {
                    min: parseFloat(minVal.toFixed(2)),
                    max: parseFloat(maxVal.toFixed(2)),
                };
            }
            // --- end: 计算右侧Y轴的动态范围 ---

            let option = {};
            if (this.chartType === 'bar' || this.chartType === 'line') {
                option = {
                    tooltip: { trigger: 'axis' },
                    // '应回款', '已回款',
                    legend: { data: ['总消耗', '现金消耗', '实际净利', '预估毛利', '实际毛利润', '预估净利', '实际净利'] },
                    xAxis: { type: 'category', data: xData },
                    yAxis: [
                        {
                            type: 'value',
                            name: '金额',
                            position: 'left',
                            axisLine: { show: true },
                            axisLabel: { formatter: '{value}' },
                            min: 0,
                        },
                        {
                            type: 'value',
                            name: '已回款/净利',
                            position: 'right',
                            axisLine: { show: true },
                            axisLabel: { formatter: '{value}' },
                            ...yAxis2Options
                        }
                    ],
                    series: [
                        {
                            name: '总消耗',
                            type: this.chartType,
                            data: totalCharged,
                            yAxisIndex: 0,
                            symbol: this.chartType === 'line' ? 'none' : undefined,
                            smooth: this.chartType === 'line' ? true : undefined,
                            lineStyle: this.chartType === 'line' ? {
                                type: this.sortKey === 'total_charged' ? 'solid' : 'dashed'
                            } : undefined
                        },
                        {
                            name: '现金消耗',
                            type: this.chartType,
                            data: cashDrain,
                            yAxisIndex: 0,
                            symbol: this.chartType === 'line' ? 'none' : undefined,
                            smooth: this.chartType === 'line' ? true : undefined,
                            lineStyle: this.chartType === 'line' ? {
                                type: this.sortKey === 'cash_drain' ? 'solid' : 'dashed'
                            } : undefined
                        },
                        // { name: '应回款', type: this.chartType, data: revenue, yAxisIndex: 0 },
                        // { name: '已回款', type: this.chartType, data: paymentMoney, yAxisIndex: 1 },
                        {
                            name: '实际净利',
                            type: this.chartType,
                            data: actualNetProfit,
                            yAxisIndex: 1,
                            symbol: this.chartType === 'line' ? 'none' : undefined,
                            smooth: this.chartType === 'line' ? true : undefined,
                            lineStyle: this.chartType === 'line' ? {
                                type: this.sortKey === 'actual_net_profit' ? 'solid' : 'dashed'
                            } : undefined
                        },
                        {
                            name: '预估毛利',
                            type: this.chartType,
                            data: estimatedGrossProfit,
                            yAxisIndex: 1,
                            symbol: this.chartType === 'line' ? 'none' : undefined,
                            smooth: this.chartType === 'line' ? true : undefined,
                            lineStyle: this.chartType === 'line' ? {
                                type: this.sortKey === 'estimated_gross_profit' ? 'solid' : 'dashed'
                            } : undefined
                        },
                        {
                            name: '实际毛利',
                            type: this.chartType,
                            data: actualGrossProfit,
                            yAxisIndex: 1,
                            symbol: this.chartType === 'line' ? 'none' : undefined,
                            smooth: this.chartType === 'line' ? true : undefined,
                            lineStyle: this.chartType === 'line' ? {
                                type: this.sortKey === 'actual_gross_profit' ? 'solid' : 'dashed'
                            } : undefined
                        },
                        {
                            name: '预估净利',
                            type: this.chartType,
                            data: estimatedNetProfit,
                            yAxisIndex: 1,
                            symbol: this.chartType === 'line' ? 'none' : undefined,
                            smooth: this.chartType === 'line' ? true : undefined,
                            lineStyle: this.chartType === 'line' ? {
                                type: this.sortKey === 'estimated_net_profit' ? 'solid' : 'dashed'
                            } : undefined
                        },
                        {
                            name: '实际净利',
                            type: this.chartType,
                            data: actualNetProfit2,
                            yAxisIndex: 1,
                            symbol: this.chartType === 'line' ? 'none' : undefined,
                            smooth: this.chartType === 'line' ? true : undefined,
                            lineStyle: this.chartType === 'line' ? {
                                type: this.sortKey === 'actual_net_profit2' ? 'solid' : 'dashed'
                            } : undefined
                        },
                    ],
                    dataZoom: [
                        {
                            type: 'slider',
                            show: true,
                            xAxisIndex: 0,
                            start: 0,
                            end: 100
                        },
                        {
                            type: 'inside',
                            xAxisIndex: 0,
                            start: 0,
                            end: 100
                        }
                    ]
                }
            } else if (this.chartType === 'pie') {
                option = {
                    tooltip: { trigger: 'item' },
                    legend: { orient: 'vertical', left: 'left' },
                    series: [
                        {
                            name: '应回款占比',
                            type: 'pie',
                            radius: '60%',
                            data: data.map(i => ({ name: i.customer_name, value: to3(i.revenue) })),
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                }
            }
            chart.clear();
            chart.setOption(option);
        },
        onMonthChange(val) {
            this.month = val;
        }
    }
};
</script>