    <template>
        <div class="rebate-dashboard">
            <!-- 顶部导航栏 -->
            <header class="dashboard-header">
                <div class="header-content">
                    <div class="title-section">
                        <a-icon type="bar-chart" class="header-icon" />
                        <h1 class="main-title">返点数据洞察</h1>
                    </div>
                    <div class="header-actions">
                        <div class="update-time">
                            <span>数据更新时间: {{ new Date().toLocaleDateString() }}</span>
                            <a-button type="link" size="small" class="refresh-link" @click="loadData">
                                <a-icon type="reload" />
                                刷新
                            </a-button>
                        </div>
                        <div class="filter-group">
                            <a-select v-model="selectedPeriod" placeholder="5月" class="filter-select"
                                :disabled="cardLoading">
                                <a-select-option value="1月">1月</a-select-option>
                                <a-select-option value="2月">2月</a-select-option>
                                <a-select-option value="3月">3月</a-select-option>
                                <a-select-option value="4月">4月</a-select-option>
                                <a-select-option value="5月">5月</a-select-option>
                                <a-select-option value="6月">6月</a-select-option>
                                <a-select-option value="7月">7月</a-select-option>
                                <a-select-option value="8月">8月</a-select-option>
                                <a-select-option value="9月">9月</a-select-option>
                                <a-select-option value="10月">10月</a-select-option>
                                <a-select-option value="11月">11月</a-select-option>
                                <a-select-option value="12月">12月</a-select-option>
                            </a-select>
                            <a-select v-model="selectedYear" placeholder="2025" class="filter-select"
                                :disabled="cardLoading">
                                <a-select-option value="2024">2024</a-select-option>
                                <a-select-option value="2025">2025</a-select-option>
                            </a-select>
                            <a-select v-model="selectedType" placeholder="综代政策" class="filter-select"
                                :disabled="cardLoading">
                                <a-select-option value="综代政策">综代政策</a-select-option>
                                <a-select-option value="汽车政策">汽车政策</a-select-option>
                            </a-select>
                            <a-select v-model="selectedCompany" class="filter-select company-select"
                                :disabled="cardLoading">
                                <a-select-option value="上海岂量信息科技有限公司">上海岂量信息科技有限公司</a-select-option>
                                <a-select-option value="重庆博拉新媒体科技有限公司">重庆博拉新媒体科技有限公司</a-select-option>
                                <a-select-option value="新数科技">新数科技</a-select-option>
                            </a-select>
                        </div>
                    </div>
                </div>
            </header>

            <!-- 主要内容区 -->
            <main class="dashboard-main">
                <!-- TOP3影响因素 -->
                <!-- <div class="analysis-section" :class="{ 'is-loading': cardLoading }">
                    <div v-if="cardLoading" class="section-loading-overlay">
                        <a-spin tip="加载中..." />
                    </div>
                    <h3 class="diagnosis-section-title">
                        <a-icon type="fire" class="section-icon" />
                        TOP3影响因素
                    </h3>
                    <ul class="factors-list">
                        <li v-for="(factor, index) in topFactors" :key="index" class="factor-item">
                            <div class="factor-rank">{{ index + 1 }}</div>
                            <div class="factor-content">
                                <span class="factor-name">{{ factor.name }}</span>
                                <span :class="factor.change.isPositive ? 'positive-value' : 'negative-value'">
                                    {{ factor.change.amount }} {{ factor.change.percent }}
                                </span>
                            </div>
                        </li>
                    </ul>
                </div> -->

                <!-- 整体趋势分析 -->
                <div class="analysis-section" :class="{ 'is-loading': cardLoading }">
                    <div v-if="cardLoading" class="section-loading-overlay">
                        <a-spin tip="加载中..." />
                    </div>
                    <h3 class="diagnosis-section-title">
                        <a-icon type="line-chart" class="section-icon" />
                        整体趋势分析
                    </h3>
                    <div class="trend-summary">
                        <div class="trend-item">
                            <span class="trend-label">业绩消耗趋势：</span>
                            <span class="trend-value">{{ formatAmount(perfConsumption) }}</span>
                            <span :class="perfChange.includes('+') ? 'trend-down' : 'trend-up'">
                                {{ perfChange }}
                            </span>
                        </div>
                        <div class="trend-item">
                            <span class="trend-label">返点总额：</span>
                            <span class="trend-value">{{ formatAmount(totalRebateAmount) }}</span>
                            <span :class="totalRebateChange.includes('+') ? 'trend-down' : 'trend-up'">
                                {{ totalRebateChange }}
                            </span>
                        </div>
                        <div class="trend-item">
                            <span class="trend-label">返点率：</span>
                            <span class="trend-value">{{ rebateRate }}%</span>
                            <span :class="rebateRateChange.includes('+') ? 'trend-down' : 'trend-up'">
                                {{ rebateRateChange }}
                            </span>
                        </div>
                        <div class="trend-item">
                            <span class="trend-label">竞价基础返点：</span>
                            <span class="trend-value">{{ formatAmount(biddingRiskControlRebate) }}</span>
                            <span :class="biddingChange.includes('+') ? 'trend-down' : 'trend-up'">
                                {{ biddingChange }}
                            </span>
                        </div>
                        <div class="trend-item">
                            <span class="trend-label">优质素材消耗：</span>
                            <span class="trend-value">{{ formatAmount(highQualityConsumption) }}</span>
                            <span :class="highQualityChange.includes('+') ? 'trend-down' : 'trend-up'">
                                {{ highQualityChange }}
                            </span>
                        </div>
                        <div class="trend-item">
                            <span class="trend-label">首发素材消耗：</span>
                            <span class="trend-value">{{ formatAmount(firstReleaseConsumption) }}</span>
                            <span :class="firstReleaseChange.includes('+') ? 'trend-down' : 'trend-up'">
                                {{ firstReleaseChange }}
                            </span>
                        </div>
                        <div class="trend-item">
                            <span class="trend-label">直播返点：</span>
                            <span class="trend-value">{{ formatAmount(liveConsumption) }}</span>
                            <span :class="liveChange.includes('+') ? 'trend-down' : 'trend-up'">
                                {{ liveChange }}
                            </span>
                        </div>
                        <div class="trend-item">
                            <span class="trend-label">预付指标：</span>
                            <span class="trend-value">{{ formatAmount(prepaidConsumption) }}</span>
                            <span :class="prepaidChange.includes('+') ? 'trend-down' : 'trend-up'">
                                {{ prepaidChange }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 数据卡片列表 -->
                <div class="data-cards-list" :class="{ 'is-loading': cardLoading }">
                    <div v-if="cardLoading" class="list-loading-overlay">
                        <a-spin tip="加载中..." />
                    </div>
                    <ul class="cards-list">
                        <li v-for="card in dataCards" :key="card.id"
                            :class="['card-list-item', card.cardClass, { 'expanded': expandedCards[card.id] }]"
                            @click="toggleCardExpand(card.id)">
                            <div class="card-item-header">
                                <div class="card-item-icon" :class="card.iconClass">
                                    <a-icon :type="card.icon" />
                                </div>
                                <div class="card-item-content">
                                    <span class="card-item-name">{{ card.name }}</span>
                                    <div class="card-item-value-row">
                                        <span class="card-item-value">{{ formatAmount(card.value) }}</span>
                                        <span
                                            :class="['card-item-change', card.change.includes('+') ? 'positive' : 'negative']">
                                            {{ card.change }}
                                        </span>
                                    </div>
                                </div>
                                <a-icon :type="expandedCards[card.id] ? 'up' : 'down'" class="expand-icon" />
                            </div>
                            <transition name="card-detail">
                                <div v-if="expandedCards[card.id]" class="card-item-detail" @click.stop>
                                    <div class="detail-content">
                                        <div class="detail-header-row">
                                            <div class="detail-value-section">
                                                <div class="detail-value">{{ formatAmount(card.value) }}</div>
                                                <div
                                                    :class="['detail-change', card.change.includes('+') ? 'positive' : 'negative']">
                                                    {{ card.change }}
                                                </div>
                                            </div>
                                            <div v-if="getCardFormula(card.id)"
                                                class="detail-formula detail-formula-inline">
                                                <h4 class="detail-info-title">指标说明</h4>
                                                <p class="detail-formula-text">{{ getCardFormula(card.id).title }}</p>
                                                <p class="detail-formula-text">{{ getCardFormula(card.id).formula }}</p>
                                                <p class="detail-formula-text">{{ getCardFormula(card.id).explain }}</p>
                                            </div>
                                        </div>
                                        <div class="detail-actions" @click.stop>
                                            <button class="action-btn export-btn" @click.stop="handleExport(card)">
                                                <a-icon type="download" />
                                                <span>导出</span>
                                            </button>
                                            <button class="action-btn share-btn" @click.stop="handleShare(card)">
                                                <a-icon type="share-alt" />
                                                <span>分享</span>
                                            </button>
                                        </div>
                                        <div class="detail-info">
                                            <h4 class="detail-info-title">详细数据</h4>
                                            <div v-if="cardDetailLoading[card.id]" class="detail-loading">
                                                <a-spin tip="加载中..." />
                                            </div>
                                            <div v-else-if="cardDetailList[card.id] && cardDetailList[card.id].length > 0"
                                                class="detail-table-wrapper">
                                                <a-table :columns="getTableColumns(card.id)"
                                                    :dataSource="cardDetailList[card.id]" :pagination="false"
                                                    size="small" :scroll="{ x: 'max-content' }" bordered>
                                                </a-table>
                                            </div>
                                            <div v-else class="detail-empty">
                                                <a-empty description="暂无数据" :image="false" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </transition>
                        </li>
                    </ul>
                </div>
            </main>

            <!-- 详情模态框 -->
            <transition name="modal">
                <div v-if="showModal" class="modal-overlay" @click="closeModal">
                    <div class="modal-container" :class="`${selectedCard && selectedCard.type}-card`" @click.stop>
                        <div class="modal-header">
                            <h2 class="modal-title">{{ selectedCard.title }}</h2>
                            <a-button type="link" class="close-btn" @click="closeModal">
                                <a-icon type="close" />
                            </a-button>
                        </div>
                        <div class="modal-content">
                            <div class="modal-value-section">
                                <div class="modal-value">{{ selectedCard.value }}</div>
                                <div class="modal-change"
                                    :class="selectedCard.change.includes('+') ? 'positive' : 'negative'">
                                    {{ selectedCard.change }}
                                </div>
                            </div>
                            <div class="modal-actions">
                                <button class="action-btn export-btn">
                                    <a-icon type="download" />
                                    <span>导出</span>
                                </button>
                                <button class="action-btn share-btn">
                                    <a-icon type="share-alt" />
                                    <span>分享</span>
                                </button>
                            </div>
                            <div class="modal-details">
                                <h3 class="details-title">详细数据</h3>
                                <p class="details-text">这里是 {{ selectedCard.title }} 的详细信息...</p>
                                <p class="details-text">可以在这里展示更多数据图表和分析内容。</p>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </template>

<script>
import { getAction } from '@/api/manage' // 假设这是项目中的API工具

export default {
    name: 'DataCheck',
    data() {
        return {
            activeTab: 'overall',
            selectedPeriod: '5月',  // 默认月份
            selectedYear: '2025',
            selectedType: '综代政策',
            selectedCompany: '上海岂量信息科技有限公司',
            isDiagnosticCollapsed: true,
            selectedCard: null,
            showModal: false,
            cardLoading: false,
            expandedCards: {},
            // 详情列表数据
            cardDetailList: {},
            // 详情加载状态
            cardDetailLoading: {},
            // 综代政策数据
            perfConsumption: 0,
            prepaidConsumption: 0,
            biddingRiskControlRebate: 0,
            firstReleaseConsumption: 0,
            highQualityConsumption: 0,
            liveConsumption: 0,
            // 上期数据（用于计算变化）
            prevPerfConsumption: 0,
            prevPrepaidConsumption: 0,
            prevBiddingRiskControlRebate: 0,
            prevFirstReleaseConsumption: 0,
            prevHighQualityConsumption: 0,
            prevLiveConsumption: 0,
            // 汽车政策列表数据（只存储list，不计算汇总）
            carPolicyCalcDetailList: [], // 核算明细列表
            carPolicyMaterialDetailList: [], // 素材明细列表
            carPolicyPerformanceDetailList: [], // 业绩明细列表
            // 返点上下限配置（从接口获取）
            rebateLimitConfig: [] // 存储所有返点上下限配置
        }
    },
    computed: {
        perfChange() {
            const change = this.calculateChange(this.perfConsumption, this.prevPerfConsumption);
            return `${change.amount} ${change.percent}`;
        },
        prepaidChange() {
            const change = this.calculateChange(this.prepaidConsumption, this.prevPrepaidConsumption);
            return `${change.amount} ${change.percent}`;
        },
        biddingChange() {
            const change = this.calculateChange(this.biddingRiskControlRebate, this.prevBiddingRiskControlRebate);
            return `${change.amount} ${change.percent}`;
        },
        firstReleaseChange() {
            const change = this.calculateChange(this.firstReleaseConsumption, this.prevFirstReleaseConsumption);
            return `${change.amount} ${change.percent}`;
        },
        highQualityChange() {
            const change = this.calculateChange(this.highQualityConsumption, this.prevHighQualityConsumption);
            return `${change.amount} ${change.percent}`;
        },
        liveChange() {
            const change = this.calculateChange(this.liveConsumption, this.prevLiveConsumption);
            return `${change.amount} ${change.percent}`;
        },
        // TOP3影响因素（按变化绝对值排序）
        // topFactors() {
        //     const factors = [
        //         { name: '直播(派生视频/非视频)返点', current: this.liveConsumption, prev: this.prevLiveConsumption },
        //         { name: '首发素材消耗', current: this.firstReleaseConsumption, prev: this.prevFirstReleaseConsumption },
        //         { name: '优质素材消耗', current: this.highQualityConsumption, prev: this.prevHighQualityConsumption }
        //     ];
        //     return factors
        //         .map(factor => ({
        //             ...factor,
        //             change: this.calculateChange(factor.current, factor.prev),
        //             absDiff: Math.abs(factor.current - factor.prev)
        //         }))
        //         .sort((a, b) => b.absDiff - a.absDiff)
        //         .slice(0, 3);
        // },
        // 返点总额
        totalRebateAmount() {
            return this.biddingRiskControlRebate + this.liveConsumption;
        },
        // 返点总额变化
        totalRebateChange() {
            const prevTotalRebate = this.prevBiddingRiskControlRebate + this.prevLiveConsumption;
            const change = this.calculateChange(this.totalRebateAmount, prevTotalRebate);
            return `${change.amount} ${change.percent}`;
        },
        // 返点率
        rebateRate() {
            if (this.perfConsumption === 0) return '0.00';
            return ((this.totalRebateAmount / this.perfConsumption) * 100).toFixed(2);
        },
        // 返点率变化
        rebateRateChange() {
            const currentRate = this.perfConsumption === 0 ? 0 : (this.totalRebateAmount / this.perfConsumption) * 100;
            const prevTotalRebate = this.prevBiddingRiskControlRebate + this.prevLiveConsumption;
            const prevRate = this.prevPerfConsumption === 0 ? 0 : (prevTotalRebate / this.prevPerfConsumption) * 100;
            const change = this.calculateChange(currentRate, prevRate);
            return `${change.amount.replace('元', '%')} ${change.percent}`;
        },
        // 关键洞察
        keyInsights() {
            const insights = [];

            // 业绩消耗分析
            if (this.perfConsumption > this.prevPerfConsumption) {
                const growthRate = ((this.perfConsumption - this.prevPerfConsumption) / this.prevPerfConsumption * 100).toFixed(1);
                insights.push({
                    type: 'arrow-up',
                    class: 'insight-positive',
                    text: `业绩消耗较上期增长 ${growthRate}%，当前业绩消耗为 ${this.formatAmount(this.perfConsumption)}`
                });
            } else if (this.perfConsumption < this.prevPerfConsumption) {
                const declineRate = ((this.prevPerfConsumption - this.perfConsumption) / this.prevPerfConsumption * 100).toFixed(1);
                insights.push({
                    type: 'arrow-down',
                    class: 'insight-warning',
                    text: `业绩消耗较上期下降 ${declineRate}%，当前业绩消耗为 ${this.formatAmount(this.perfConsumption)}`
                });
            }

            // 返点率分析
            const currentRate = this.perfConsumption === 0 ? 0 : (this.totalRebateAmount / this.perfConsumption * 100).toFixed(2);
            if (currentRate > 0 && currentRate < 5) {
                insights.push({
                    type: 'info-circle',
                    class: 'insight-info',
                    text: `返点率 ${currentRate}%，返点总额 ${this.formatAmount(this.totalRebateAmount)}，返点率偏低`
                });
            } else if (currentRate >= 5 && currentRate < 10) {
                insights.push({
                    type: 'check-circle',
                    class: 'insight-positive',
                    text: `返点率 ${currentRate}%，返点总额 ${this.formatAmount(this.totalRebateAmount)}，返点率正常`
                });
            } else if (currentRate >= 10) {
                insights.push({
                    type: 'star',
                    class: 'insight-excellent',
                    text: `返点率 ${currentRate}%，返点总额 ${this.formatAmount(this.totalRebateAmount)}，返点率较高`
                });
            }

            // 素材消耗分析
            const materialTotal = this.firstReleaseConsumption + this.highQualityConsumption;
            const materialRatio = this.perfConsumption > 0 ? (materialTotal / this.perfConsumption * 100).toFixed(1) : 0;
            if (materialTotal > 0 && materialTotal < this.perfConsumption * 0.1) {
                insights.push({
                    type: 'bulb',
                    class: 'insight-info',
                    text: `素材消耗总额 ${this.formatAmount(materialTotal)}，占业绩消耗的 ${materialRatio}%，素材消耗占比偏低`
                });
            } else if (materialTotal >= this.perfConsumption * 0.2) {
                insights.push({
                    type: 'check-circle',
                    class: 'insight-positive',
                    text: `素材消耗总额 ${this.formatAmount(materialTotal)}，占业绩消耗的 ${materialRatio}%，素材消耗占比较高`
                });
            }

            // 直播返点分析
            const liveRatio = this.totalRebateAmount > 0 ? (this.liveConsumption / this.totalRebateAmount * 100).toFixed(1) : 0;
            if (this.liveConsumption > this.totalRebateAmount * 0.5) {
                insights.push({
                    type: 'video-camera',
                    class: 'insight-positive',
                    text: `直播返点 ${this.formatAmount(this.liveConsumption)}，占返点总额的 ${liveRatio}%，直播返点占比高`
                });
            } else if (this.liveConsumption > 0 && this.liveConsumption <= this.totalRebateAmount * 0.3) {
                insights.push({
                    type: 'info-circle',
                    class: 'insight-info',
                    text: `直播返点 ${this.formatAmount(this.liveConsumption)}，占返点总额的 ${liveRatio}%，直播返点占比低`
                });
            }

            return insights.length > 0 ? insights : [{
                type: 'info-circle',
                class: 'insight-info',
                text: '各项数据指标正常'
            }];
        },
        // 数据卡片列表
        dataCards() {
            return [
                {
                    id: 'performance',
                    name: '业绩消耗',
                    value: this.perfConsumption,
                    change: this.perfChange,
                    icon: 'line-chart',
                    iconClass: 'total-icon',
                    cardClass: 'total-card',
                    type: 'total'
                },
                {
                    id: 'bidding',
                    name: '竞价基础返点',
                    value: this.biddingRiskControlRebate,
                    change: this.biddingChange,
                    icon: 'tag',
                    iconClass: 'primary-icon',
                    cardClass: 'primary-card',
                    type: 'basic'
                },
                {
                    id: 'highQuality',
                    name: '优质素材消耗',
                    value: this.highQualityConsumption,
                    change: this.highQualityChange,
                    icon: 'picture',
                    iconClass: 'operation-icon',
                    cardClass: 'operation-card',
                    type: 'operation'
                },
                {
                    id: 'firstRelease',
                    name: '首发素材消耗',
                    value: this.firstReleaseConsumption,
                    change: this.firstReleaseChange,
                    icon: 'rocket',
                    iconClass: 'operation-icon',
                    cardClass: 'operation-card',
                    type: 'operation'
                },
                {
                    id: 'live',
                    name: '直播(派生视频/非视频)返点',
                    value: this.liveConsumption,
                    change: this.liveChange,
                    icon: 'video-camera',
                    iconClass: 'live-icon',
                    cardClass: 'operation-card warning',
                    type: 'operation'
                },
                {
                    id: 'prepaid',
                    name: '预付指标',
                    value: this.prepaidConsumption,
                    change: this.prepaidChange,
                    icon: 'credit-card',
                    iconClass: 'capital-icon',
                    cardClass: 'capital-card',
                    type: 'capital'
                }
            ];
        }
    },
    watch: {
        selectedPeriod: 'loadData',
        selectedYear: 'loadData',
        selectedType: 'loadData',
        selectedCompany: 'loadData'
    },
    created() {
        this.loadData();
    },
    methods: {
        // 获取上期参数
        getPreviousPeriod(period, year) {
            if (period.startsWith('Q')) {
                const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
                const index = quarters.indexOf(period);
                if (index > 0) {
                    return { period: quarters[index - 1], year: year };
                } else {
                    return { period: 'Q4', year: String(parseInt(year) - 1) };
                }
            } else {
                const monthStr = period.replace('月', '');
                const month = parseInt(monthStr, 10);
                if (month > 1) {
                    return { period: `${month - 1}月`, year: year };
                } else {
                    return { period: '12月', year: String(parseInt(year) - 1) };
                }
            }
        },
        async loadData() {
            this.cardLoading = true;
            try {
                if (this.selectedType === '汽车政策') {
                    await this.loadCarPolicyData();
                } else {
                    await this.loadNormalPolicyData();
                }
            } catch (error) {
                this.$message.error('数据加载失败');
                console.error('数据加载错误:', error);
            } finally {
                this.cardLoading = false;
            }
        },
        // 综代政策数据加载（原有逻辑）
        async loadNormalPolicyData() {
            const params = {
                year: this.selectedYear,
                rebatePolicyType: this.selectedType,
                agentName: this.selectedCompany
            };
            params.quarter = this.selectedPeriod;

            // 获取上期参数
            const prevPeriodInfo = this.getPreviousPeriod(this.selectedPeriod, this.selectedYear);
            const prevParams = {
                year: prevPeriodInfo.year,
                rebatePolicyType: this.selectedType,
                agentName: this.selectedCompany
            };
            prevParams.quarter = prevPeriodInfo.period;

            // 并行调用当前期和上期的API
            const [
                perfRes, prepaidRes, biddingRes, firstRes, highRes, liveRes,
                prevPerfRes, prevPrepaidRes, prevBiddingRes, prevFirstRes, prevHighRes, prevLiveRes
            ] = await Promise.all([
                getAction('/dataInsights/getPerformanceCost', params),
                getAction('/dataInsights/getPrepayCost', params),
                getAction('/dataInsights/getBidBaseReabteAmount', params),
                getAction('/dataInsights/getFirstReleaseMaterialConsumption', params),
                getAction('/dataInsights/getHighQualityMaterialConsumption', params),
                getAction('/dataInsights/getLiveMaterialConsumption', params),
                // 上期数据
                getAction('/dataInsights/getPerformanceCost', prevParams),
                getAction('/dataInsights/getPrepayCost', prevParams),
                getAction('/dataInsights/getBidBaseReabteAmount', prevParams),
                getAction('/dataInsights/getFirstReleaseMaterialConsumption', prevParams),
                getAction('/dataInsights/getHighQualityMaterialConsumption', prevParams),
                getAction('/dataInsights/getLiveMaterialConsumption', prevParams)
            ]);

            // 当前期数据
            this.perfConsumption = perfRes.result || 0;
            this.prepaidConsumption = prepaidRes.result || 0;
            this.biddingRiskControlRebate = biddingRes.result || 0;
            this.firstReleaseConsumption = firstRes.result || 0;
            this.highQualityConsumption = highRes.result || 0;
            this.liveConsumption = liveRes.result || 0;

            // 上期数据
            this.prevPerfConsumption = prevPerfRes.result || 0;
            this.prevPrepaidConsumption = prevPrepaidRes.result || 0;
            this.prevBiddingRiskControlRebate = prevBiddingRes.result || 0;
            this.prevFirstReleaseConsumption = prevFirstRes.result || 0;
            this.prevHighQualityConsumption = prevHighRes.result || 0;
            this.prevLiveConsumption = prevLiveRes.result || 0;

            // 预加载所有卡片详情数据
            await this.preloadAllCardDetails();
        },
        // 预加载所有卡片详情数据（综代政策）
        async preloadAllCardDetails() {
            const calcParams = {
                agentGroupName: this.selectedCompany,
                rebateCalcAttributionQuarter: this.formatQuarter(this.selectedPeriod),
                rebateCalcAttributionYear: parseInt(this.selectedYear)
            };

            // 素材明细参数（优质、首发、直播三个卡片使用同一个接口和数据）
            // 综代政策时参数为 NORMAL_POLICY
            const materialParams = {
                agentGroupName: this.selectedCompany,
                statPeriod: this.getStatPeriod(),
                rebateCalcPolicyType: this.getPolicyType() // 综代政策返回 'NORMAL_POLICY'
            };

            const perfParams = {
                agentGroupName: this.selectedCompany,
                rebateCalcAttributionYear: parseInt(this.selectedYear),
                rebateCalcAttributionMonth: this.getMonthNumber() + '月',
                monthRebateCalcPolicyType: this.selectedType
            };

            try {
                // 并行加载所有卡片数据
                const [calcRes, materialRes, perfRes] = await Promise.all([
                    getAction('/douyinRebateCalcDetail/listNotPage', calcParams),
                    getAction('/douyinRebateMaterialDetail/listNotPage', materialParams),
                    getAction('/douyinRebatePerformanceDetail/listNotPage', perfParams)
                ]);

                // 处理返回数据
                const calcList = Array.isArray(calcRes.result) ? calcRes.result : ((calcRes.result && calcRes.result.records) || (calcRes.result && calcRes.result.list) || []);
                const materialList = Array.isArray(materialRes.result) ? materialRes.result : ((materialRes.result && materialRes.result.records) || (materialRes.result && materialRes.result.list) || []);
                const perfList = Array.isArray(perfRes.result) ? perfRes.result : ((perfRes.result && perfRes.result.records) || (perfRes.result && perfRes.result.list) || []);

                // 预加载到 cardDetailList
                // 注意：优质、首发、直播三个卡片使用同一个 materialList（来自同一个接口调用，参数：rebateCalcPolicyType = 'NORMAL_POLICY'）
                this.$set(this.cardDetailList, 'performance', calcList);
                this.$set(this.cardDetailList, 'bidding', calcList);
                this.$set(this.cardDetailList, 'highQuality', materialList);
                this.$set(this.cardDetailList, 'firstRelease', materialList);
                this.$set(this.cardDetailList, 'live', materialList);
                this.$set(this.cardDetailList, 'prepaid', perfList);
            } catch (error) {
                console.error('预加载卡片数据失败:', error);
                // 失败不影响主流程，继续执行
            }
        },
        // 汽车政策数据加载（一次性加载所有接口和卡片数据）
        async loadCarPolicyData() {
            // 汇总接口参数
            const summaryParams = {
                year: this.selectedYear,
                rebatePolicyType: this.selectedType,
                agentName: this.selectedCompany,
                quarter: this.selectedPeriod
            };

            // 核算明细参数
            const calcParams = {
                agentGroupName: this.selectedCompany,
                rebateCalcAttributionQuarter: this.formatQuarter(this.selectedPeriod),
                rebateCalcAttributionYear: parseInt(this.selectedYear),
                monthRebateCalcPolicyType: this.selectedType
            };

            // 素材明细参数（优质、首发、直播三个卡片使用同一个接口和数据）
            // 汽车政策时参数为 CAR_POLICY，综代政策时为 NORMAL_POLICY
            const materialParams = {
                agentGroupName: this.selectedCompany,
                statPeriod: this.getStatPeriod(),
                rebateCalcPolicyType: this.getPolicyType() // 汽车政策返回 'CAR_POLICY'
            };

            // 业绩明细参数
            const perfParams = {
                agentGroupName: this.selectedCompany,
                rebateCalcAttributionYear: parseInt(this.selectedYear),
                rebateCalcAttributionMonth: this.getMonthNumber() + '月',
                monthRebateCalcPolicyType: this.selectedType
            };

            // 并行获取所有数据：汇总接口 + 列表接口 + 返点上下限配置
            const [perfRes, prepaidRes, biddingRes, calcRes, materialRes, perfListRes, rebateLimitRes] = await Promise.all([
                getAction('/dataInsights/getPerformanceCost', summaryParams),
                getAction('/dataInsights/getPrepayCost', summaryParams),
                getAction('/dataInsights/getBidBaseReabteAmount', summaryParams),
                getAction('/douyinRebateCalcDetail/listNotPage', calcParams),
                getAction('/douyinRebateMaterialDetail/listNotPage', materialParams),
                getAction('/douyinRebatePerformanceDetail/listNotPage', perfParams),
                // 获取返点上下限配置（全查，只传年份）
                getAction('/biddingPolicyDetail/list', { year: this.selectedYear })
            ]);

            // 从汇总接口获取数据
            this.perfConsumption = perfRes.result || 0;
            this.prepaidConsumption = prepaidRes.result || 0;
            this.biddingRiskControlRebate = biddingRes.result || 0;

            // 处理列表返回数据
            const calcList = Array.isArray(calcRes.result) ? calcRes.result : ((calcRes.result && calcRes.result.records) || (calcRes.result && calcRes.result.list) || []);
            const materialList = Array.isArray(materialRes.result) ? materialRes.result : ((materialRes.result && materialRes.result.records) || (materialRes.result && materialRes.result.list) || []);
            const perfList = Array.isArray(perfListRes.result) ? perfListRes.result : ((perfListRes.result && perfListRes.result.records) || (perfListRes.result && perfListRes.result.list) || []);

            // 存储到全局列表
            this.carPolicyCalcDetailList = calcList;
            this.carPolicyMaterialDetailList = materialList;
            this.carPolicyPerformanceDetailList = perfList;

            // 处理返点上下限配置
            const rebateLimitList = Array.isArray(rebateLimitRes.result)
                ? rebateLimitRes.result
                : ((rebateLimitRes.result && rebateLimitRes.result.records)
                    || (rebateLimitRes.result && rebateLimitRes.result.list)
                    || []);
            this.rebateLimitConfig = rebateLimitList;

            // 预加载所有卡片数据到 cardDetailList
            // 注意：优质、首发、直播三个卡片使用同一个 materialList（来自同一个接口调用）
            this.$set(this.cardDetailList, 'performance', calcList);
            this.$set(this.cardDetailList, 'bidding', calcList);
            this.$set(this.cardDetailList, 'highQuality', materialList);
            this.$set(this.cardDetailList, 'firstRelease', materialList);
            this.$set(this.cardDetailList, 'live', materialList);
            this.$set(this.cardDetailList, 'prepaid', perfList);

            // 汽车政策：从listNotPage数据中统计汇总值
            // 优质、首发、直播从同一个 materialList 统计（接口参数：rebateCalcPolicyType = 'CAR_POLICY'）
            this.highQualityConsumption = this.calculateCarPolicyHighQuality(materialList);
            this.firstReleaseConsumption = this.calculateCarPolicyFirstRelease(materialList);
            this.liveConsumption = this.calculateCarPolicyLive(materialList);

            // 上期数据暂时为0（等需要时再加载）
            this.prevPerfConsumption = 0;
            this.prevPrepaidConsumption = 0;
            this.prevBiddingRiskControlRebate = 0;
            this.prevFirstReleaseConsumption = 0;
            this.prevHighQualityConsumption = 0;
            this.prevLiveConsumption = 0;
        },
        // 从素材明细列表统计优质素材消耗返点（汽车政策）
        calculateCarPolicyHighQuality(materialList) {
            if (!materialList || materialList.length === 0) {
                return 0;
            }
            return this.calculateCarPolicyRebate(materialList, 'highQuality');
        },
        // 从素材明细列表统计首发素材消耗返点（汽车政策）
        calculateCarPolicyFirstRelease(materialList) {
            if (!materialList || materialList.length === 0) {
                return 0;
            }
            return this.calculateCarPolicyRebate(materialList, 'firstRelease');
        },
        // 汽车政策返点计算通用方法
        calculateCarPolicyRebate(materialList, type) {

            // 根据类型确定字段名（同时支持驼峰和下划线格式）
            const firstItem = materialList[0] || {};
            let metricField, targetField, invalidReasonField;

            if (type === 'highQuality') {
                // 优质素材：优先尝试驼峰，再尝试下划线
                metricField = firstItem.highMaterialCostRateMetric !== undefined
                    ? 'highMaterialCostRateMetric'
                    : 'high_material_cost_rate_metric';
                targetField = firstItem.highMaterialCostRateTargetValue !== undefined
                    ? 'highMaterialCostRateTargetValue'
                    : 'high_material_cost_rate_target_value';
                // 使用 invalidHighMaterialCostRateMolecularReason（优质占比分子剔除原因）来判断
                invalidReasonField = firstItem.invalidHighMaterialCostRateMolecularReason !== undefined
                    ? 'invalidHighMaterialCostRateMolecularReason'
                    : (firstItem.invalid_high_material_cost_rate_molecular_reason !== undefined
                        ? 'invalid_high_material_cost_rate_molecular_reason'
                        : (firstItem.invalidHighMaterialCostReason !== undefined
                            ? 'invalidHighMaterialCostReason'
                            : 'invalid_high_material_cost_reason'));
            } else {
                // 首发素材：优先尝试驼峰，再尝试下划线
                metricField = firstItem.firstEffectiveMaterialCostRateMetric !== undefined
                    ? 'firstEffectiveMaterialCostRateMetric'
                    : 'first_effective_material_cost_rate_metric';
                targetField = firstItem.firstEffectiveMaterialCostRateTargetValue !== undefined
                    ? 'firstEffectiveMaterialCostRateTargetValue'
                    : 'first_effective_material_cost_rate_target_value';
                // 使用 invalidFirstEffectiveMaterialCostRateMolecularReason（首发占比分子剔除原因）来判断
                invalidReasonField = firstItem.invalidFirstEffectiveMaterialCostRateMolecularReason !== undefined
                    ? 'invalidFirstEffectiveMaterialCostRateMolecularReason'
                    : (firstItem.invalid_first_effective_material_cost_rate_molecular_reason !== undefined
                        ? 'invalid_first_effective_material_cost_rate_molecular_reason'
                        : (firstItem.invalidFirstEffectiveMaterialCostReason !== undefined
                            ? 'invalidFirstEffectiveMaterialCostReason'
                            : 'invalid_first_effective_material_cost_reason'));
            }

            // 第一步：按政策粒度分组
            const policyGroups = {};
            materialList.forEach(item => {
                const key = [
                    item.operatorTag || '',
                    item.rebateCalcSettlementStatsType || '',
                    item.rebateCalcSecondIndustryName || '',
                    item.rebateCalcExternalIndustryCategory || '',
                    item.agentGroupName || ''
                ].join('|');
                if (!policyGroups[key]) {
                    policyGroups[key] = [];
                }
                policyGroups[key].push(item);
            });

            // 对每组计算返点比例
            const itemsWithRebate = [];
            Object.keys(policyGroups).forEach(groupKey => {
                const groupItems = policyGroups[groupKey];

                // 获取组的指标和目标值（取非0值）
                let groupMetric = null;
                let groupTarget = null;

                groupItems.forEach(item => {
                    // 保持 null/undefined 不变，不转换为 0
                    const metric = (item && item[metricField] !== undefined && item[metricField] !== null) ? item[metricField] : null;
                    const target = (item && item[targetField] !== undefined && item[targetField] !== null) ? item[targetField] : null;

                    if (metric !== null && metric > 0 && groupMetric === null) {
                        groupMetric = metric;
                    }
                    if (target !== null && target > 0 && groupTarget === null) {
                        groupTarget = target;
                    }
                });

                // 如果组内没有非0值，使用第一个的指标和目标（保持 null 不变）
                if (groupMetric === null && groupItems.length > 0) {
                    const firstItem = groupItems[0];
                    const firstMetric = firstItem && firstItem[metricField];
                    groupMetric = (firstMetric !== undefined && firstMetric !== null) ? firstMetric : null;
                }
                if (groupTarget === null && groupItems.length > 0) {
                    const firstItem = groupItems[0];
                    const firstTarget = firstItem && firstItem[targetField];
                    groupTarget = (firstTarget !== undefined && firstTarget !== null) ? firstTarget : null;
                }

                // 处理组内每条数据，计算返点比例
                groupItems.forEach(item => {
                    // 根据当前 item 的维度查找对应的返点上下限
                    const rebateLimit = this.findRebateLimit(item, type);

                    const rebateRate = this.calculateRebateRateForCarPolicy(
                        item,
                        groupMetric,
                        groupTarget,
                        rebateLimit.min,
                        rebateLimit.max,
                        invalidReasonField,
                        metricField,
                        targetField
                    );
                    const performanceCost = (item && (item.performanceCost !== undefined && item.performanceCost !== null)) ? item.performanceCost : ((item && item.performance_cost !== undefined && item.performance_cost !== null) ? item.performance_cost : 0);
                    const rebateAmount = rebateRate * performanceCost;

                    itemsWithRebate.push({
                        ...item,
                        rebateRate: rebateRate,
                        rebateAmount: rebateAmount,
                        groupMetric: groupMetric,
                        groupTarget: groupTarget
                    });
                });
            });

            // 第二步：按二级行业+运营标签汇总
            const statGroups = {};
            itemsWithRebate.forEach(item => {
                const statKey = [
                    item.rebateCalcSecondIndustryName || '',
                    item.operatorTag || ''
                ].join('|');

                if (!statGroups[statKey]) {
                    statGroups[statKey] = {
                        rebateCalcSecondIndustryName: item.rebateCalcSecondIndustryName,
                        operatorTag: item.operatorTag,
                        items: [],
                        totalPerformanceCost: 0,
                        metrics: [],
                        targets: [],
                        reasons: []
                    };
                }

                statGroups[statKey].items.push(item);
                // 只累加业绩消耗，不累加返点金额（返点金额后面用返点比例×业绩消耗汇总计算）
                const perfCost = (item && (item.performanceCost !== undefined && item.performanceCost !== null)) ? item.performanceCost : ((item && item.performance_cost !== undefined && item.performance_cost !== null) ? item.performance_cost : 0);
                statGroups[statKey].totalPerformanceCost += perfCost;

                // 收集指标和目标值
                if (item.groupMetric !== null && item.groupMetric !== undefined) {
                    statGroups[statKey].metrics.push(item.groupMetric);
                }
                if (item.groupTarget !== null && item.groupTarget !== undefined) {
                    statGroups[statKey].targets.push(item.groupTarget);
                }
                // 收集reason（从单条数据的计算中获取）
                // 注意：这里需要从单条数据计算中获取reason，但当前逻辑没有返回reason
                // 暂时先不收集，后续如果需要可以添加
            });

            // 生成汇总结果并计算返点金额
            let totalRebateAmount = 0;
            Object.keys(statGroups).forEach(key => {
                const group = statGroups[key];

                // 确定组的指标值和目标值（取最常见的非0值）
                let finalMetric = null;
                let finalTarget = null;

                // 统计指标值出现频率（只统计非0值）
                const metricCounts = {};
                let hasNonZeroMetric = false;
                group.metrics.forEach(m => {
                    if (m > 0) {
                        metricCounts[m] = (metricCounts[m] || 0) + 1;
                        hasNonZeroMetric = true;
                    }
                });
                if (Object.keys(metricCounts).length > 0) {
                    finalMetric = parseFloat(Object.keys(metricCounts).reduce((a, b) =>
                        metricCounts[a] > metricCounts[b] ? a : b
                    ));
                } else if (group.metrics.length > 0 && !hasNonZeroMetric) {
                    // 如果所有指标都是0，设置为0（不是null）
                    finalMetric = 0;
                }

                // 统计目标值出现频率（只统计非0值）
                const targetCounts = {};
                let hasNonZeroTarget = false;
                group.targets.forEach(t => {
                    if (t > 0) {
                        targetCounts[t] = (targetCounts[t] || 0) + 1;
                        hasNonZeroTarget = true;
                    }
                });
                if (Object.keys(targetCounts).length > 0) {
                    finalTarget = parseFloat(Object.keys(targetCounts).reduce((a, b) =>
                        targetCounts[a] > targetCounts[b] ? a : b
                    ));
                } else if (group.targets.length > 0 && !hasNonZeroTarget) {
                    // 如果所有目标都是0，设置为0（不是null）
                    finalTarget = 0;
                }

                // 检查是否包含一条或以上直播类型（从单条数据中检查）
                let hasLiveReason = false;
                group.items.forEach(item => {
                    const invalidReason = (item && item[invalidReasonField]) ? String(item[invalidReasonField]) : '';
                    if (invalidReason && invalidReason.includes('直播')) {
                        hasLiveReason = true;
                    }
                });

                // 计算返点比例（使用第一个item的返点上下限）
                let rebateRate = null;
                const firstItem = group.items[0];
                if (firstItem) {
                    const rebateLimit = this.findRebateLimit(firstItem, type);
                    const rebateMin = rebateLimit.min;
                    const rebateMax = rebateLimit.max;

                    // 优先级1：剔除汽车厂商
                    if (group.rebateCalcSecondIndustryName === '汽车厂商') {
                        rebateRate = 0;
                    }
                    // 优先级2：如果指标和目标都是0或null，且包含一条或以上直播，按照返点上限
                    else if ((finalMetric === null || finalMetric === 0) &&
                        (finalTarget === null || finalTarget === 0) &&
                        hasLiveReason) {
                        rebateRate = parseFloat(rebateMax.toFixed(6));
                    }
                    // 优先级3：根据指标和目标值计算
                    else if (finalMetric !== null && finalTarget !== null) {
                        if (finalMetric >= finalTarget && finalTarget > 0) {
                            rebateRate = parseFloat(rebateMax.toFixed(6));
                        } else if (finalMetric < finalTarget && finalTarget > 0) {
                            const calculatedRate = rebateMin + (rebateMax - rebateMin) * (finalMetric / finalTarget);
                            rebateRate = parseFloat(calculatedRate.toFixed(6));
                        } else if (finalMetric === 0 && finalTarget === 0) {
                            rebateRate = parseFloat((0).toFixed(6));
                        }
                    }
                }

                // 返点金额 = 返点比例 × 业绩消耗汇总
                if (rebateRate !== null) {
                    const groupRebateAmount = rebateRate * group.totalPerformanceCost;
                    totalRebateAmount += groupRebateAmount;
                }
            });

            return totalRebateAmount;
        },
        // 计算单条数据的返点比例（汽车政策）
        calculateRebateRateForCarPolicy(item, groupMetric, groupTarget, rebateMin, rebateMax, invalidReasonField, metricField, targetField) {
            // 保持 null/undefined 不变，不转换为 0
            const metric = (item && item[metricField] !== undefined && item[metricField] !== null) ? item[metricField] : null;
            const target = (item && item[targetField] !== undefined && item[targetField] !== null) ? item[targetField] : null;
            const invalidReason = (item && item[invalidReasonField]) ? String(item[invalidReasonField]) : '';
            const secondIndustry = (item && item.rebateCalcSecondIndustryName) ? String(item.rebateCalcSecondIndustryName) : '';

            // 使用组的指标和目标（如果组有值），否则使用当前项的指标和目标
            const finalMetric = groupMetric !== null && groupMetric !== undefined ? groupMetric : metric;
            const finalTarget = groupTarget !== null && groupTarget !== undefined ? groupTarget : target;

            // 优先级1：剔除汽车厂商
            if (secondIndustry === '汽车厂商') {
                return parseFloat((0).toFixed(6));
            }

            // 优先级2：如果指标和目标都是0或null，且包含直播，按照返点上限
            if ((finalMetric === null || finalMetric === undefined || finalMetric === 0) &&
                (finalTarget === null || finalTarget === undefined || finalTarget === 0) &&
                invalidReason && invalidReason.includes('直播')) {
                return parseFloat(rebateMax.toFixed(6));
            }

            // 优先级3：根据指标和目标值计算（如果指标和目标都有值）
            if (finalMetric !== null && finalMetric !== undefined && finalTarget !== null && finalTarget !== undefined) {
                // 指标和目标都为0
                if (finalMetric === 0 && finalTarget === 0) {
                    return parseFloat((0).toFixed(6));
                }
                // 指标 >= 目标，取返点上限
                if (finalMetric >= finalTarget && finalTarget > 0) {
                    return parseFloat(rebateMax.toFixed(6));
                }
                // 指标 < 目标，按公式计算
                if (finalMetric < finalTarget && finalTarget > 0) {
                    const rebateRate = rebateMin + (rebateMax - rebateMin) * (finalMetric / finalTarget);
                    return parseFloat(rebateRate.toFixed(6));
                }
            }

            // 默认情况
            return parseFloat((0).toFixed(6));
        },
        // 从素材明细列表统计直播消耗返点（汽车政策）
        calculateCarPolicyLive(materialList) {
            // TODO: 等用户提供统计方式
            // 暂时返回0
            return 0;
        },
        // 将运营标签从英文转换为中文
        convertOperatorTagToChinese(operatorTag) {
            const tagMap = {
                'ZIYUNYING': '自运营',
                'ZOULIANG': '走量',
                'SHOULIANG': '收量',
                '自运营': '自运营',
                '走量': '走量',
                '收量': '收量'
            };
            return tagMap[operatorTag] || operatorTag;
        },
        // 根据维度查找返点上下限
        findRebateLimit(item, type) {
            if (!this.rebateLimitConfig || this.rebateLimitConfig.length === 0) {
                // 如果没有配置，使用默认值
                return { min: 0, max: 0.01 };
            }

            // 获取维度信息
            const operatorTag = this.convertOperatorTagToChinese(item.operatorTag || '');
            const rebateCalcPolicyType = this.selectedType; // 汽车政策或综代政策（中文）
            const industryType = item.rebateCalcExternalIndustryCategory || ''; // 竞价几类
            const specificIndustry = item.rebateCalcSecondIndustryName || ''; // 二级行业名称

            // 查找匹配的配置（同时支持驼峰和下划线格式）
            const matchedConfig = this.rebateLimitConfig.find(config => {
                const configOperatorTag = config.operator_tag !== undefined ? config.operator_tag : config.operatorTag;
                const configPolicyType = config.rebate_calc_policy_type !== undefined ? config.rebate_calc_policy_type : config.rebateCalcPolicyType;
                const configIndustryType = config.industry_type !== undefined ? config.industry_type : config.industryType;
                const configSpecificIndustry = config.specific_industry !== undefined ? config.specific_industry : config.specificIndustry;

                return configOperatorTag === operatorTag
                    && configPolicyType === rebateCalcPolicyType
                    && configIndustryType === industryType
                    && configSpecificIndustry === specificIndustry;
            });

            if (matchedConfig) {
                // 根据类型返回对应的上下限（同时支持驼峰和下划线格式）
                if (type === 'highQuality') {
                    const min = matchedConfig.materialQualityMin !== undefined
                        ? matchedConfig.materialQualityMin
                        : (matchedConfig.material_quality_min !== undefined ? matchedConfig.material_quality_min : 0);
                    const max = matchedConfig.materialQualityMax !== undefined
                        ? matchedConfig.materialQualityMax
                        : (matchedConfig.material_quality_max !== undefined ? matchedConfig.material_quality_max : 0.01);
                    return { min: min, max: max };
                } else {
                    // firstRelease
                    const min = matchedConfig.materialDiversityMin !== undefined
                        ? matchedConfig.materialDiversityMin
                        : (matchedConfig.material_diversity_min !== undefined ? matchedConfig.material_diversity_min : 0);
                    const max = matchedConfig.materialDiversityMax !== undefined
                        ? matchedConfig.materialDiversityMax
                        : (matchedConfig.material_diversity_max !== undefined ? matchedConfig.material_diversity_max : 0.01);
                    return { min: min, max: max };
                }
            }

            // 如果没有找到匹配的配置，使用默认值
            return { min: 0, max: 0.01 };
        },
        formatAmount(value) {
            const absValue = Math.abs(value);
            let unit = '元';
            let divisor = 1;

            if (absValue >= 100000000) {
                unit = '亿元';
                divisor = 100000000;
            } else if (absValue >= 10000) {
                unit = '万元';
                divisor = 10000;
            }

            return `${(value / divisor).toFixed(2)}${unit}`;
        },
        // 计算变化值的方法
        calculateChange(current, prev) {
            if (prev === 0) {
                if (current === 0) return { amount: '0.00元', percent: '(0.00%)', isPositive: true };
                return { amount: `+${this.formatChangeAmount(current)}`, percent: '(+100.00%)', isPositive: true };
            }
            const diff = current - prev;
            const percent = Math.abs((diff / prev) * 100).toFixed(2);
            const sign = diff >= 0 ? '+' : '-';
            return {
                amount: `${sign}${this.formatChangeAmount(Math.abs(diff))}`,
                percent: `(${sign}${percent}%)`,
                isPositive: diff >= 0
            };
        },
        formatChangeAmount(value) {
            const absValue = Math.abs(value);
            let unit = '元';
            let divisor = 1;

            if (absValue >= 100000000) {
                unit = '亿元';
                divisor = 100000000;
            } else if (absValue >= 10000) {
                unit = '万元';
                divisor = 10000;
            }

            return `${(value / divisor).toFixed(2)}${unit}`;
        },
        // 移除 getPreviousPeriod, calculateChange 等
        // 切换诊断结论收起/展开状态
        toggleDiagnosticCollapse() {
            this.isDiagnosticCollapsed = !this.isDiagnosticCollapsed;
        },
        // 切换卡片展开/收起（数据已预加载，直接展开）
        toggleCardExpand(cardId) {
            this.$set(this.expandedCards, cardId, !this.expandedCards[cardId]);
        },
        // 格式化季度/月份参数（保持月份原样）
        formatQuarter(period) {
            if (period.includes('月')) {
                return period;
            }
            return period.replace('Q', '');
        },
        // 加载卡片详情列表
        async loadCardDetailList(cardId) {
            this.$set(this.cardDetailLoading, cardId, true);

            // 汽车政策：直接使用已加载的list数据
            if (this.selectedType === '汽车政策') {
                let listData = [];
                if (['highQuality', 'firstRelease', 'live'].includes(cardId)) {
                    // 优质、首发、直播使用素材明细列表
                    listData = this.carPolicyMaterialDetailList || [];
                } else if (cardId === 'prepaid') {
                    // 预付指标使用业绩明细列表
                    listData = this.carPolicyPerformanceDetailList || [];
                } else if (['performance', 'bidding'].includes(cardId)) {
                    // 业绩消耗、竞价基础返点使用核算明细列表
                    listData = this.carPolicyCalcDetailList || [];
                }
                this.$set(this.cardDetailList, cardId, listData);
                this.$set(this.cardDetailLoading, cardId, false);
                return;
            }

            // 综代政策：调用接口获取数据
            const isMaterialCard = ['highQuality', 'firstRelease', 'live'].includes(cardId);
            const isPrepaidCard = cardId === 'prepaid';
            const apiPath = isMaterialCard
                ? '/douyinRebateMaterialDetail/listNotPage'
                : isPrepaidCard
                    ? '/douyinRebatePerformanceDetail/listNotPage'
                    : '/douyinRebateCalcDetail/listNotPage';

            const params = isMaterialCard
                ? {
                    agentGroupName: this.selectedCompany,
                    statPeriod: this.getStatPeriod(),
                    rebateCalcPolicyType: this.getPolicyType()
                }
                : isPrepaidCard
                    ? {
                        agentGroupName: this.selectedCompany,
                        rebateCalcAttributionYear: parseInt(this.selectedYear),
                        rebateCalcAttributionMonth: this.getMonthNumber() + '月',
                        monthRebateCalcPolicyType: this.selectedType
                    }
                    : {
                        agentGroupName: this.selectedCompany,
                        rebateCalcAttributionQuarter: this.formatQuarter(this.selectedPeriod),
                        rebateCalcAttributionYear: parseInt(this.selectedYear),
                        ...(this.selectedType === '汽车政策' ? { monthRebateCalcPolicyType: this.selectedType } : {})
                    };

            try {
                const res = await getAction(apiPath, params);
                let listData = [];
                if (res.result) {
                    if (Array.isArray(res.result)) {
                        listData = res.result;
                    } else if (res.result.records) {
                        listData = res.result.records;
                    } else if (res.result.list) {
                        listData = res.result.list;
                    }
                }
                this.$set(this.cardDetailList, cardId, listData);
            } catch (error) {
                this.$message.error('加载详情数据失败');
                console.error('加载详情数据错误:', error);
                this.$set(this.cardDetailList, cardId, []);
            } finally {
                this.$set(this.cardDetailLoading, cardId, false);
            }
        },
        getStatPeriod() {
            const month = this.selectedPeriod.replace('月', '');
            const monthNumber = parseInt(month, 10);
            const paddedMonth = Number.isNaN(monthNumber) ? '01' : monthNumber.toString().padStart(2, '0');
            return `${this.selectedYear}-${paddedMonth}`;
        },
        getMonthNumber() {
            const month = this.selectedPeriod.replace('月', '');
            const monthNumber = parseInt(month, 10);
            return Number.isNaN(monthNumber) ? '1' : monthNumber.toString();
        },
        getPolicyType() {
            const policyMap = {
                '综代政策': 'NORMAL_POLICY',
                '汽车政策': 'CAR_POLICY',
                '优代政策': 'EXCLUSIVE_POLICY'
            };
            return policyMap[this.selectedType] || 'NORMAL_POLICY';
        },
        // 获取表格列配置（铺满全部字段）
        getTableColumns(cardId) {
            const listData = this.cardDetailList[cardId] || [];
            if (!listData.length) return [];

            const excludeFields = [
                'id',
                'createBy',
                'createTime',
                'updateBy',
                'updateTime',
                'delFlag',
                'channelName',
                'channelPlatform',
                'channelSign',
                'douyinRebateTaskId',
                'rebateCalcAttributionYear',
                'rebateCalcAttributionQuarter'
            ];

            const firstRow = listData[0];
            return Object.keys(firstRow)
                .filter(key => !excludeFields.includes(key))
                .map((key) => {
                    return {
                        title: this.formatColumnTitle(key),
                        dataIndex: key,
                        key,
                        ellipsis: true,
                        customRender: (text) => {
                            if (text === null || text === undefined) return '-';
                            if (Array.isArray(text)) {
                                return text.length ? text.join(', ') : '-';
                            }
                            if (typeof text === 'number') {
                                if (this.isAmountField(key)) {
                                    return this.formatAmount(text);
                                }
                                return text.toLocaleString();
                            }
                            return text;
                        }
                    };
                });
        },
        // 判断字段是否为金额/消耗类
        isAmountField(key) {
            const lower = key.toLowerCase();
            return lower.includes('amount') ||
                lower.includes('cost') ||
                lower.includes('rebate') ||
                lower.includes('performance');
        },
        // 字段名映射
        formatColumnTitle(key) {
            const titleMap = {
                id: '主键ID',
                adIds: '计划ID数组',
                createBy: '创建人',
                createTime: '创建日期',
                updateBy: '更新人',
                updateTime: '更新日期',
                delFlag: '删除标识',
                channelName: '渠道名称',
                channelPlatform: '平台标识',
                channelSign: '渠道标识',
                channelSalesmanDepartment3Name: '渠道三级部门',
                douyinRebateTaskId: '返点任务ID',
                rebateCalcAttributionYear: '结算年份',
                rebateCalcAttributionQuarter: '结算周期',
                agent_id: '代理商账户ID',
                agentGroupName: '代理商集团名称',
                agent_group_name: '代理商集团名称',
                agentCompanyName: '代理商公司名称',
                agent_company_name: '代理商公司名称',
                agentCompanyId: '代理商公司ID',
                agent_company_id: '代理商公司ID',
                agent_sale_name: '代理商销售',
                agentSaleName: '代理商销售',
                contractSerial: '商务协议编号',
                contract_serial: '商务协议编号',
                period: '年月',
                ipType: 'IP类型',
                ip_type: 'IP类型',
                specBrandProduct: '品牌特定产品类型',
                spec_brand_product: '品牌特定产品类型',
                isCalCustomerExpansionCostRebate: '是否结算拓新返点',
                is_cal_customer_expansion_cost_rebate: '是否结算拓新返点',
                monthRebateCalcPolicyType: '月度政策类型',
                month_rebate_calc_policy_type: '月度政策类型',
                rebateCalcPolicyType: '政策类型',
                rebate_calc_policy_type: '政策类型',
                monthRebateCalcTypeShow: '月度披露标签',
                month_rebate_calc_type_show: '月度披露标签',
                rebateCalcTypeShow: '季度披露标签',
                rebate_calc_type_show: '季度披露标签',
                advertiser_id: '广告主ID',
                advertiser_name: '广告主名称',
                operator_tag: '运营标签',
                rebate_calc_settlement_stats_type: '结算行业统计类型',
                rebate_calc_first_industry_name: '一级结算行业',
                rebate_calc_second_industry_name: '二级结算行业',
                rebate_calc_external_industry_category: '竞价分类',
                customer_name: '客户名称',
                optimizer_name: '代理商优化师',
                agent_sale_name: '代理商销售',
                second_ad_agent_id: '二代代理商账户ID',
                is_live_rebate_type: '是否直播返点',
                material_id: '素材ID',
                material_tags: '素材属性标签',
                is_cut_similar_material: '是否同质化挤压',
                isCutSimilarMaterial: '是否同质化挤压',
                is_in_similar_material_queue: '是否同质化排队',
                isInSimilarMaterialQueue: '是否同质化排队',
                ad_ids: '计划ID数组',
                cdp_promotion_ids: '广告ID数组',
                cdpPromotionIds: '广告ID数组',
                app_key: '投放平台',
                appKey: '投放平台',
                is_cal_high_material_cost_rebate: '是否计算优质消耗返点',
                isCalHighMaterialCostRebate: '是否计算优质消耗返点',
                invalid_high_material_cost_reason: '优质消耗剔除原因',
                invalidHighMaterialCostReason: '优质消耗剔除原因',
                high_material_cost_rebate_rate: '优质消耗返点比例',
                highMaterialCostRebateRate: '优质消耗返点比例',
                is_cal_first_effective_material_cost_rebate: '是否计算首发消耗返点',
                isCalFirstEffectiveMaterialCostRebate: '是否计算首发消耗返点',
                invalid_first_effective_material_cost_reason: '首发消耗剔除原因',
                invalidFirstEffectiveMaterialCostReason: '首发消耗剔除原因',
                first_effective_material_cost_rebate_rate: '首发消耗返点比例',
                firstEffectiveMaterialCostRebateRate: '首发消耗返点比例',
                is_cal_live_material_rebate: '是否计算直播返点',
                isCalLiveMaterialRebate: '是否计算直播返点',
                live_cost_rebate_rate: '直播返点比例',
                liveCostRebateRate: '直播返点比例',
                performanceCost: '业绩消耗',
                performance_cost: '业绩消耗',
                advertiserId: '广告主ID',
                advertiserName: '广告主名称',
                agentGroupName: '代理商集团名称',
                agentId: '代理商账户ID',
                agentSaleName: '代理商销售',
                customerName: '客户名称',
                optimizerName: '代理商优化师',
                operatorTag: '运营标签',
                costSource: '消耗来源名称',
                creditCost: '授信消耗',
                prepayCost: '预付消耗',
                projectName: '项目名称',
                projectSerial: '项目编号',
                productLineName: '招商项目产品线',
                productSubLineName: '招商项目子产品线',
                merchantsProjectName: '招商项目名称',
                merchNo: '招商项目编号',
                intentionName: '招商意向名称',
                intentionNo: '招商意向编号',
                pricingCategory: '广告类型名称',
                customerId: '客户ID',
                subjectName: '我方主体',
                materialId: '素材ID',
                materialTags: '素材属性标签',
                rebateCalcPolicyType: '政策类型',
                rebateCalcSettlementStatsType: '结算行业统计类型',
                rebateCalcFirstIndustryName: '一级结算行业',
                rebateCalcSecondIndustryName: '二级结算行业',
                rebateCalcExternalIndustryCategory: '竞价分类',
                monthRebateCalcPolicyType: '月度返点核算政策类型',
                monthRebateCalcFirstIndustryName: '月度结算行业一级名称',
                monthRebateCalcSecondIndustryName: '月度结算行业二级名称',
                monthRebateCalcExternalIndustryCategory: '月度结算行业外部分类',
                monthRebateCalcSettlementStatsType: '月度结算行业统计类型',
                monthOperationTag: '月度核算运营标签',
                monthIsInvalidCost: '月度是否剔除返点',
                monthInvalidCostReason: '月度剔除返点原因',
                invalidCostReason: '剔除返点原因',
                isInvalidCost: '是否剔除返点',
                monthAppealFirstIndustryName: '月度汽车政策一级行业',
                monthAppealSecondIndustryName: '月度汽车政策二级行业',
                appealFirstIndustryName: '汽车政策一级行业',
                appealSecondIndustryName: '汽车政策二级行业',
                rebateValidClistName: '是否特殊客户',
                specBrandProduct: '品牌特定产品类型',
                specialType: '特殊资源类型',
                violationType: '违规类型',
                costSourceName: '消耗来源名称',
                isCalCustomerExpansionCostRebate: '是否结算品牌客户拓新返点',
                contractSerial: '合同编号',
                contract_serial: '合同编号',
                projectName: '项目名称',
                projectSerial: '项目编号',
                cartId: '排期ID',
                cartName: '排期名称',
                appName: '投放产品名称',
                rebateMaterialTaskId: '抖音返点明点化素材任务ID',
                secondAdAgentId: '二代代理商账户ID',
                statPeriod: '年月',
                invalidFirstEffectiveMaterialCostRateDenominatoReason: '首发占比分母剔除原因',
                invalidFirstEffectiveMaterialCostRateMolecularReason: '首发占比分子剔除原因',
                invalidFirstEffectiveMaterialCostReason: '首发消耗剔除原因',
                invalidHighMaterialCostRateDenominatoReason: '优质占比分母剔除原因',
                invalidHighMaterialCostRateMolecularReason: '优质占比分子剔除原因',
                isCalFirstEffectiveMaterialCostRateDenominato: '是否作为首发占比分母',
                isCalFirstEffectiveMaterialCostRateMolecular: '是否作为首发占比分子',
                isCalHighMaterialCostRateDenominato: '是否作为优质占比分母',
                isCalHighMaterialCostRateMolecular: '是否作为优质占比分子',
                isCalHighMaterialCostRateDenominator: '是否作为优质占比分母',
                isCalHighMaterialCostRateMolecular: '是否作为优质占比分子',
                isCalFirstEffectiveMaterialCostRateDenominator: '是否作为首发占比分母',
                isCalFirstEffectiveMaterialCostRateMolecular: '是否作为首发占比分子',
                bidBaseReabteAmount: '竞价基础返点金额',
                bid_base_reabte_amount: '竞价基础返点金额',
                bidTypeRebateNormal: '竞价资金类型返点(常规)',
                bid_type_rebate_normal: '竞价资金类型返点(常规)',
                bidRiskControl: '竞价风控返点',
                bid_risk_control: '竞价风控返点',
                quarterBrandBaseRebateAmount: '品牌基础返点',
                quarter_brand_base_rebate_amount: '品牌基础返点',
                brandSpecialProductRebateAmount: '品牌特定产品返点',
                brand_special_product_rebate_amount: '品牌特定产品返点',
                ipRebateAmount: 'IP返点',
                ip_rebate_amount: 'IP返点',
                brandCustomerExpansionRebateAmount: '品牌客户拓新返点',
                brand_customer_expansion_rebate_amount: '品牌客户拓新返点',
                vehicleFirstEffectiveCostRebateAmount: '竞价首发素材占比返点',
                vehicle_first_effective_cost_rebate_amount: '竞价首发素材占比返点',
                vehicleHighCostRebateAmount: '竞价优质素材占比返点',
                vehicle_high_cost_rebate_amount: '竞价优质素材占比返点',
                otherRebate: '其他返点',
                other_rebate: '其他返点',
                normalQuarterBaseMetricRebateAmount: '季度累计竞价基础返点',
                normal_quarter_base_metric_rebate_amount: '季度累计竞价基础返点',
                agentGroupType: '代理商集团类型',
                agentId: '代理商ID',
                agentName: '代理商名称',
                monthRebateCalcType: '月度披露标签编码',
                month_rebate_calc_type: '月度披露标签编码',
                rebateCalcAttributionMonth: '结算月份',
                rebate_calc_attribution_month: '结算月份',
                cost: '素材消耗',
                isCalHighMaterialCostRateMolecular: '是否作为优质占比分子',
                is_cal_high_material_cost_rate_molecular: '是否作为优质占比分子',
                invalidHighMaterialCostRateMolecularReason: '优质占比分子剔除原因',
                invalid_high_material_cost_rate_molecular_reason: '优质占比分子剔除原因',
                isCalHighMaterialCostRateDenominator: '是否作为优质占比分母',
                is_cal_high_material_cost_rate_denominator: '是否作为优质占比分母',
                is_cal_high_material_cost_rate_denominato: '是否作为优质占比分母',
                invalidHighMaterialCostRateDenominatorReason: '优质占比分母剔除原因',
                invalid_high_material_cost_rate_denominator_reason: '优质占比分母剔除原因',
                invalid_high_material_cost_rate_denominato_reason: '优质占比分母剔除原因',
                highMaterialCostRateMolecular: '优质占比分子',
                high_material_cost_rate_molecular: '优质占比分子',
                highMaterialCostRateDenominator: '优质占比分母',
                high_material_cost_rate_denominator: '优质占比分母',
                high_material_cost_rate_denominato: '优质占比分母',
                highMaterialCostRateMetric: '优质素材消耗占比',
                high_material_cost_rate_metric: '优质素材消耗占比',
                highMaterialCostRateTargetValue: '优质占比目标值',
                high_material_cost_rate_target_value: '优质占比目标值',
                isCalFirstEffectiveMaterialCostRateMolecular: '是否作为首发占比分子',
                is_cal_first_effective_material_cost_rate_molecular: '是否作为首发占比分子',
                invalidFirstEffectiveMaterialCostRateMolecularReason: '首发占比分子剔除原因',
                invalid_first_effective_material_cost_rate_molecular_reason: '首发占比分子剔除原因',
                isCalFirstEffectiveMaterialCostRateDenominator: '是否作为首发占比分母',
                is_cal_first_effective_material_cost_rate_denominator: '是否作为首发占比分母',
                is_cal_first_effective_material_cost_rate_denominato: '是否作为首发占比分母',
                invalidFirstEffectiveMaterialCostRateDenominatorReason: '首发占比分母剔除原因',
                invalid_first_effective_material_cost_rate_denominator_reason: '首发占比分母剔除原因',
                invalid_first_effective_material_cost_rate_denominato_reason: '首发占比分母剔除原因',
                firstEffectiveMaterialCostRateMolecular: '首发占比分子',
                first_effective_material_cost_rate_molecular: '首发占比分子',
                firstEffectiveMaterialCostRateDenominator: '首发占比分母',
                firstEffectiveMaterialCostRateDenominato: '首发占比分母',
                first_effective_material_cost_rate_denominator: '首发占比分母',
                first_effective_material_cost_rate_denominato: '首发占比分母',
                firstEffectiveMaterialCostRateMetric: '首发素材消耗占比',
                first_effective_material_cost_rate_metric: '首发素材消耗占比',
                firstEffectiveMaterialCostRateTargetValue: '首发占比目标值',
                first_effective_material_cost_rate_target_value: '首发占比目标值',
                high_cost_rebate_amount: '优质素材消耗返点金额',
                highCostRebateAmount: '优质素材消耗返点金额',
                first_effective_cost_rebate_amount: '首发素材消耗返点金额',
                firstEffectiveCostRebateAmount: '首发素材消耗返点金额',
                live_cost_rebate_amount: '直播消耗返点金额',
                liveCostRebateAmount: '直播消耗返点金额',
                firstEffectiveMaterialCostRateMolecular: '首发占比分子',
                firstEffectiveMaterialCostRateDenominator: '首发占比分母',
                highMaterialCostRateMolecular: '优质占比分子',
                highMaterialCostRateDenominato: '优质占比分母',
                highMaterialCostRateMetric: '优质素材消耗占比',
                highMaterialCostRateTargetValue: '优质占比目标值',
                firstEffectiveMaterialCostRateMetric: '首发素材消耗占比',
                firstEffectiveMaterialCostRateTargetValue: '首发占比目标值',
                highMaterialCostRateRate: '优质素材消耗占比',
                isCalLiveMaterialRebate: '是否参与直播返点',
                isLiveRebateType: '是否直播返点类型'
            };
            if (titleMap[key]) return titleMap[key];
            return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
        },
        getCardFormula(cardId) {
            // 根据政策类型返回不同的指标说明
            const isCarPolicy = this.selectedType === '汽车政策';

            const formulaMap = {
                firstRelease: isCarPolicy ? {
                    title: '首发消耗占比计算方式',
                    formula: '返点金额 = 返点比例 × 业绩消耗汇总',
                    explain: '1. 按政策粒度（运营标签&结算行业统计类型&结算二级行业&竞价分类&代理集团）分组，获取组的指标值和目标值。2. 按二级行业+运营标签汇总业绩消耗。3. 计算返点比例：优先级1-剔除汽车厂商(返点=0)；优先级2-指标和目标为0/null且包含直播(返点=上限)；优先级3-根据指标和目标值计算：指标>=目标(返点=上限)，指标<目标(返点=下限+(上限-下限)×指标/目标)，指标和目标都为0(返点=0)。4. 返点金额 = 返点比例 × 业绩消耗汇总。'
                } : {
                    title: '首发素材消耗返点计算方式',
                    formula: '首发消耗 = Σ[IF(is_cal_first_effective_material_cost_rebate = \'YES\', performance_cost, 0) × first_effective_material_cost_rebate_rate]',
                    explain: '仅对参与首发返点的业绩消耗乘以首发返点比例，并对所有素材求和。'
                },
                highQuality: isCarPolicy ? {
                    title: '优质消耗占比计算方式',
                    formula: '返点金额 = 返点比例 × 业绩消耗汇总',
                    explain: '1. 按政策粒度（运营标签&结算行业统计类型&结算二级行业&竞价分类&代理集团）分组，获取组的指标值和目标值。2. 按二级行业+运营标签汇总业绩消耗。3. 计算返点比例：优先级1-剔除汽车厂商(返点=0)；优先级2-指标和目标为0/null且包含直播(返点=上限)；优先级3-根据指标和目标值计算：指标>=目标(返点=上限)，指标<目标(返点=下限+(上限-下限)×指标/目标)，指标和目标都为0(返点=0)。4. 返点金额 = 返点比例 × 业绩消耗汇总。'
                } : {
                    title: '优质素材消耗返点计算方式',
                    formula: '优质消耗 = Σ[IF(is_cal_high_material_cost_rebate = \'YES\', performance_cost, 0) × high_material_cost_rebate_rate]',
                    explain: '筛选被认定为优质素材的数据，再用业绩消耗乘以优质返点比例后累计。'
                },
                performance: {
                    title: '业绩消耗计算方式',
                    formula: '业绩消耗 = Σ(performance_cost)',
                    explain: '在同政策、同年月、同代理集团的条件下，去除标签为剔除等数据的业绩消耗求和。'
                },
                bidding: {
                    title: '竞价基础返点计算方式',
                    formula: '竞价基础返点 = Σ(bid_base_reabte_amount)',
                    explain: '在同政策、同年月、同代理集团的条件下，对竞价基础返点金额进行求和。'
                },
                live: isCarPolicy ? null : {
                    title: '直播消耗返点计算方式',
                    formula: '直播消耗 = Σ[IF(is_cal_live_material_rebate = \'YES\', performance_cost, 0) × live_cost_rebate_rate]',
                    explain: '仅统计参与直播返点的素材，将其业绩消耗乘以直播返点比例后汇总。'
                },
                prepaid: {
                    title: '预付指标测算方式',
                    formula: '预付指标 ≈ (同政策 + 同年月 + 同代理集团口径的预付消耗总和) × 0.8%',
                    explain: '以选定政策、年月与代理集团为过滤条件，汇总该粒度下的预付消耗，并按 0.8% 比例估算指标。'
                }
            };
            return formulaMap[cardId] || null;
        },
        // 处理卡片点击（保留用于模态框，如果需要）
        handleCardClick(event, cardData) {
            this.selectedCard = cardData;
            this.showModal = true;
        },
        // 关闭弹窗
        closeModal() {
            this.showModal = false;
            this.selectedCard = null;
        },
        // 处理导出
        handleExport(card) {
            this.$message.info(`正在导出 ${card.name} 的数据...`);
            // TODO: 实现导出功能
        },
        // 处理分享
        handleShare(card) {
            this.$message.info(`正在分享 ${card.name} 的数据...`);
            // TODO: 实现分享功能
        },
        // 获取标签文字
        getTagText(type) {
            const tagMap = {
                'total': '合计',
                'basic': '基础模块',
                'operation': '运营模块',
                'risk': '风控模块',
                'capital': '资金占用模块'
            };
            return tagMap[type] || '未知';
        }
    }
}
</script>

<style scoped>
.rebate-dashboard {
    background: #F5F7FA;
    min-height: 100vh;
    padding: 0;
}

/* 顶部导航栏 */
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
    font-weight: 700;
    color: #272E3B;
    margin: 0;
}

