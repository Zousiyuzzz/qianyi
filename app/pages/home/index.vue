<template>
  <view class="page home-page" :style="{ paddingTop: navbarHeight + 'px' }">
    <!-- 固定导航栏（白底固定） -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left"></view>
        <view class="navbar-title">首页</view>
        <view class="navbar-right" @click="handleRefreshAll">
          <text class="action-icon">⟳</text>
        </view>
      </view>
    </view>

    <!-- 日期筛选（更轻、更像 iOS 表单） -->
    <view class="filter-card">
      <view class="filter-row">
        <picker mode="date" :value="beginDate" @change="onPickBegin">
          <view class="filter-cell">
            <text class="filter-label">开始</text>
            <text class="filter-value">{{ beginDate }}</text>
            <text class="chev">›</text>
          </view>
        </picker>

        <view class="filter-split"></view>

        <picker mode="date" :value="endDate" @change="onPickEnd">
          <view class="filter-cell">
            <text class="filter-label">结束</text>
            <text class="filter-value">{{ endDate }}</text>
            <text class="chev">›</text>
          </view>
        </picker>
      </view>

      <view class="filter-actions">
        <view class="pill" :class="{ active: presetDays === 7 }" @click="setPresetDays(7)">近7天</view>
        <view class="pill" :class="{ active: presetDays === 30 }" @click="setPresetDays(30)">近30天</view>
        <view class="filter-spacer"></view>
        <view class="btn-refresh" @click="handleRefreshAll">刷新</view>
      </view>
    </view>

    <!-- 数据看板 -->
    <view class="section-card">
      <view class="section-header">
        <view>
          <view class="section-title">数据看板</view>
          <view class="section-desc">当前选择区间核心经营指标</view>
        </view>
        <view class="icon-btn" @click="loadDashboardData">
          <text class="icon-btn-text">⟳</text>
        </view>
      </view>

      <view class="dashboard-grid" v-if="!dashboardLoading">
        <view class="dashboard-card">
          <view class="card-label">总消耗</view>
          <view class="card-value">¥{{ formatNumber(dashboardData.totalConsume || 0) }}</view>
          <view class="card-trend" :class="getTrendClass(dashboardData.totalConsumeTrend)">
            <text class="trend-arrow">{{ dashboardData.totalConsumeTrend > 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(dashboardData.totalConsumeTrend || 0).toFixed(2) }}%</text>
          </view>
        </view>

        <view class="dashboard-card">
          <view class="card-label">现金消耗</view>
          <view class="card-value">¥{{ formatNumber(dashboardData.cashDrain || 0) }}</view>
          <view class="card-trend" :class="getTrendClass(dashboardData.cashDrainTrend)">
            <text class="trend-arrow">{{ dashboardData.cashDrainTrend > 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(dashboardData.cashDrainTrend || 0).toFixed(2) }}%</text>
          </view>
        </view>

        <view class="dashboard-card">
          <view class="card-label">新开主体数</view>
          <view class="card-value">{{ dashboardData.newSubjectNum || 0 }}</view>
          <view class="card-trend" :class="getTrendClass(dashboardData.newSubjectNumTrend)">
            <text class="trend-arrow">{{ dashboardData.newSubjectNumTrend > 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(dashboardData.newSubjectNumTrend || 0).toFixed(2) }}%</text>
          </view>
        </view>

        <view class="dashboard-card">
          <view class="card-label">有花费账户数</view>
          <view class="card-value">{{ dashboardData.consumeAccountNum || 0 }}</view>
          <view class="card-trend" :class="getTrendClass(dashboardData.consumeAccountNumTrend)">
            <text class="trend-arrow">{{ dashboardData.consumeAccountNumTrend > 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(dashboardData.consumeAccountNumTrend || 0).toFixed(2) }}%</text>
          </view>
        </view>
      </view>

      <view class="dashboard-grid" v-else>
        <view class="dashboard-card skeleton-card" v-for="n in 4" :key="n">
          <view class="sk sk-label"></view>
          <view class="sk sk-value"></view>
          <view class="sk sk-trend"></view>
        </view>
      </view>
    </view>

    <!-- 渠道消耗排行榜 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-title">渠道消耗排行</view>
        <view class="icon-btn" @click="loadRankData">
          <text class="icon-btn-text">⟳</text>
        </view>
      </view>

      <view class="rank-list" v-if="!rankLoading && channelRankList.length > 0">
        <view v-for="(item, index) in channelRankList.slice(0, 10)" :key="index" class="rank-item">
          <view class="rank-info">
            <view class="rank-badge" :class="getRankClass(index + 1)">{{ index + 1 }}</view>
            <text class="rank-name">{{ item.name || '未知渠道' }}</text>
          </view>
          <text class="rank-value">¥{{ formatNumber(item.total || 0) }}</text>
        </view>
      </view>

      <view class="rank-skeleton" v-else-if="rankLoading">
        <view class="rank-item" v-for="n in 8" :key="n">
          <view class="rank-info">
            <view class="rank-badge rank-other">{{ n }}</view>
            <view class="sk sk-rank-name"></view>
          </view>
          <view class="sk sk-rank-value"></view>
        </view>
      </view>

      <view class="rank-empty" v-else>
        <text>暂无数据</text>
      </view>
    </view>

    <!-- 项目消耗排行榜 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-title">项目消耗排行</view>
        <view class="icon-btn" @click="loadRankData">
          <text class="icon-btn-text">⟳</text>
        </view>
      </view>

      <view class="rank-list" v-if="!rankLoading && projectRankList.length > 0">
        <view v-for="(item, index) in projectRankList.slice(0, 10)" :key="index" class="rank-item"
          @click="openWeb(`/projectManager/TabProjectmanageList?proName=${encodeURIComponent(item.name)}`)">
          <view class="rank-info">
            <view class="rank-badge" :class="getRankClass(index + 1)">{{ index + 1 }}</view>
            <text class="rank-name">{{ item.name }}</text>
          </view>
          <text class="rank-value">¥{{ formatNumber(item.total || 0) }}</text>
        </view>
      </view>

      <view class="rank-skeleton" v-else-if="rankLoading">
        <view class="rank-item" v-for="n in 8" :key="n">
          <view class="rank-info">
            <view class="rank-badge rank-other">{{ n }}</view>
            <view class="sk sk-rank-name"></view>
          </view>
          <view class="sk sk-rank-value"></view>
        </view>
      </view>

      <view class="rank-empty" v-else>
        <text>暂无数据</text>
      </view>
    </view>

    <!-- ✅ 商务消耗排行榜：改成 iOS 列表项（不堆卡片、不重复指标） -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-title">商务消耗排行</view>
        <view class="icon-btn" @click="loadRankData">
          <text class="icon-btn-text">⟳</text>
        </view>
      </view>

      <!-- 内容 -->
      <view v-if="!rankLoading && businessRankList.length > 0" class="ios-list">
        <view v-for="(item, index) in businessRankList.slice(0, 10)" :key="index" class="ios-item"
          @click="openWeb(`/dashboard/analysis?businessPerson=${encodeURIComponent(item.name)}`)">
          <view class="ios-item-top">
            <view class="rank-pill" :class="getRankClass(index + 1)">{{ index + 1 }}</view>

            <view class="ios-mid">
              <text class="ios-name">{{ item.name }}</text>
              <text class="ios-sub">账户数 {{ item.consumeAccountNum || 0 }}</text>
            </view>

            <view class="ios-right">
              <text class="ios-amount">¥{{ formatNumber(item.total_charged || 0) }}</text>
              <text class="ios-right-sub">总消耗</text>
            </view>
          </view>

          <view class="ios-item-bottom">
            <text class="ios-mini">
              现金消耗 <text class="ios-mini-strong">¥{{ formatNumber(item.cash_drain || 0) }}</text>
            </text>
            <text class="dot">·</text>
            <text class="ios-mini">
              账户 <text class="ios-mini-strong">{{ item.consumeAccountNum || 0 }}</text>
            </text>
          </view>
        </view>
      </view>

      <!-- skeleton（对齐真实结构） -->
      <view v-else-if="rankLoading" class="ios-list">
        <view class="ios-item" v-for="n in 6" :key="n">
          <view class="ios-item-top">
            <view class="rank-pill rank-other">{{ n }}</view>
            <view class="ios-mid">
              <view class="sk sk-ios-name"></view>
              <view class="sk sk-ios-sub"></view>
            </view>
            <view class="ios-right">
              <view class="sk sk-ios-amt"></view>
              <view class="sk sk-ios-amt-sub"></view>
            </view>
          </view>
          <view class="ios-item-bottom">
            <view class="sk sk-ios-bottom"></view>
          </view>
        </view>
      </view>

      <view class="rank-empty" v-else>
        <text>暂无数据</text>
      </view>
    </view>

    <view class="bottom-space"></view>
  </view>
