// 首发素材消耗计算脚本
// 用于验证计算逻辑

const data = require('./d');

// 返点上下限（暂定）
const REBATE_MIN = 0;
const REBATE_MAX = 0.01;

// 第一步分组：用于计算返点比例（政策粒度）
function getPolicyGroupKey(item) {
    return [
        item.operatorTag,
        item.rebateCalcSettlementStatsType,
        item.rebateCalcSecondIndustryName,
        item.rebateCalcExternalIndustryCategory,
        item.agentGroupName
    ].join('|');
}

// 第二步分组：用于最终统计维度
function getStatGroupKey(item) {
    // 从statPeriod解析季度和月份，例如"2025-05" -> 季度2, 月份5
    const statPeriod = item.statPeriod || '';
    let quarter = null;
    let month = null;
    if (statPeriod) {
        const parts = statPeriod.split('-');
        if (parts.length === 2) {
            const year = parseInt(parts[0]);
            const monthNum = parseInt(parts[1]);
            month = monthNum;
            // 计算季度：1-3月=Q1, 4-6月=Q2, 7-9月=Q3, 10-12月=Q4
            quarter = Math.ceil(monthNum / 3);
        }
    }

    // 获取季度返点核算标签
    // 根据appKey、rebateCalcExternalIndustryCategory、operatorTag组合生成
    let rebateCalcTypeShow = item.rebateCalcTypeShow || null;

    if (!rebateCalcTypeShow) {
        const parts = [];

        // appKey: "LOCAL" -> "本地推", "AD" -> 不显示
        if (item.appKey === 'LOCAL') {
            parts.push('本地推');
        }

        // rebateCalcExternalIndustryCategory: "竞价二类" -> "竞价二类"
        if (item.rebateCalcExternalIndustryCategory) {
            parts.push(item.rebateCalcExternalIndustryCategory);
        }

        // operatorTag: "ZIYUNYING" -> "自运营", "ZOULIANG" -> "走量", "SHOULIANG" -> "收量"
        const operatorTagMap = {
            'ZIYUNYING': '自运营',
            'ZOULIANG': '走量',
            'SHOULIANG': '收量'
        };
        if (item.operatorTag && operatorTagMap[item.operatorTag]) {
            parts.push(operatorTagMap[item.operatorTag]);
        }

        if (parts.length > 0) {
            rebateCalcTypeShow = parts.join('-');
        }

        // 如果是汽车厂商，标记为"剔除"
        if (item.rebateCalcSecondIndustryName === '汽车厂商') {
            rebateCalcTypeShow = '剔除';
        }
    }

    return [
        quarter,
        month,
        item.agentGroupName,
        item.agentGroupName, // 代理商名称，这里假设和集团名称一样
        item.rebateCalcPolicyType,
        item.rebateCalcSettlementStatsType,
        item.rebateCalcSecondIndustryName,
        item.operatorTag,
        rebateCalcTypeShow
    ].join('|');
}

// 计算单条数据的返点比例
function calculateRebateRate(item, groupMetric, groupTarget) {
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
    if (invalidReason.includes('直播')) {
        return { rebateRate: REBATE_MAX, reason: '直播类型-取上限' };
    }

    // 优先级3：指标和目标都为0
    if (finalMetric === 0 && finalTarget === 0) {
        return { rebateRate: 0, reason: '指标和目标都为0' };
    }

    // 优先级4：指标 >= 目标，取返点上限
    if (finalMetric >= finalTarget && finalTarget > 0) {
        return { rebateRate: REBATE_MAX, reason: `指标(${finalMetric}) >= 目标(${finalTarget})` };
    }

    // 优先级5：指标 < 目标，按公式计算
    if (finalMetric < finalTarget && finalTarget > 0) {
        const rebateRate = REBATE_MIN + (REBATE_MAX - REBATE_MIN) * (finalMetric / finalTarget);
        return { rebateRate, reason: `指标(${finalMetric}) < 目标(${finalTarget})，按公式计算` };
    }

    // 默认情况
    return { rebateRate: 0, reason: '未知情况' };
}