.header-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
}

.update-time {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #86909C;
    font-size: 14px;
}

.refresh-link {
    color: #165DFF;
    padding: 0;
    height: auto;
}

.refresh-link:hover {
    color: #4080FF;
}

.filter-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.filter-select {
    min-width: 100px;
}

.company-select {
    min-width: 220px;
}

.dashboard-main {
    max-width: 100%;
    margin: 0 auto;
    padding: 24px;
    border: 1px solid #E5E6EB;
    border-radius: 12px;
    margin-top: 24px;
    margin-bottom: 24px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
}

.nav-tabs {
    display: flex;
    border-bottom: 1px solid #E5E6EB;
    margin-bottom: 24px;
    background: white;
    padding: 0 24px;
    border-radius: 8px 8px 0 0;
}

.tab-item {
    padding: 12px 20px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #86909C;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
}

.tab-item.active {
    color: #165DFF;
    border-bottom-color: #165DFF;
}

/* 诊断结论卡片 */
.diagnostic-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    position: relative;
}

.diagnostic-card.is-loading {
    pointer-events: none;
}

.diagnostic-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 12px;
}

.diagnostic-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.diagnostic-title {
    font-size: 18px;
    font-weight: 600;
    color: #272E3B;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
}

.diagnostic-icon {
    color: #165DFF;
    font-size: 20px;
}

