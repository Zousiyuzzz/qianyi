<template>
  <view class="page home-page">
    <view class="navbar">
      <view class="navbar-content">
        <view class="navbar-left"></view>
        <view class="navbar-title">首页</view>
        <view class="navbar-right" @click="loadDashboardData">
          <text class="action-icon">⟳</text>
        </view>
      </view>
    </view>

    <!-- 看板数据 -->
    <view class="section-card">
      <view class="section-header">
        <view>
          <view class="section-title">数据看板</view>
          <view class="section-desc">近7天核心经营指标</view>
        </view>
        <view class="refresh-btn" @click="loadDashboardData">
          <text class="refresh-icon">🔄</text>
          <text>刷新</text>
        </view>
      </view>
      <view class="dashboard-grid" v-if="!dashboardLoading">
        <view class="dashboard-card">
          <view class="card-label">总消耗</view>
          <view class="card-value">¥{{ formatNumber(dashboardData.totalConsume || 0) }}</view>
          <view class="card-trend" :class="getTrendClass(dashboardData.totalConsumeTrend)">
            {{ dashboardData.totalConsumeTrend > 0 ? '↑' : '↓' }} {{ Math.abs(dashboardData.totalConsumeTrend || 0).toFixed(2) }}%
          </view>
        </view>
        <view class="dashboard-card">
          <view class="card-label">现金消耗</view>
          <view class="card-value">¥{{ formatNumber(dashboardData.cashDrain || 0) }}</view>
          <view class="card-trend" :class="getTrendClass(dashboardData.cashDrainTrend)">
            {{ dashboardData.cashDrainTrend > 0 ? '↑' : '↓' }} {{ Math.abs(dashboardData.cashDrainTrend || 0).toFixed(2) }}%
          </view>
        </view>
        <view class="dashboard-card">
          <view class="card-label">新开主体数</view>
          <view class="card-value">{{ dashboardData.newSubjectNum || 0 }}</view>
          <view class="card-trend" :class="getTrendClass(dashboardData.newSubjectNumTrend)">
            {{ dashboardData.newSubjectNumTrend > 0 ? '↑' : '↓' }} {{ Math.abs(dashboardData.newSubjectNumTrend || 0).toFixed(2) }}%
          </view>
        </view>
        <view class="dashboard-card">
          <view class="card-label">有花费账户数</view>
          <view class="card-value">{{ dashboardData.consumeAccountNum || 0 }}</view>
          <view class="card-trend" :class="getTrendClass(dashboardData.consumeAccountNumTrend)">
            {{ dashboardData.consumeAccountNumTrend > 0 ? '↑' : '↓' }} {{ Math.abs(dashboardData.consumeAccountNumTrend || 0).toFixed(2) }}%
          </view>
        </view>
      </view>
      <view class="dashboard-loading" v-else>
        <text>加载中...</text>
      </view>
    </view>

    <!-- 渠道消耗排行榜 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-title">渠道消耗排行</view>
        <view class="refresh-btn" @click="loadRankData">
          <text class="refresh-icon">🔄</text>
        </view>
      </view>
      <view class="rank-list" v-if="!rankLoading && channelRankList.length > 0">
        <view
          v-for="(item, index) in channelRankList.slice(0, 10)"
          :key="index"
          class="rank-item"
        >
          <view class="rank-info">
            <view class="rank-number" :class="getRankClass(index + 1)">{{ index + 1 }}</view>
            <text class="rank-name">{{ item.name || '未知渠道' }}</text>
          </view>
          <text class="rank-value">¥{{ formatNumber(item.total || 0) }}</text>
        </view>
      </view>
      <view class="rank-loading" v-else-if="rankLoading">
        <text>加载中...</text>
      </view>
      <view class="rank-empty" v-else>
        <text>暂无数据</text>
      </view>
    </view>

    <!-- 项目消耗排行榜 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-title">项目消耗排行</view>
        <view class="refresh-btn" @click="loadRankData">
          <text class="refresh-icon">🔄</text>
        </view>
      </view>
      <view class="rank-list" v-if="!rankLoading && projectRankList.length > 0">
        <view
          v-for="(item, index) in projectRankList.slice(0, 10)"
          :key="index"
          class="rank-item"
          @click="openWeb(`/projectManager/TabProjectmanageList?proName=${encodeURIComponent(item.name)}`)"
        >
          <view class="rank-info">
            <view class="rank-number" :class="getRankClass(index + 1)">{{ index + 1 }}</view>
            <text class="rank-name">{{ item.name }}</text>
          </view>
          <text class="rank-value">¥{{ formatNumber(item.total || 0) }}</text>
        </view>
      </view>
      <view class="rank-loading" v-else-if="rankLoading">
        <text>加载中...</text>
      </view>
      <view class="rank-empty" v-else>
        <text>暂无数据</text>
      </view>
    </view>

    <!-- 商务消耗排行榜 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-title">商务消耗排行</view>
        <view class="refresh-btn" @click="loadRankData">
          <text class="refresh-icon">🔄</text>
        </view>
      </view>
      <view class="business-rank-table" v-if="!rankLoading && businessRankList.length > 0">
        <view class="table-header">
          <text class="table-cell rank-col">排名</text>
          <text class="table-cell name-col">商务名称</text>
          <text class="table-cell value-col">总消耗</text>
          <text class="table-cell value-col">现金消耗</text>
          <text class="table-cell num-col">账户数</text>
        </view>
        <view
          v-for="(item, index) in businessRankList.slice(0, 10)"
          :key="index"
          class="table-row"
          @click="openWeb(`/dashboard/analysis?businessPerson=${encodeURIComponent(item.name)}`)"
        >
          <view class="table-cell rank-col">
            <view class="rank-number" :class="getRankClass(index + 1)">{{ index + 1 }}</view>
          </view>
          <text class="table-cell name-col">{{ item.name }}</text>
          <text class="table-cell value-col">¥{{ formatNumber(item.total_charged || 0) }}</text>
          <text class="table-cell value-col">¥{{ formatNumber(item.cash_drain || 0) }}</text>
          <text class="table-cell num-col">{{ item.consumeAccountNum || 0 }}</text>
        </view>
      </view>
      <view class="rank-loading" v-else-if="rankLoading">
        <text>加载中...</text>
      </view>
      <view class="rank-empty" v-else>
        <text>暂无数据</text>
      </view>
    </view>
  </view>
