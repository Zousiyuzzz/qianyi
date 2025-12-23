/**
 * 汽车政策数据计算工具
 * 后端只提供列表数据，前端需要自己计算汇总值
 */

/**
 * 从列表数据计算业绩消耗
 * @param {Array} listData - 列表数据
 * @returns {number} 业绩消耗总和
 */
export function calculatePerformanceCost(listData) {
    if (!Array.isArray(listData) || listData.length === 0) {
        return 0;
    }
    return listData.reduce((sum, item) => {
        const cost = parseFloat(item.performanceCost || item.performance_cost || 0);
        return sum + (isNaN(cost) ? 0 : cost);
    }, 0);
}

/**
 * 从列表数据计算竞价基础返点
 * @param {Array} listData - 列表数据
 * @returns {number} 竞价基础返点总和
 */
export function calculateBidBaseRebate(listData) {
    if (!Array.isArray(listData) || listData.length === 0) {
        return 0;
    }
    return listData.reduce((sum, item) => {
        const amount = parseFloat(item.bidBaseReabteAmount || item.bid_base_reabte_amount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
}

/**
 * 从列表数据计算优质素材消耗返点
 * @param {Array} listData - 列表数据
 * @returns {number} 优质素材消耗返点总和
 */
export function calculateHighQualityRebate(listData) {
    if (!Array.isArray(listData) || listData.length === 0) {
        return 0;
    }
    return listData.reduce((sum, item) => {
        const amount = parseFloat(item.highCostRebateAmount || item.high_cost_rebate_amount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
}

/**
 * 从列表数据计算首发素材消耗返点
 * @param {Array} listData - 列表数据
 * @returns {number} 首发素材消耗返点总和
 */
export function calculateFirstReleaseRebate(listData) {
    if (!Array.isArray(listData) || listData.length === 0) {
        return 0;
    }
    return listData.reduce((sum, item) => {
        const amount = parseFloat(item.firstEffectiveCostRebateAmount || item.first_effective_cost_rebate_amount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
}

/**
 * 从列表数据计算直播消耗返点
 * @param {Array} listData - 列表数据
 * @returns {number} 直播消耗返点总和
 */
export function calculateLiveRebate(listData) {
    if (!Array.isArray(listData) || listData.length === 0) {
        return 0;
    }
    return listData.reduce((sum, item) => {
        const amount = parseFloat(item.liveCostRebateAmount || item.live_cost_rebate_amount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
}

/**
 * 从列表数据计算预付指标
 * @param {Array} listData - 列表数据
 * @returns {number} 预付指标（预付消耗总和 * 0.8%）
 */
export function calculatePrepaidCost(listData) {
    if (!Array.isArray(listData) || listData.length === 0) {
        return 0;
    }
    const totalPrepaidCost = listData.reduce((sum, item) => {
        const cost = parseFloat(item.prepayCost || item.prepay_cost || 0);
        return sum + (isNaN(cost) ? 0 : cost);
    }, 0);
    // 预付指标 = 预付消耗总和 * 0.8%
    return totalPrepaidCost * 0.008;
}

/**
 * 计算返点总额
 * @param {Object} data - 包含各项返点的数据对象
 * @returns {number} 返点总额
 */
export function calculateTotalRebate(data) {
    const {
        biddingRiskControlRebate = 0,
        highQualityConsumption = 0,
        firstReleaseConsumption = 0,
        liveConsumption = 0
    } = data;
    return biddingRiskControlRebate + highQualityConsumption + firstReleaseConsumption + liveConsumption;
}

/**
 * 计算返点率
 * @param {number} totalRebate - 返点总额
 * @param {number} performanceCost - 业绩消耗
 * @returns {number} 返点率（百分比）
 */
export function calculateRebateRate(totalRebate, performanceCost) {
    if (!performanceCost || performanceCost === 0) {
        return 0;
    }
    return (totalRebate / performanceCost) * 100;
}

/**
 * 根据政策类型计算所有指标
 * @param {Array} calcDetailList - 核算明细列表
 * @param {Array} materialDetailList - 素材明细列表（可选）
 * @param {Array} performanceDetailList - 业绩明细列表（可选）
 * @param {string} policyType - 政策类型 '综代政策' | '汽车政策'
 * @returns {Object} 包含所有计算结果的对象
 */
export function calculateAllMetrics(calcDetailList = [], materialDetailList = [], performanceDetailList = [], policyType = '综代政策') {
    if (policyType === '汽车政策') {
        // 汽车政策：从列表数据计算
        const perfConsumption = calculatePerformanceCost(calcDetailList);
        const biddingRebate = calculateBidBaseRebate(calcDetailList);
        const highQualityRebate = calculateHighQualityRebate(materialDetailList);
        const firstReleaseRebate = calculateFirstReleaseRebate(materialDetailList);
        const liveRebate = calculateLiveRebate(materialDetailList);
        const prepaidCost = calculatePrepaidCost(performanceDetailList);

        const totalRebate = calculateTotalRebate({
            biddingRiskControlRebate: biddingRebate,
            highQualityConsumption: highQualityRebate,
            firstReleaseConsumption: firstReleaseRebate,
            liveConsumption: liveRebate
        });

        const rebateRate = calculateRebateRate(totalRebate, perfConsumption);

        return {
            perfConsumption,
            biddingRiskControlRebate: biddingRebate,
            highQualityConsumption: highQualityRebate,
            firstReleaseConsumption: firstReleaseRebate,
            liveConsumption: liveRebate,
            prepaidConsumption: prepaidCost,
            totalRebateAmount: totalRebate,
            rebateRate
        };
    } else {
        // 综代政策：使用后端返回的汇总值（保持原有逻辑）
        // 这里返回null，表示使用后端数据
        return null;
    }
}