.collapse-btn {
    color: #86909C;
    padding: 0;
    height: auto;
    border: none;
    background: none;
}

.collapse-btn:hover {
    color: #165DFF;
}

.diagnostic-content {
    transition: all 0.3s ease;
    overflow: hidden;
    max-height: 500px;
    opacity: 1;
}

.diagnostic-content.collapsed {
    max-height: 0;
    opacity: 0;
    margin: 0;
    padding: 0;
}

.analysis-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
    border: 1px solid #E5E6EB;
    position: relative;
}

.analysis-section.is-loading {
    pointer-events: none;
}

.section-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 12px;
}

.diagnosis-section {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #E5E6EB;
}

.diagnosis-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.diagnosis-section-title {
    font-size: 15px;
    font-weight: 600;
    color: #272E3B;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.section-icon {
    color: #165DFF;
    font-size: 16px;
}

.trend-summary {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.trend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    padding: 12px;
    background: #F5F7FA;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.trend-item:hover {
    background: #EFF2F5;
}

.trend-label {
    color: #86909C;
    min-width: 80px;
}

.trend-value {
    color: #272E3B;
    font-weight: 500;
}

.trend-up {
    color: #52C41A;
    font-weight: 600;
}

.trend-down {
    color: #FF4D4F;
    font-weight: 600;
}