// 处理数据
function processData() {
    console.log(`开始处理数据，总数据条数: ${data.result.length}`);

    // 第一步：按政策粒度分组，计算每条数据的返点比例
    const policyGroups = {};
    const itemsWithRebate = [];

    // 按政策粒度分组
    data.result.forEach((item, index) => {
        const key = getPolicyGroupKey(item);
        if (!policyGroups[key]) {
            policyGroups[key] = [];
        }
        policyGroups[key].push(item);
    });

    console.log(`政策粒度分组数: ${Object.keys(policyGroups).length}`);

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
        if (groupMetric === null) {
            groupMetric = groupItems[0].firstEffectiveMaterialCostRateMetric || 0;
        }
        if (groupTarget === null) {
            groupTarget = groupItems[0].firstEffectiveMaterialCostRateTargetValue || 0;
        }

        // 处理组内每条数据，计算返点比例
        groupItems.forEach(item => {
            const rebateInfo = calculateRebateRate(item, groupMetric, groupTarget);
            const rebateAmount = rebateInfo.rebateRate * (item.performanceCost || 0);

            itemsWithRebate.push({
                ...item,
                rebateRate: rebateInfo.rebateRate,
                rebateAmount: rebateAmount,
                groupMetric: groupMetric,
                groupTarget: groupTarget
            });
        });
    });

    console.log(`已计算返点比例的数据条数: ${itemsWithRebate.length}`);

    // 第二步：按统计维度分组汇总
    const statGroups = {};

    itemsWithRebate.forEach(item => {
        const key = getStatGroupKey(item);
        if (!statGroups[key]) {
            statGroups[key] = {
                quarter: null,
                month: null,
                agentGroupName: item.agentGroupName,
                agentName: item.agentGroupName, // 假设和集团名称一样
                rebateCalcPolicyType: item.rebateCalcPolicyType,
                rebateCalcSettlementStatsType: item.rebateCalcSettlementStatsType,
                rebateCalcSecondIndustryName: item.rebateCalcSecondIndustryName,
                operatorTag: item.operatorTag,
                rebateCalcTypeShow: (() => {
                    // 生成季度返点核算标签的逻辑
                    let rebateCalcTypeShow = item.rebateCalcTypeShow || null;

                    if (!rebateCalcTypeShow) {
                        const parts = [];

                        if (item.appKey === 'LOCAL') {
                            parts.push('本地推');
                        }

                        if (item.rebateCalcExternalIndustryCategory) {
                            parts.push(item.rebateCalcExternalIndustryCategory);
                        }

                        const operatorTagMap = {
                            'ZIYUNYING': '自运营',
                            'ZOULIANG': '走量',
                            'SHOULIANG': '收量'
                        };
                        if (item.operatorTag && operatorTagMap[item.operatorTag]) {
                            parts.push(operatorTagMap[item.operatorTag]);
                        }

                        if (parts.length > 0) {
                            rebateCalcTypeShow = parts.join('-');
                        }

                        if (item.rebateCalcSecondIndustryName === '汽车厂商') {
                            rebateCalcTypeShow = '剔除';
                        }
                    }

                    return rebateCalcTypeShow;
                })(),
                items: [],
                totalPerformanceCost: 0,
                metrics: [],
                targets: []
            };

            // 解析季度和月份
            const statPeriod = item.statPeriod || '';
            if (statPeriod) {
                const parts = statPeriod.split('-');
                if (parts.length === 2) {
                    const monthNum = parseInt(parts[1]);
                    statGroups[key].month = monthNum;
                    statGroups[key].quarter = Math.ceil(monthNum / 3);
                }
            }
        }

        statGroups[key].items.push(item);
        statGroups[key].totalPerformanceCost += (item.performanceCost || 0);

        // 收集指标和目标值（用于确定组的指标和目标）
        if (item.groupMetric !== null && item.groupMetric !== undefined) {
            statGroups[key].metrics.push(item.groupMetric);
        }
        if (item.groupTarget !== null && item.groupTarget !== undefined) {
            statGroups[key].targets.push(item.groupTarget);
        }
    });

    console.log(`统计维度分组数: ${Object.keys(statGroups).length}`);

    // 生成统计结果
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
                rebateRate = REBATE_MAX;
            } else if (finalMetric < finalTarget && finalTarget > 0) {
                rebateRate = REBATE_MIN + (REBATE_MAX - REBATE_MIN) * (finalMetric / finalTarget);
            } else if (finalMetric === 0 && finalTarget === 0) {
                rebateRate = 0;
            }
        }

        result.push({
            quarter: group.quarter,
            month: group.month,
            agentGroupName: group.agentGroupName,
            agentName: group.agentName,
            rebateCalcPolicyType: group.rebateCalcPolicyType,
            rebateCalcSettlementStatsType: group.rebateCalcSettlementStatsType,
            rebateCalcSecondIndustryName: group.rebateCalcSecondIndustryName,
            operatorTag: group.operatorTag,
            rebateCalcTypeShow: group.rebateCalcTypeShow,
            metric: finalMetric,
            target: finalTarget,
            rebateRate: rebateRate,
            rebateRateMax: REBATE_MAX,
            rebateRateMin: REBATE_MIN,
            totalPerformanceCost: group.totalPerformanceCost
        });
    });

    return result;
}

// 执行计算
const results = processData();

// 计算总计
const totalPerformanceCost = results.reduce((sum, item) => sum + (item.totalPerformanceCost || 0), 0);

console.log('=== 首发素材消耗统计结果 ===\n');
console.log(`总分组数: ${results.length}`);
console.log(`总业绩消耗: ${totalPerformanceCost.toFixed(2)}\n`);

// 输出表头
console.log('核算业绩归属季度\t核算业绩归属月\t代理商集团\t代理商名称\t返点政策类型\t结算行业统计类型\t结算二级行业\t运营标签\t季度返点核算标签\t[首发消耗占比]指标值\t[首发消耗占比]目标值\t[首发消耗占比]返点比例\t[首发消耗占比]返点比例上限\t[首发消耗占比]返点比例下限\t业绩消耗');
console.log('');

// 输出数据
results.forEach(item => {
    const line = [
        item.quarter || 'NULL',
        item.month || 'NULL',
        item.agentGroupName || 'NULL',
        item.agentName || 'NULL',
        item.rebateCalcPolicyType || 'NULL',
        item.rebateCalcSettlementStatsType || 'NULL',
        item.rebateCalcSecondIndustryName || 'NULL',
        item.operatorTag || 'NULL',
        item.rebateCalcTypeShow || 'NULL',
        item.metric !== null ? item.metric.toFixed(4) : 'NULL',
        item.target !== null ? item.target.toFixed(4) : 'NULL',
        item.rebateRate !== null ? item.rebateRate.toFixed(4) : 'NULL',
        item.rebateRateMax !== null ? item.rebateRateMax.toFixed(4) : 'NULL',
        item.rebateRateMin !== null ? item.rebateRateMin.toFixed(4) : 'NULL',
        item.totalPerformanceCost.toFixed(2)
    ].join('\t');
    console.log(line);
});

console.log(`\n=== 汇总 ===`);
console.log(`总业绩消耗: ${totalPerformanceCost.toFixed(2)}`);

// 导出结果
module.exports = { results, totalPerformanceCost };

