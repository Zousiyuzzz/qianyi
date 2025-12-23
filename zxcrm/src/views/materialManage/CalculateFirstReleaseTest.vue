<template>
    <div class="test-container">
        <h1>首发素材消耗计算测试</h1>

        <div class="summary-section">
            <a-card title="汇总信息" :bordered="false">
                <p><strong>汇总分组数:</strong> {{ results.length }}</p>
                <p><strong>明细数据条数:</strong> {{ totalItemCount }}</p>
                <p><strong>总业绩消耗:</strong> {{ totalPerformanceCost.toFixed(2) }}</p>
                <p><strong>总返点金额:</strong> {{ totalRebateAmount.toFixed(4) }}</p>
            </a-card>
        </div>

        <div class="table-section">
            <a-table :columns="columns" :dataSource="results" :pagination="{ pageSize: 50 }" bordered size="small"
                :scroll="{ x: 'max-content' }">
                <template slot="metric" slot-scope="text">
                    {{ text !== null ? text.toFixed(4) : 'NULL' }}
                </template>
                <template slot="target" slot-scope="text">
                    {{ text !== null ? text.toFixed(4) : 'NULL' }}
                </template>
                <template slot="rebateRate" slot-scope="text">
                    {{ text !== null ? text.toFixed(4) : 'NULL' }}
                </template>
                <template slot="rebateRateMax" slot-scope="text">
                    {{ text !== null ? text.toFixed(4) : 'NULL' }}
                </template>
                <template slot="rebateRateMin" slot-scope="text">
                    {{ text !== null ? text.toFixed(4) : 'NULL' }}
                </template>
                <template slot="totalPerformanceCost" slot-scope="text">
                    {{ text.toFixed(2) }}
                </template>
                <template slot="totalRebateAmount" slot-scope="text">
                    {{ text.toFixed(4) }}
                </template>
            </a-table>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CalculateFirstReleaseTest',
    data() {
        return {
            // 返点上下限（暂定）
            REBATE_MIN: 0,
            REBATE_MAX: 0.01,
            results: [],
            columns: [
                { title: '二级行业', dataIndex: 'rebateCalcSecondIndustryName', key: 'rebateCalcSecondIndustryName', width: 150 },
                { title: '运营标签', dataIndex: 'operatorTag', key: 'operatorTag', width: 100 },
                { title: '[首发消耗占比]指标值', dataIndex: 'metric', key: 'metric', width: 150, scopedSlots: { customRender: 'metric' } },
                { title: '[首发消耗占比]目标值', dataIndex: 'target', key: 'target', width: 150, scopedSlots: { customRender: 'target' } },
                { title: '[首发消耗占比]返点比例', dataIndex: 'rebateRate', key: 'rebateRate', width: 150, scopedSlots: { customRender: 'rebateRate' } },
                { title: '[首发消耗占比]返点比例上限', dataIndex: 'rebateRateMax', key: 'rebateRateMax', width: 150, scopedSlots: { customRender: 'rebateRateMax' } },
                { title: '[首发消耗占比]返点比例下限', dataIndex: 'rebateRateMin', key: 'rebateRateMin', width: 150, scopedSlots: { customRender: 'rebateRateMin' } },
                { title: '业绩消耗汇总', dataIndex: 'totalPerformanceCost', key: 'totalPerformanceCost', width: 120, scopedSlots: { customRender: 'totalPerformanceCost' } },
                { title: '返点金额汇总', dataIndex: 'totalRebateAmount', key: 'totalRebateAmount', width: 120, scopedSlots: { customRender: 'totalRebateAmount' } },
                { title: '明细条数', dataIndex: 'itemCount', key: 'itemCount', width: 100 }
            ]
        }
    },
    computed: {
        totalItemCount() {
            return this.results.reduce((sum, item) => sum + (item.itemCount || 0), 0);
        },
        totalPerformanceCost() {
            return this.results.reduce((sum, item) => sum + (item.totalPerformanceCost || 0), 0);
        },
        totalRebateAmount() {
            return this.results.reduce((sum, item) => sum + (item.totalRebateAmount || 0), 0);
        }
    },
    mounted() {
        this.loadDataAndCalculate();
    },
    methods: {
        // 从 d.js 加载数据
        loadDataAndCalculate() {
            try {
                // 从 window.materialData 获取数据
                const materialData = (window.materialData && window.materialData.result) || [];

                if (materialData.length === 0) {
                    this.$message.warning('未找到测试数据，请确保 d.js 文件已加载');
                    return;
                }

                // 执行计算
                this.results = this.processData(materialData);
            } catch (error) {
                this.$message.error('计算失败: ' + error.message);
                console.error('计算错误:', error);
            }
        },
        // 分组函数
        getGroupKey(item) {
            return [
                item.operatorTag || '',
                item.rebateCalcSettlementStatsType || '',
                item.rebateCalcSecondIndustryName || '',
                item.rebateCalcExternalIndustryCategory || '',
                item.agentGroupName || ''
            ].join('|');
        },
        // 计算单条数据的返点比例
        calculateRebateRate(item, groupMetric, groupTarget) {
            const metric = item.firstEffectiveMaterialCostRateMetric || 0;
            const target = item.firstEffectiveMaterialCostRateTargetValue || 0;
            const invalidReason = item.invalidFirstEffectiveMaterialCostReason || '';
            const secondIndustry = item.rebateCalcSecondIndustryName || '';

            // 使用组的指标和目标（如果组有值）
            const finalMetric = groupMetric !== null && groupMetric !== undefined ? groupMetric : metric;
            const finalTarget = groupTarget !== null && groupTarget !== undefined ? groupTarget : target;

            // 优先级1：剔除汽车厂商
            if (secondIndustry === '汽车厂商') {
                return { rebateRate: 0, reason: '剔除-汽车厂商' };
            }

            // 优先级2：包含"直播"二字，取返点上限
            if (invalidReason && invalidReason.includes('直播')) {
                return { rebateRate: this.REBATE_MAX, reason: '直播类型-取上限' };
            }

            // 优先级3：指标和目标都为0
            if (finalMetric === 0 && finalTarget === 0) {
                return { rebateRate: 0, reason: '指标和目标都为0' };
            }

            // 优先级4：指标 >= 目标，取返点上限
            if (finalMetric >= finalTarget && finalTarget > 0) {
                return { rebateRate: this.REBATE_MAX, reason: `指标(${finalMetric}) >= 目标(${finalTarget})` };
            }

            // 优先级5：指标 < 目标，按公式计算
            if (finalMetric < finalTarget && finalTarget > 0) {
                const rebateRate = this.REBATE_MIN + (this.REBATE_MAX - this.REBATE_MIN) * (finalMetric / finalTarget);
                return { rebateRate, reason: `指标(${finalMetric}) < 目标(${finalTarget})，按公式计算` };
            }

            // 默认情况
            return { rebateRate: 0, reason: '未知情况' };
        },
        // 处理数据
        processData(data) {
            // 第一步：按政策粒度分组，计算每条数据的返点比例
            const policyGroups = {};
            const itemsWithRebate = [];

            // 按政策粒度分组
            data.forEach(item => {
                const key = this.getGroupKey(item);
                if (!policyGroups[key]) {
                    policyGroups[key] = [];
                }
                policyGroups[key].push(item);
            });

            // 对每组数据进行处理，计算返点比例
            Object.keys(policyGroups).forEach(groupKey => {
                const groupItems = policyGroups[groupKey];

                // 获取组的指标和目标值（取非0值，应该都一样）
                let groupMetric = null;
                let groupTarget = null;

                groupItems.forEach(item => {
                    const metric = item.firstEffectiveMaterialCostRateMetric || 0;
                    const target = item.firstEffectiveMaterialCostRateTargetValue || 0;

                    if (metric > 0 && groupMetric === null) {
                        groupMetric = metric;
                    }
                    if (target > 0 && groupTarget === null) {
                        groupTarget = target;
                    }
                });

                // 如果组内没有非0值，使用第一个的指标和目标
                if (groupMetric === null && groupItems.length > 0) {
                    groupMetric = groupItems[0].firstEffectiveMaterialCostRateMetric || 0;
                }
                if (groupTarget === null && groupItems.length > 0) {
                    groupTarget = groupItems[0].firstEffectiveMaterialCostRateTargetValue || 0;
                }

                // 处理组内每条数据，计算返点比例
                groupItems.forEach(item => {
                    const rebateInfo = this.calculateRebateRate(item, groupMetric, groupTarget);
                    const performanceCost = item.performanceCost || 0;
                    const rebateAmount = rebateInfo.rebateRate * performanceCost;

                    itemsWithRebate.push({
                        ...item,
                        rebateRate: rebateInfo.rebateRate,
                        rebateAmount: rebateAmount,
                        groupMetric: groupMetric,
                        groupTarget: groupTarget
                    });
                });
            });

            // 第二步：按二级行业+运营标签汇总
            const statGroups = {};

            itemsWithRebate.forEach(item => {
                // 按二级行业+运营标签分组
                const statKey = [
                    item.rebateCalcSecondIndustryName || '',
                    item.operatorTag || ''
                ].join('|');

                if (!statGroups[statKey]) {
                    statGroups[statKey] = {
                        rebateCalcSecondIndustryName: item.rebateCalcSecondIndustryName,
                        operatorTag: item.operatorTag,
                        items: [],
                        totalRebateAmount: 0,
                        totalPerformanceCost: 0,
                        metrics: [],
                        targets: []
                    };
                }

                statGroups[statKey].items.push(item);
                statGroups[statKey].totalRebateAmount += item.rebateAmount;
                statGroups[statKey].totalPerformanceCost += (item.performanceCost || 0);

                // 收集指标和目标值
                if (item.groupMetric !== null && item.groupMetric !== undefined) {
                    statGroups[statKey].metrics.push(item.groupMetric);
                }
                if (item.groupTarget !== null && item.groupTarget !== undefined) {
                    statGroups[statKey].targets.push(item.groupTarget);
                }
            });

            // 生成汇总结果
            const result = [];
            Object.keys(statGroups).forEach(key => {
                const group = statGroups[key];

                // 确定组的指标值和目标值（取最常见的非0值）
                let finalMetric = null;
                let finalTarget = null;

                // 统计指标值出现频率
                const metricCounts = {};
                group.metrics.forEach(m => {
                    if (m > 0) {
                        metricCounts[m] = (metricCounts[m] || 0) + 1;
                    }
                });
                if (Object.keys(metricCounts).length > 0) {
                    finalMetric = parseFloat(Object.keys(metricCounts).reduce((a, b) =>
                        metricCounts[a] > metricCounts[b] ? a : b
                    ));
                }

                // 统计目标值出现频率
                const targetCounts = {};
                group.targets.forEach(t => {
                    if (t > 0) {
                        targetCounts[t] = (targetCounts[t] || 0) + 1;
                    }
                });
                if (Object.keys(targetCounts).length > 0) {
                    finalTarget = parseFloat(Object.keys(targetCounts).reduce((a, b) =>
                        targetCounts[a] > targetCounts[b] ? a : b
                    ));
                }

                // 计算返点比例
                let rebateRate = null;
                if (group.rebateCalcSecondIndustryName === '汽车厂商') {
                    rebateRate = 0; // 剔除
                } else if (finalMetric !== null && finalTarget !== null) {
                    if (finalMetric >= finalTarget && finalTarget > 0) {
                        rebateRate = this.REBATE_MAX;
                    } else if (finalMetric < finalTarget && finalTarget > 0) {
                        rebateRate = this.REBATE_MIN + (this.REBATE_MAX - this.REBATE_MIN) * (finalMetric / finalTarget);
                    } else if (finalMetric === 0 && finalTarget === 0) {
                        rebateRate = 0;
                    }
                }

                result.push({
                    rebateCalcSecondIndustryName: group.rebateCalcSecondIndustryName || 'NULL',
                    operatorTag: group.operatorTag || 'NULL',
                    metric: finalMetric,
                    target: finalTarget,
                    rebateRate: rebateRate,
                    rebateRateMax: this.REBATE_MAX,
                    rebateRateMin: this.REBATE_MIN,
                    totalRebateAmount: group.totalRebateAmount,
                    totalPerformanceCost: group.totalPerformanceCost,
                    itemCount: group.items.length
                });
            });

            return result;
        }
    }
}
</script>

<style scoped>
.test-container {
    padding: 24px;
    background: #f5f5f5;
    min-height: 100vh;
}

h1 {
    margin-bottom: 24px;
    color: #272E3B;
}

.summary-section {
    margin-bottom: 24px;
}

.table-section {
    background: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