.factors-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.factor-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    margin-bottom: 8px;
    background: #F5F7FA;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.factor-item:hover {
    background: #EFF2F5;
    transform: translateX(4px);
}

.factor-rank {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #165DFF;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
}

.factor-item:nth-child(1) .factor-rank {
    background: #FF4D4F;
}

.factor-item:nth-child(2) .factor-rank {
    background: #FAAD14;
}

.factor-item:nth-child(3) .factor-rank {
    background: #52C41A;
}

.factor-content {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.factor-name {
    color: #272E3B;
    font-weight: 500;
}

.insights-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.insight-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    background: #F8FBFF;
    border-left: 3px solid #165DFF;
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.6;
    color: #4E5969;
}

.insight-item .anticon {
    font-size: 16px;
    margin-top: 2px;
    flex-shrink: 0;
}

.insight-positive {
    color: #52C41A;
}

.insight-warning {
    color: #FAAD14;
}

.insight-info {
    color: #165DFF;
}

.insight-excellent {
    color: #722ED1;
}

.positive-value {
    color: #52C41A;
    font-weight: 600;
}

.negative-value {
    color: #FF4D4F;
    font-weight: 600;
}

/* 数据卡片列表 */
.data-cards-list {
    position: relative;
}

.data-cards-list.is-loading {
    pointer-events: none;
}