</template>

<script>
import { buildWebUrl } from '../../common/config'
import { request } from '../../common/api/request'

export default {
  data () {
    return {
      dashboardLoading: false,
      rankLoading: false,
      dashboardData: {
        totalConsume: 0,
        cashDrain: 0,
        newSubjectNum: 0,
        consumeAccountNum: 0,
        totalConsumeTrend: 0,
        cashDrainTrend: 0,
        newSubjectNumTrend: 0,
        consumeAccountNumTrend: 0
      },
      channelRankList: [],
      projectRankList: [],
      businessRankList: []
    }
  },
  onLoad () {
    this.loadDashboardData()
    this.loadRankData()
  },
  onShow () {
    // 每次显示时刷新数据
    this.loadDashboardData()
    this.loadRankData()
  },
  methods: {
    // 获取日期范围（最近7天）
    getDateRange () {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      const formatDate = (date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      return [formatDate(start), formatDate(end)]
    },
    // 加载看板数据
    async loadDashboardData () {
      this.dashboardLoading = true
      try {
        const [beginDate, endDate] = this.getDateRange()
        // 获取当前周期数据
        const currentRes = await request({
          url: '/agentdata/topData',
          method: 'GET',
          params: { beginDate, endDate },
          skipErrorToast: true
        })
        // 获取对比周期数据（上一个7天）
        const compareStart = new Date()
        compareStart.setDate(compareStart.getDate() - 14)
        const compareEnd = new Date()
        compareEnd.setDate(compareEnd.getDate() - 7)
        const formatDate = (date) => {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }
        const compareRes = await request({
          url: '/agentdata/topData',
          method: 'GET',
          params: {
            beginDate: formatDate(compareStart),
            endDate: formatDate(compareEnd)
          },
          skipErrorToast: true
        })
        if (currentRes && currentRes.success && currentRes.result) {
          const current = currentRes.result
          const compare = compareRes && compareRes.success && compareRes.result ? compareRes.result : {}
          // 计算趋势百分比
          const calcTrend = (current, compare) => {
            if (!compare || compare === 0) return 0
            return ((current - compare) / compare) * 100
          }
          this.dashboardData = {
            totalConsume: current.sumConsume || 0,
            cashDrain: current.cashDrain || 0,
            newSubjectNum: current.newSubjectNum || 0,
            consumeAccountNum: current.consumeAccountNum || 0,
            totalConsumeTrend: calcTrend(current.sumConsume || 0, compare.sumConsume || 0),
            cashDrainTrend: calcTrend(current.cashDrain || 0, compare.cashDrain || 0),
            newSubjectNumTrend: calcTrend(current.newSubjectNum || 0, compare.newSubjectNum || 0),
            consumeAccountNumTrend: calcTrend(current.consumeAccountNum || 0, compare.consumeAccountNum || 0)
          }
        }
      } catch (e) {
        console.error('加载看板数据失败:', e)
        // 静默失败，不显示错误提示
      } finally {
        this.dashboardLoading = false
      }
    },
    formatNumber (num) {
      if (!num) return '0.000'
      return new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(num)
    },
    getTrendClass (trend) {
      return trend > 0 ? 'trend-up' : trend < 0 ? 'trend-down' : 'trend-neutral'
    },
    // 加载排行榜数据
    async loadRankData () {
      this.rankLoading = true
      try {
        const [beginDate, endDate] = this.getDateRange()
        const res = await request({
          url: '/agentdata/rankingData',
          method: 'GET',
          params: { beginDate, endDate },
          skipErrorToast: true
        })
        if (res && res.success && res.result) {
          // 渠道排行榜
          this.channelRankList = (res.result.channelRanking || []).map(item => ({
            name: item.channel_sign,
            total: item.total_charged || 0
          }))
          // 项目排行榜
          this.projectRankList = (res.result.proRanking || []).map(item => ({
            name: item.pro_name,
            total: item.total_charged || 0
          }))
          // 商务排行榜
          this.businessRankList = (res.result.businessRanking || []).map(item => ({
            name: item.realname,
            total_charged: item.total_charged || 0,
            cash_drain: item.cash_drain || 0,
            consumeAccountNum: item.consumeAccountNum || 0
          }))
        }
      } catch (e) {
        console.error('加载排行榜数据失败:', e)
      } finally {
        this.rankLoading = false
      }
    },
    getRankClass (rank) {
      if (rank === 1) return 'rank-1'
      if (rank === 2) return 'rank-2'
      if (rank === 3) return 'rank-3'
      return 'rank-other'
    },
    openWeb (path) {
      const url = buildWebUrl(path || '/')
      // 使用openWebView统一处理，避免URL编码问题
      const { openWebView } = require('../../common/navigation')
      openWebView(path || '/', '')
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../common/styles/ios-common.scss';

.home-page {
  background: #f2f2f7;
}

.section-card {
  background: #fff;
  margin: 12rpx 16rpx;
  padding: 18rpx 16rpx 12rpx;
  border-radius: 20rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #111;
}

.section-desc {
  font-size: 24rpx;
  color: #6e6e73;
  margin-top: 4rpx;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #0a84ff;
  padding: 10rpx 14rpx;
  border-radius: 999px;
  background: rgba(10, 132, 255, 0.12);
}

.refresh-icon {
  font-size: 28rpx;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14rpx;
  margin-top: 6rpx;
}

.dashboard-card {
  background: linear-gradient(145deg, #ffffff 0%, #f6f6f8 100%);
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.7), 0 6rpx 18rpx rgba(0, 0, 0, 0.05);
}

.card-label {
  font-size: 24rpx;
  color: #6e6e73;
  margin-bottom: 8rpx;
}

.card-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #111;
  margin-bottom: 6rpx;
}

.card-trend {
  font-size: 22rpx;
  display: flex;
  align-items: center;
}

.trend-up { color: #ff3b30; }
.trend-down { color: #34c759; }
.trend-neutral { color: #8e8e93; }

.dashboard-loading {
  text-align: center;
  padding: 40rpx 0;
  color: #8e8e93;
  font-size: 26rpx;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.rank-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14rpx 6rpx;
  border-radius: 14rpx;
  transition: background 0.12s ease;
}

.rank-item:active {
  background: rgba(0, 0, 0, 0.04);
}

.rank-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.rank-number {
  min-width: 44rpx;
  height: 44rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #fff;
}

.rank-1 { background: linear-gradient(135deg, #ffd666 0%, #ff9f0a 100%); }
.rank-2 { background: linear-gradient(135deg, #d6e4ff 0%, #0a84ff 100%); }
.rank-3 { background: linear-gradient(135deg, #ffd6e7 0%, #ff375f 100%); }
.rank-other { background: #e5e5ea; color: #4a4a4a; }

.rank-name {
  font-size: 26rpx;
  color: #1c1c1e;
}

.rank-value {
  font-size: 28rpx;
  font-weight: 700;
  color: #0a84ff;
}

.rank-loading,
.rank-empty {
  text-align: center;
  padding: 24rpx 0;
  color: #8e8e93;
  font-size: 24rpx;
}

.business-rank-table {
  overflow: hidden;
  border-radius: 16rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 90rpx 1fr 200rpx 200rpx 120rpx;
  padding: 14rpx 10rpx;
  align-items: center;
}

.table-header {
  background: #f2f2f7;
  color: #6e6e73;
  font-weight: 700;
  font-size: 24rpx;
}

.table-row {
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
}

.table-cell {
  font-size: 24rpx;
  color: #1c1c1e;
}

.name-col {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.value-col,
.num-col {
  text-align: right;
}
</style>
