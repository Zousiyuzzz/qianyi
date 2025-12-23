<template>
  <div class="dashboard-container">

    <!-- 关键指标卡片 -->
    <div class="metrics-grid">
      <!-- 总消耗 -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-info">
            <p class="metric-label">总消耗</p>
            <h3 class="metric-value">¥{{ totalConsumeNum.toFixed(3) }}</h3>
          </div>
          <div class="metric-icon">
            <a-icon type="dollar" />
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-indicator" :class="trendDirection">
            <a-icon :type="trendDirection === 'up' ? 'arrow-up' : 'arrow-down'" />
            {{ trendPercentage }}
          </span>
          <span class="trend-label">较对比周期</span>
        </div>
      </div>

      <!-- 现金消耗 -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-info">
            <p class="metric-label">现金消耗</p>
            <h3 class="metric-value">¥{{ (cashDrain || 0).toFixed(3) }}</h3>
          </div>
          <div class="metric-icon">
            <a-icon type="wallet" />
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-indicator" :class="cashDrainTrendDirection">
            <a-icon :type="cashDrainTrendDirection === 'up' ? 'arrow-up' : 'arrow-down'" />
            {{ cashDrainTrendPercentage }}
          </span>
          <span class="trend-label">较对比周期</span>
        </div>
      </div>

      <!-- 新开主体数 -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-info">
            <p class="metric-label">新开主体数</p>
            <h3 class="metric-value">{{ newSubjectNum || 0 }}</h3>
          </div>
          <div class="metric-icon">
            <a-icon type="team" />
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-indicator" :class="newSubjectNumTrendDirection">
            <a-icon :type="newSubjectNumTrendDirection === 'up' ? 'arrow-up' : 'arrow-down'" />
            {{ newSubjectNumTrendPercentage }}
          </span>
          <span class="trend-label">较对比周期</span>
        </div>
      </div>

      <!-- 有花费账户数 -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-info">
            <p class="metric-label">有花费账户数</p>
            <h3 class="metric-value">{{ totalHasConsumeAccountNum }}</h3>
          </div>
          <div class="metric-icon">
            <a-icon type="user-add" />
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-indicator" :class="accountHasConsumeTrendDirection">
            <a-icon :type="accountHasConsumeTrendDirection === 'up' ? 'arrow-up' : 'arrow-down'" />
            {{ accountHasConsumeTrendPercentage }}
          </span>
          <span class="trend-label">较对比周期</span>
        </div>
      </div>
    </div>

    <!-- 图表和明细区域 -->
    <div class="charts-section">
      <!-- 数据对比图表 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">数据对比图表</h3>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-dot current"></span>
              <span class="legend-text">当前周期</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot compare"></span>
              <span class="legend-text">对比周期</span>
            </div>
          </div>
        </div>
        <div class="chart-container">
          <PlatformTotalByDay :dateRange="dateRange"></PlatformTotalByDay>
        </div>
      </div>

      <!-- 渠道消耗明细 -->
      <div class="rank-card">
        <h3 class="rank-title">渠道消耗明细</h3>
        <div class="rank-list">
          <div v-for="(item, index) in channelRankList.slice(0, 7)" :key="index" class="rank-item">
            <div class="rank-info">
              <div class="rank-number" :class="getRankClass(index + 1)">{{ index + 1 }}</div>
              <span class="rank-name">{{ item.name }}</span>
            </div>
            <span class="rank-value">¥{{ formatNumber(item.total) }}</span>
          </div>
        </div>
      </div>

      <!-- 项目消耗明细 -->
      <div class="rank-card">
        <h3 class="rank-title">项目消耗明细</h3>
        <div class="rank-list">
          <div v-for="(item, index) in proRankList.slice(0, 7)" :key="index" class="rank-item">
            <div class="rank-info">
              <div class="rank-number" :class="getRankClass(index + 1)">{{ index + 1 }}</div>
              <span class="rank-name">{{ item.name }}</span>
            </div>
            <span class="rank-value">¥{{ formatNumber(item.total) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 商务消耗明细 -->
    <div class="business-rank-section">
      <h3 class="business-rank-title">商务消耗明细</h3>
      <div class="business-rank-table">
        <table>
          <thead>
            <tr>
              <th>排名</th>
              <th>商务名称</th>
              <th>总消耗</th>
              <th>现金消耗</th>
              <!-- <th>新开主体数</th> -->
              <th>有花费账户数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in busRankList.slice(0, 5)" :key="index">
              <td>
                <div class="rank-number" :class="getRankClass(index + 1)">{{ index + 1 }}</div>
              </td>
              <td>{{ item.name }}</td>
              <td class="amount">¥{{ formatNumber(item.total_charged || 0) }}</td>
              <td class="amount">¥{{ formatNumber(item.cash_drain || 0) }}</td>
              <!-- <td>{{ item.newSubjectNum || 0 }}</td> -->
              <td>{{ item.consumeAccountNum || 0 }}</td>
              <td>
                <button class="detail-button">详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { httpAction } from '@/api/manage';
import RankList from '@/components/chart/RankList';
import PlatformTotalByDay from './components/platformTotalByDay.vue';
import PlatformTotal from './components/platformTotal.vue';

import moment from 'moment';
import { mixinDevice } from '@/utils/mixin.js'

function getYesterday(num = 1) {
  const date = new Date();
  date.setDate(date.getDate() - num);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default {
  name: 'BisnussChart',
  components: {
    RankList,
    PlatformTotalByDay,
    PlatformTotal
  },
  mixins: [mixinDevice],
  props: {
    dateRange: {
      type: Array,
      required: true
    },
    compareDateRange: {
      type: Array,
      required: true
    },
    businessIds: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 加载状态
      topLoading: true,
      pendingTopRequests: 0,
      rankLoading: true,

      // 当前周期数据
      totalConsumeNum: 0,
      totalHasConsumeAccountNum: 0,
      newAccountNum: 0,
      cashDrain: 0,
      newSubjectNum: 0,

      // 对比周期数据
      totalConsumeNumLast: 0,
      totalHasConsumeAccountNumLast: 0,
      newAccountNumLast: 0,
      cashDrainLast: 0,
      newSubjectNumLast: 0,

      // 明细数据
      busRankList: [],
      proRankList: [],
      cusRankList: [],
      salesRankList: [],
      channelRankList: [],

      // API请求配置
      apiRequests: {
        topData: {
          url: '/agentdata/topData',
          method: 'GET',
          params: {}
        },
        rankingData: {
          url: '/agentdata/rankingData',
          method: 'GET',
          params: {}
        }
      }
    };
  },
  computed: {
    trendPercentage() {
      if (this.totalConsumeNumLast === 0) return '0%';
      const change = ((this.totalConsumeNum - this.totalConsumeNumLast) / this.totalConsumeNumLast) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    trendDirection() {
      if (this.totalConsumeNumLast === 0) return 'down';
      return this.totalConsumeNum > this.totalConsumeNumLast ? 'up' : 'down';
    },
    accountHasConsumeTrendPercentage() {
      if (this.totalHasConsumeAccountNumLast === 0) return '0%';
      const change =
        ((this.totalHasConsumeAccountNum - this.totalHasConsumeAccountNumLast) / this.totalHasConsumeAccountNumLast) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    accountHasConsumeTrendDirection() {
      if (this.totalHasConsumeAccountNumLast === 0) return 'down';
      return this.totalHasConsumeAccountNum > this.totalHasConsumeAccountNumLast ? 'up' : 'down';
    },
    newAccountNumTrendPercentage() {
      if (this.newAccountNumLast === 0) return '0%';
      const change = ((this.newAccountNum - this.newAccountNumLast) / this.newAccountNumLast) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    newAccountNumTrendDirection() {
      if (this.newAccountNumLast === 0) return 'down';
      return this.newAccountNum > this.newAccountNumLast ? 'up' : 'down';
    },
    // 现金消耗趋势
    cashDrainTrendPercentage() {
      if (this.cashDrainLast === 0) return '0%';
      const change = ((this.cashDrain - this.cashDrainLast) / this.cashDrainLast) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    cashDrainTrendDirection() {
      if (this.cashDrainLast === 0) return 'down';
      return this.cashDrain > this.cashDrainLast ? 'up' : 'down';
    },
    // 新开主体数趋势
    newSubjectNumTrendPercentage() {
      if (this.newSubjectNumLast === 0) return '0%';
      const change = ((this.newSubjectNum - this.newSubjectNumLast) / this.newSubjectNumLast) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    newSubjectNumTrendDirection() {
      if (this.newSubjectNumLast === 0) return 'down';
      return this.newSubjectNum > this.newSubjectNumLast ? 'up' : 'down';
    },
  },
  created() {
    // 默认日期范围由父组件设置，子组件不再修改，避免重复请求
    // 顶部卡片并行加载两个日期区间的数据
    this.topLoading = true;
    this.pendingTopRequests = 2;
    this.getTopData();
    this.getYesterdayTopData();
    this.getRankList();
  },
  mounted() { },
  watch: {
    dateRange: {
      handler(newVal) {
        if (newVal && newVal.length === 2) {
          this.getRankList();
          this.getTopData();
        }
      },
      deep: true
    },
    compareDateRange: {
      handler(newVal) {
        if (newVal && newVal.length === 2) {
          this.getYesterdayTopData();
        }
      },
      deep: true
    },
    businessIds: {
      handler(newVal) {
        this.getTopData();
        this.getYesterdayTopData();
        this.getRankList();
      }
    }
  },
  methods: {
    sectorClick(p) { },
    /**
     * 顶部数据
     * newAccountNum 新开账户数
     * sumConsume 总消耗
     * consumeAccountNum 有消耗账户数
     */
    getTopData() {
      const requestConfig = this.apiRequests.topData;
      requestConfig.params = {
        beginDate: this.dateRange[0],
        endDate: this.dateRange[1],
        ...(this.businessIds && { channelSign: this.businessIds })
      };

      httpAction(requestConfig.url, requestConfig.params, requestConfig.method)
        .then((res) => {
          if (res.success) {
            this.totalConsumeNum = res.result ? res.result.sumConsume : 0
            this.newAccountNum = res.result ? res.result.newAccountNum : 0
            this.totalHasConsumeAccountNum = res.result ? res.result.consumeAccountNum : 0
            this.cashDrain = res.result ? res.result.cashDrain : 0
            this.newSubjectNum = res.result ? res.result.newSubjectNum : 0
          } else {
            this.$message.warning(res.message);
          }
        })
        .finally(() => {
          this.pendingTopRequests = Math.max(0, this.pendingTopRequests - 1);
          if (this.pendingTopRequests === 0) this.topLoading = false;
        });
    },
    getYesterdayTopData() {
      const requestConfig = this.apiRequests.topData;
      requestConfig.params = {
        beginDate: this.compareDateRange[0],
        endDate: this.compareDateRange[1],
        ...(this.businessIds && { channelSign: this.businessIds })
      };

      httpAction(requestConfig.url, requestConfig.params, requestConfig.method)
        .then((res) => {
          if (res.success) {
            this.totalConsumeNumLast = res.result ? res.result.sumConsume : 0
            this.newAccountNumLast = res.result ? res.result.newAccountNum : 0
            this.totalHasConsumeAccountNumLast = res.result ? res.result.consumeAccountNum : 0
            this.cashDrainLast = res.result ? res.result.cashDrain : 0
            this.newSubjectNumLast = res.result ? res.result.newSubjectNum : 0
          } else {
            this.$message.warning(res.message);
          }
        })
        .finally(() => {
          this.pendingTopRequests = Math.max(0, this.pendingTopRequests - 1);
          if (this.pendingTopRequests === 0) this.topLoading = false;
        });
    },

    getRankList() {
      this.rankLoading = true;
      const requestConfig = this.apiRequests.rankingData;
      requestConfig.params = {
        beginDate: this.dateRange[0],
        endDate: this.dateRange[1],
        ...(this.businessIds && { channelSign: this.businessIds })
      };

      httpAction(requestConfig.url, requestConfig.params, requestConfig.method)
        .then((res) => {
          if (res.success) {
            //项目
            this.proRankList = res.result.proRanking.map(item => {
              return {
                ...item,
                name: item.pro_name,
                total: item.total_charged
              }
            })
            //销售
            this.busRankList = res.result.businessRanking.map(item => {
              return {
                ...item,
                name: item.realname,
                total: item.total_charged
              }
            })
            //渠道
            this.channelRankList = res.result.channelRanking.map(item => {
              return {
                ...item,
                name: item.channel_name,
                total: item.total_charged
              }
            })
          } else {
            this.$message.warning(res.message);
          }
        })
        .catch((error) => {
          // console.log('获取明细数据失败', error)
          this.$message.error('获取明细数据失败');
        })
        .finally(() => {
          this.rankLoading = false;
        });
    },



    // 新增方法
    refreshData() {
      this.getTopData();
      this.getYesterdayTopData();
      this.getRankList();
      this.refreshChart();
    },

    refreshChart() {
      this.$refs.platformTotalByDay.refreshData();
    },

    formatNumber(num) {
      return new Intl.NumberFormat('zh-CN').format(num);
    },

    getRankClass(rank) {
      if (rank >= 1 && rank <= 10) {
        return `rank-${rank}`;
      }
      return 'rank-other';
    }
  },
};
</script>

<style lang="less" scoped>
.dashboard-container {
  margin-top: 10px;
  font-family: 'Inter', system-ui, sans-serif;
  min-height: 100vh;
}



/* 关键指标卡片 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.metric-info {
  flex: 1;
}

.metric-label {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(22, 93, 255, 0.1);
  color: #165dff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  .metric-card:hover & {
    background: #165dff;
    color: white;
  }
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;

  &.up {
    color: #dc2626;
  }

  &.down {
    color: #16a34a;
  }

  .anticon {
    font-size: 12px;
  }
}

.trend-label {
  font-size: 12px;
  color: #9ca3af;
}

/* 图表和明细区域 */
.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.chart-card,
.rank-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.current {
    background: #165dff;
  }

  &.compare {
    background: #d1d5db;
  }
}

.legend-text {
  font-size: 12px;
  color: #6b7280;
}

.chart-container {
  height: auto;
  min-height: 320px;
}

.rank-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.rank-list {
  max-height: none;
  overflow-y: visible;

  &::-webkit-scrollbar {
    display: none;
  }
}

.rank-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  margin-bottom: 10px;

  &:hover {
    background: #ebebeb;
  }
}

.rank-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;

  &.rank-1 {
    background: #dc2626;
  }

  &.rank-2 {
    background: #ef4444;
  }

  &.rank-3 {
    background: #f97316;
  }

  &.rank-4 {
    background: #f59e0b;
  }

  &.rank-5 {
    background: #eab308;
  }

  &.rank-6 {
    background: #fbbf24;
  }

  &.rank-7 {
    background: #f59e0b;
  }

  &.rank-8 {
    background: #d97706;
  }

  &.rank-9 {
    background: #b45309;
  }

  &.rank-10 {
    background: #92400e;
  }

  &.rank-other {
    background: #d1d5db;
  }
}

.rank-name {
  color: #374151;
  font-weight: 500;
  transition: color 0.2s ease;
  font-weight: bold;

  // .rank-item:hover & {
  //   color: #52565e;
  // }
}

.rank-value {
  font-weight: 500;
  color: #1f2937;
  font-weight: bold;
}

/* 商务明细表格 */
.business-rank-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

.business-rank-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.business-rank-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #f3f4f6;
}

td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

tr:hover td {
  background: #f9fafb;
}

.amount {
  font-weight: 500;
  color: #1f2937;
}

.detail-button {
  color: #165dff;
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: rgba(22, 93, 255, 0.8);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .metric-card {
    padding: 16px;
  }

  .metric-value {
    font-size: 20px;
  }

  .chart-container {
    height: auto;
    min-height: 250px;
  }

  .rank-list {
    max-height: none;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metric-card,
.chart-card,
.rank-card,
.business-rank-section {
  animation: fadeIn 0.5s ease-out;
}
</style>