.list-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 12px;
}

.cards-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.card-list-item {
    background: white;
    border-radius: 12px;
    border: 1px solid #E5E6EB;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
    cursor: pointer;
    overflow: hidden;
}

.card-list-item:hover {
    border-color: #C9CDD4;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-list-item.expanded {
    border-color: #165DFF;
    box-shadow: 0 4px 16px rgba(22, 93, 255, 0.15);
}

.card-item-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
}

.card-item-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
}

.card-item-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.card-item-name {
    font-size: 14px;
    color: #86909C;
    font-weight: 400;
}

.card-item-value-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.card-item-value {
    font-size: 20px;
    font-weight: 700;
    color: #272E3B;
}

.card-item-change {
    font-size: 14px;
    font-weight: 500;
}

.card-item-change.positive {
    color: #FF4D4F;
}

.card-item-change.negative {
    color: #52C41A;
}

.expand-icon {
    color: #86909C;
    font-size: 16px;
    transition: transform 0.3s ease;
    flex-shrink: 0;
}

.card-list-item.expanded .expand-icon {
    transform: rotate(180deg);
}

.card-item-detail {
    border-top: 1px solid #E5E6EB;
    background: #F8FBFF;
    overflow: hidden;
}

.detail-content {
    padding: 20px;
}

.detail-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.detail-value-section {
    margin-bottom: 20px;
    min-width: 220px;
}

