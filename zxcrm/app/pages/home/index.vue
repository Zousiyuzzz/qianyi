<template>
  <view class="page">
    <!-- 看板数据 -->
    <view class="section">
      <view class="section-header">
        <view class="section-title">数据看板</view>
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
    <view class="section">
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
    <view class="section">
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
    <view class="section">
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
      uni.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(url)}` })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 20rpx;
}
.section {
  padding: 24rpx 28rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12rpx;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}
.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #1890ff;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  background: #f0f5ff;
}
.refresh-icon {
  font-size: 28rpx;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-top: 12rpx;
}
.dashboard-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}
.card-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
}
.card-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}
.card-trend {
  font-size: 22rpx;
  display: flex;
  align-items: center;
}
.trend-up {
  color: #f5222d;
}
.trend-down {
  color: #52c41a;
}
.trend-neutral {
  color: #999;
}
.dashboard-loading {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}

/* 排行榜样式 */
.rank-list {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.rank-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.rank-number {
  width: 48rpx;
  height: 48rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #fff;
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: #fff;
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #e6a85c 100%);
  color: #fff;
}

.rank-other {
  background: #f5f5f5;
  color: #666;
}

.rank-name {
  font-size: 28rpx;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #1677ff;
}

.rank-loading,
.rank-empty {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
  background: #fff;
  border-radius: 16rpx;
}

/* 商务排行榜表格样式 */
.business-rank-table {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.table-header {
  display: flex;
  background: #fafafa;
  padding: 20rpx 16rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.table-row {
  display: flex;
  padding: 24rpx 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:active {
  background: #f5f5f5;
}

.table-cell {
  font-size: 26rpx;
  color: #333;
}

.rank-col {
  width: 80rpx;
  flex-shrink: 0;
}

.name-col {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 16rpx;
}

.value-col {
  width: 140rpx;
  text-align: right;
  font-weight: 500;
  color: #1677ff;
  flex-shrink: 0;
}

.num-col {
  width: 100rpx;
  text-align: right;
  flex-shrink: 0;
}

.table-header .table-cell {
  font-size: 24rpx;
  color: #666;
  font-weight: 600;
}

.table-header .value-col,
.table-header .num-col {
  text-align: right;
}
</style>