</template>

<script>
import { buildWebUrl } from '../../common/config'
import { request } from '../../common/api/request'

export default {
  data() {
    return {
      dashboardLoading: false,
      rankLoading: false,
      statusBarHeight: 0,
      navbarHeight: 44,

      beginDate: '',
      endDate: '',
      presetDays: 7,

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
  onLoad() {
    this.getSystemInfo()
    this.setPresetDays(7)
    this.loadDashboardData()
    this.loadRankData()
  },
  onShow() {
    this.loadDashboardData()
    this.loadRankData()
  },
  methods: {
    getSystemInfo() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
      this.navbarHeight = this.statusBarHeight + 44
    },

    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    setPresetDays(days) {
      this.presetDays = days
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - days)
      this.beginDate = this.formatDate(start)
      this.endDate = this.formatDate(end)
    },

    onPickBegin(e) {
      this.presetDays = 0
      const val = e.detail.value
      this.beginDate = val
      if (this.endDate && this.beginDate > this.endDate) {
        this.endDate = this.beginDate
      }
    },

    onPickEnd(e) {
      this.presetDays = 0
      const val = e.detail.value
      this.endDate = val
      if (this.beginDate && this.endDate < this.beginDate) {
        this.beginDate = this.endDate
      }
    },

    handleRefreshAll() {
      this.loadDashboardData()
      this.loadRankData()
    },

    getDateRange() {
      if (!this.beginDate || !this.endDate) {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 7)
        return [this.formatDate(start), this.formatDate(end)]
      }
      return [this.beginDate, this.endDate]
    },

    async loadDashboardData() {
      this.dashboardLoading = true
      try {
        const [beginDate, endDate] = this.getDateRange()

        const currentRes = await request({
          url: '/agentdata/topData',
          method: 'GET',
          params: { beginDate, endDate },
          skipErrorToast: true
        })

        const dayMs = 24 * 60 * 60 * 1000
        const startObj = new Date(beginDate.replace(/-/g, '/'))
        const endObj = new Date(endDate.replace(/-/g, '/'))
        const spanDays = Math.max(1, Math.round((endObj - startObj) / dayMs))
        const compareEnd = new Date(startObj.getTime())
        const compareStart = new Date(startObj.getTime() - spanDays * dayMs)

        const compareRes = await request({
          url: '/agentdata/topData',
          method: 'GET',
          params: {
            beginDate: this.formatDate(compareStart),
            endDate: this.formatDate(compareEnd)
          },
          skipErrorToast: true
        })

        if (currentRes && currentRes.success && currentRes.result) {
          const current = currentRes.result
          const compare = compareRes && compareRes.success && compareRes.result ? compareRes.result : {}
          const calcTrend = (cur, cmp) => {
            if (!cmp || cmp === 0) return 0
            return ((cur - cmp) / cmp) * 100
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
      } finally {
        this.dashboardLoading = false
      }
    },

    async loadRankData() {
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
          this.channelRankList = (res.result.channelRanking || []).map(item => ({
            name: item.channel_sign,
            total: item.total_charged || 0
          }))
          this.projectRankList = (res.result.proRanking || []).map(item => ({
            name: item.pro_name,
            total: item.total_charged || 0
          }))
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

    formatNumber(num) {
      if (!num && num !== 0) return '0.000'
      const numStr = Number(num).toFixed(3)
      const parts = numStr.split('.')
      let integerPart = parts[0]
      const decimalPart = parts[1] || '000'
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return `${integerPart}.${decimalPart}`
    },

    getTrendClass(trend) {
      return trend > 0 ? 'trend-up' : trend < 0 ? 'trend-down' : 'trend-neutral'
    },

    getRankClass(rank) {
      if (rank === 1) return 'rank-1'
      if (rank === 2) return 'rank-2'
      if (rank === 3) return 'rank-3'
      return 'rank-other'
    },

    openWeb(path) {
      const url = buildWebUrl(path || '/')
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

/* navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16rpx;
}

.navbar-left,
.navbar-right {
  width: 60rpx;
  display: flex;
  align-items: center;
}

.navbar-right {
  justify-content: flex-end;
}

.action-icon {
  font-size: 40rpx;
  color: #0a84ff;
}

.navbar-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #111;
  text-align: center;
  flex: 1;
}

/* filter */
.filter-card {
  margin: 12rpx 16rpx 0;
  padding: 14rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: flex;
  align-items: stretch;
  border-radius: 16rpx;
  overflow: hidden;
  background: #f2f2f7;
}

.filter-cell {
  flex: 1;
  padding: 14rpx 14rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.filter-cell:active {
  background: rgba(0, 0, 0, 0.03);
}

.filter-label {
  font-size: 22rpx;
  color: #8e8e93;
}

.filter-value {
  font-size: 26rpx;
  font-weight: 800;
  color: #1c1c1e;
  flex: 1;
}

.chev {
  font-size: 30rpx;
  color: #8e8e93;
}

.filter-split {
  width: 1rpx;
  background: rgba(0, 0, 0, 0.06);
}

.filter-actions {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.filter-spacer {
  flex: 1;
}

.pill {
  padding: 10rpx 18rpx;
  border-radius: 999px;
  font-size: 24rpx;
  color: #3a3a3c;
  background: #f2f2f7;
}

.pill.active {
  color: #0a84ff;
  background: rgba(10, 132, 255, 0.14);
  font-weight: 800;
}

.btn-refresh {
  padding: 10rpx 18rpx;
  border-radius: 999px;
  font-size: 24rpx;
  color: #fff;
  background: #0a84ff;
  font-weight: 800;
}

.btn-refresh:active {
  opacity: 0.85;
}

/* section */
.section-card {
  background: #fff;
  margin: 12rpx 16rpx;
  padding: 18rpx 16rpx 12rpx;
  border-radius: 20rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 900;
  color: #111;
}

.section-desc {
  font-size: 24rpx;
  color: #6e6e73;
  margin-top: 4rpx;
}

.icon-btn {
  width: 68rpx;
  height: 68rpx;
  border-radius: 999px;
  background: rgba(10, 132, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:active {
  background: rgba(10, 132, 255, 0.18);
}

.icon-btn-text {
  font-size: 32rpx;
  color: #0a84ff;
  font-weight: 800;
}

/* dashboard */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14rpx;
  margin-top: 6rpx;
}

.dashboard-card {
  border-radius: 16rpx;
  padding: 18rpx;
  background: #f7f7fa;
  border: 1rpx solid rgba(0, 0, 0, 0.04);
  min-height: 170rpx;
  /* 不塌陷 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-label {
  font-size: 24rpx;
  color: #6e6e73;
  margin-bottom: 8rpx;
}

.card-value {
  font-size: 36rpx;
  font-weight: 900;
  color: #111;
  margin-bottom: 6rpx;
}

.card-trend {
  font-size: 22rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.trend-arrow {
  font-weight: 900;
}

.trend-up {
  color: #ff3b30;
}

.trend-down {
  color: #34c759;
}

.trend-neutral {
  color: #8e8e93;
}

/* list */
.rank-list,
.rank-skeleton {
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
}

.rank-item:active {
  background: rgba(0, 0, 0, 0.04);
}

.rank-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
}

.rank-name {
  font-size: 26rpx;
  color: #1c1c1e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 420rpx;
}

.rank-value {
  font-size: 28rpx;
  font-weight: 900;
  color: #0a84ff;
}

/* 修复 4+ 数字不可见 */
.rank-badge {
  min-width: 76rpx;
  height: 46rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 900;
  background: #e5e5ea;
  color: #1c1c1e;
}

.rank-1 {
  background: #ff9f0a;
  color: #fff;
}

.rank-2 {
  background: #0a84ff;
  color: #fff;
}

.rank-3 {
  background: #ff375f;
  color: #fff;
}

.rank-other {
  background: #e5e5ea;
  color: #1c1c1e;
}

.rank-empty {
  text-align: center;
  padding: 24rpx 0;
  color: #8e8e93;
  font-size: 24rpx;
}

/* ✅ 商务列表（iOS inset grouped） */
.ios-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.ios-item {
  background: #fff;
  border-radius: 18rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.ios-item:active {
  background: rgba(0, 0, 0, 0.02);
}

.ios-item-top {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 14rpx 12rpx;
}

.rank-pill {
  width: 64rpx;
  height: 44rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 900;
  background: #e5e5ea;
  color: #1c1c1e;
  flex-shrink: 0;
}

.ios-mid {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.ios-name {
  font-size: 28rpx;
  font-weight: 900;
  color: #111;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ios-sub {
  font-size: 22rpx;
  color: #8e8e93;
}

.ios-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
  flex-shrink: 0;
}

.ios-amount {
  font-size: 28rpx;
  font-weight: 900;
  color: #0a84ff;
}

.ios-right-sub {
  font-size: 20rpx;
  color: #8e8e93;
}

.ios-item-bottom {
  padding: 12rpx 14rpx 16rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-wrap: wrap;
}

.ios-mini {
  font-size: 22rpx;
  color: #6e6e73;
}

.ios-mini-strong {
  color: #1c1c1e;
  font-weight: 800;
}

.dot {
  font-size: 22rpx;
  color: #c7c7cc;
}

/* skeleton */
.sk {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.05) 25%, rgba(0, 0, 0, 0.10) 37%, rgba(0, 0, 0, 0.05) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.2s ease infinite;
  border-radius: 12rpx;
}

.skeleton-card .sk-label {
  width: 46%;
  height: 26rpx;
  margin-bottom: 14rpx;
}

.skeleton-card .sk-value {
  width: 78%;
  height: 40rpx;
  margin-bottom: 12rpx;
}

.skeleton-card .sk-trend {
  width: 40%;
  height: 24rpx;
}

.sk-rank-name {
  width: 320rpx;
  height: 26rpx;
}

.sk-rank-value {
  width: 220rpx;
  height: 26rpx;
  border-radius: 999px;
}

.sk-ios-name {
  width: 260rpx;
  height: 26rpx;
}

.sk-ios-sub {
  width: 180rpx;
  height: 22rpx;
}

.sk-ios-amt {
  width: 220rpx;
  height: 26rpx;
  border-radius: 999px;
}

.sk-ios-amt-sub {
  width: 80rpx;
  height: 18rpx;
}

.sk-ios-bottom {
  width: 520rpx;
  height: 22rpx;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: 0 0;
  }
}

.bottom-space {
  height: 28rpx;
}
</style>