.detail-formula-inline {
    flex: 1;
    min-width: 260px;
    background: transparent;
    border: none;
    padding: 0;
    margin-top: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.detail-value {
    font-size: 32px;
    font-weight: 700;
    color: #272E3B;
    margin-bottom: 8px;
}

.detail-change {
    font-size: 16px;
    font-weight: 500;
}

.detail-change.positive {
    color: #FF4D4F;
}

.detail-change.negative {
    color: #52C41A;
}

.detail-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #E5E6EB;
}

.detail-info {
    margin-top: 20px;
}

.detail-formula {
    margin-top: 6px;
    margin-left: 10px;
    /* padding: 16px; */
}

.detail-formula-text {
    color: #4E5969;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 4px;
}

.detail-info-title {
    font-size: 16px;
    font-weight: 600;
    color: #4E5969;
    margin-bottom: 12px;
}

.detail-info-text {
    color: #86909C;
    line-height: 1.6;
    margin-bottom: 8px;
    font-size: 14px;
}

.detail-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 0;
}

.detail-table-wrapper {
    margin-top: 16px;
    max-height: 320px;
    overflow: auto;
    border: 1px solid #EFF0F2;
    border-radius: 8px;
}

.detail-table-wrapper :deep(.ant-table) {
    font-size: 13px;
}

.detail-table-wrapper :deep(.ant-table-thead > tr > th) {
    background: #F5F7FA;
    font-weight: 600;
    color: #272E3B;
    border-bottom: 2px solid #E5E6EB;
}

.detail-table-wrapper :deep(.ant-table-tbody > tr > td) {
    border-bottom: 1px solid #F0F0F0;
}

.detail-table-wrapper :deep(.ant-table-tbody > tr:hover > td) {
    background: #F5F7FA;
}

.detail-empty {
    padding: 40px 0;
    text-align: center;
}

/* 卡片展开动画 */
.card-detail-enter-active,
.card-detail-leave-active {
    transition: all 0.3s ease;
    max-height: 500px;
}

.card-detail-enter,
.card-detail-leave-to {
    max-height: 0;
    opacity: 0;
    padding-top: 0;
    padding-bottom: 0;
}

.card-detail-enter-to,
.card-detail-leave {
    max-height: 500px;
    opacity: 1;
}

/* 数据卡片网格（保留备用） */
.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
}

.data-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    position: relative;
    transition: all 0.3s ease;
    cursor: pointer;
    border: 1px solid #E5E6EB;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
    min-height: 160px;
    overflow: hidden;
}

.data-card:hover {
    transform: translateY(-4px);
    border-color: #C9CDD4;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
}

.data-card.is-loading {
    pointer-events: none;
}

.card-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 12px;
}

/* 卡片头部 */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}

.card-title {
    font-size: 14px;
    color: #86909C;
    font-weight: 400;
    margin: 0 0 8px 0;
}

.card-value {
    font-size: 28px;
    font-weight: 700;
    color: #272E3B;
    line-height: 1.2;
    margin: 0;
}

.card-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
}

.total-icon {
    background: rgba(114, 46, 209, 0.1);
    color: #722ED1;
}

.primary-icon {
    background: rgba(22, 93, 255, 0.1);
    color: #165DFF;
}

.operation-icon {
    background: rgba(54, 207, 201, 0.1);
    color: #36CFC9;
}

.live-icon {
    background: rgba(82, 196, 26, 0.1);
    color: #52C41A;
}

.capital-icon {
    background: rgba(250, 173, 20, 0.1);
    color: #FAAD14;
}

/* 卡片变化行 */
.card-change-row {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 12px;
}

.card-change-row.positive {
    color: #52C41A;
}

.card-change-row.negative {
    color: #FF4D4F;
}

/* 卡片底部 */
.card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid #E5E6EB;
    font-size: 12px;
    color: #86909C;
    margin-top: auto;
}

.card-footer .anticon {
    font-size: 12px;
}

/* 卡片类型样式 */
.total-card {
    border-left: 4px solid #722ED1;
}

.primary-card {
    border-left: 4px solid #165DFF;
}

.operation-card {
    border-left: 4px solid #36CFC9;
}

.operation-card.warning {
    border-left-color: #FF4D4F;
}

.capital-card {
    border-left: 4px solid #FAAD14;
}

/* 模态框样式 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    will-change: opacity;
}

.modal-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    will-change: transform, opacity;
    transform-origin: center;
}

/* 模态框过渡动画 */
.modal-enter-active {
    transition: opacity 0.2s ease-out;
}

.modal-leave-active {
    transition: opacity 0.15s ease-in;
}

.modal-enter-active .modal-container {
    animation: modalScaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active .modal-container {
    animation: modalScaleOut 0.15s ease-in;
}

.modal-enter,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-to,
.modal-leave {
    opacity: 1;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #E5E6EB;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
}

.modal-title {
    font-size: 20px;
    font-weight: 700;
    color: #272E3B;
    margin: 0;
}

.close-btn {
    color: #86909C;
    font-size: 18px;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
}

.close-btn:hover {
    color: #FF4D4F;
}

.modal-content {
    padding: 24px;
}

.modal-value-section {
    margin-bottom: 24px;
}

.modal-value {
    font-size: 36px;
    font-weight: 700;
    color: #272E3B;
    margin-bottom: 8px;
}

.modal-change {
    font-size: 16px;
    font-weight: 500;
}

.modal-change.positive {
    color: #52C41A;
}

.modal-change.negative {
    color: #FF4D4F;
}

.modal-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #E5E6EB;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #4E5969;
    background: white;
    border: 1px solid #E5E6EB;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    outline: none;
}

.action-btn:hover {
    color: #165DFF;
    border-color: #165DFF;
    background: #F0F5FF;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(22, 93, 255, 0.15);
}

.action-btn:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(22, 93, 255, 0.1);
}

.action-btn .anticon {
    font-size: 14px;
}

.action-btn span {
    line-height: 1;
}

.export-btn:hover {
    color: #52C41A;
    border-color: #52C41A;
    background: #F6FFED;
    box-shadow: 0 2px 8px rgba(82, 196, 26, 0.15);
}

.share-btn:hover {
    color: #722ED1;
    border-color: #722ED1;
    background: #F9F0FF;
    box-shadow: 0 2px 8px rgba(114, 46, 209, 0.15);
}

.modal-details {
    margin-top: 24px;
}

.details-title {
    font-size: 16px;
    font-weight: 600;
    color: #4E5969;
    margin-bottom: 12px;
}

.details-text {
    color: #86909C;
    line-height: 1.6;
    margin-bottom: 8px;
}

/* 动画 */
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes modalScaleIn {
    from {
        transform: scale(0.9);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .cards-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .header-actions {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
}

@media (max-width: 768px) {
    .dashboard-main {
        padding: 16px;
    }

    .trend-summary {
        grid-template-columns: 1fr;
    }

    .cards-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .header-content {
        padding: 12px 16px;
    }

    .title-section {
        margin-bottom: 12px;
    }

    .filter-group {
        width: 100%;
    }

    .filter-select,
    .company-select {
        width: 100% !important;
        min-width: 100%;
    }

    .data-card {
        min-height: 140px;
        padding: 16px;
    }

    .card-value {
        font-size: 24px;
    }

    .card-item-header {
        padding: 12px 16px;
    }

    .card-item-value {
        font-size: 18px;
    }

    .detail-content {
        padding: 16px;
    }

    .detail-value {
        font-size: 28px;
    }

    .modal-container {
        max-width: 100%;
        margin: 0;
    }
}

@media (max-width: 480px) {
    .dashboard-main {
        padding: 12px;
    }

    .card-value {
        font-size: 20px;
    }

    .card-title {
        font-size: 13px;
    }

    .modal-content {
        padding: 16px;
    }

    .modal-value {
        font-size: 28px;
    }
}
</style>