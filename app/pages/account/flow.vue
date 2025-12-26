<template>
  <view class="page" :style="{ paddingTop: (statusBarHeight + navBarContentHeight) + 'px' }">
    <!-- Navbar - 固定定位 -->
    <view class="navbar fixed-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">{{ accountName || '账户流水' }}</view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 余额概览 -->
    <view class="balance-section">
      <view class="balance-item">
        <text class="balance-label">当前余额</text>
        <text class="balance-value">¥{{ formatNumber(currentBalance) }}</text>
      </view>
    </view>

    <view class="filter-tabs">
      <view class="filter-tab" :class="{ active: activeDirection === 'all' }" @click="setDirection('all')">
        全部
      </view>
      <view class="filter-tab" :class="{ active: activeDirection === 'income' }" @click="setDirection('income')">
        收入
      </view>
      <view class="filter-tab" :class="{ active: activeDirection === 'expense' }" @click="setDirection('expense')">
        支出
      </view>
    </view>

    <!-- List - 使用普通view，不再使用scroll-view -->
    <view class="page-content">
      <view class="list-item timeline-item" v-for="(item, index) in dataList" :key="item.id || index"
        hover-class="card-hover" hover-stay-time="80">
        <view class="timeline-dot" :class="getDirectionClass(item.direction)"></view>
        <view class="timeline-content">
          <view class="item-header">
            <view class="item-time">{{ item.transactionTime || '-' }}</view>
            <view class="item-amount" :class="getAmountClass(item.direction)">
              {{ item.direction === 'income' ? '+' : '-' }}¥{{ formatNumber(item.amount || 0) }}
            </view>
          </view>
          <view class="item-content">
            <view class="item-row">
              <text class="label">余额：</text>
              <text class="value">¥{{ formatNumber(item.balance || 0) }}</text>
            </view>
            <view class="item-row" v-if="item.businessNo">
              <text class="label">业务单号：</text>
              <text class="value link" @click="handleBusinessClick(item)">{{ item.businessNo }}</text>
            </view>
            <view class="item-row" v-if="item.summary">
              <text class="label">摘要：</text>
              <text class="value">{{ item.summary }}</text>
            </view>
            <view class="item-row" v-if="item.operator">
              <text class="label">操作人：</text>
              <text class="value">{{ item.operator }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-if="!hasMore && dataList.length > 0">
        <text>没有更多了</text>
      </view>
      <view class="empty" v-if="!loading && dataList.length === 0">
        <text class="empty-title">暂无数据</text>
        <text class="empty-sub" v-if="hasActiveFilters">试试清除筛选条件后再看看</text>

        <view class="empty-actions" v-if="hasActiveFilters">
          <button class="clear-filter-btn" @click="clearAllFilters">清除筛选</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAccountFlowsList } from '../../common/api/account'

export default {
  data() {
    return {
      accountId: '',
      accountName: '',
      currentBalance: 0,
      dataList: [],
      loading: false,
      hasMore: true,
      refreshing: false,
      pageNo: 1,
      pageSize: 20,
      activeDirection: 'all',
      queryParam: {},
      // 导航栏相关数据
      statusBarHeight: 0,
      navBarContentHeight: 44 // 导航栏内容高度44px
    }
  },
  onLoad(query) {
    this.getStatusBarHeight()
    this.accountId = query.accountId || ''
    this.accountName = decodeURIComponent(query.accountName || '')
    if (this.accountId) {
      this.queryParam.accountId = this.accountId
    }
    this.loadData()
  },
  // 页面下拉刷新
  onPullDownRefresh() {
    this.handleRefresh()
  },
  // 页面上拉触底
  onReachBottom() {
    this.loadMore()
  },
  onBackPress() {
    this.handleBack()
    return true
  },
  computed: {
    hasActiveFilters() {
      return this.activeDirection !== 'all'
    }
  },
  methods: {
    // 获取状态栏高度
    getStatusBarHeight() {
      try {
        const systemInfo = uni.getSystemInfoSync()
        this.statusBarHeight = systemInfo.statusBarHeight || 0
      } catch (error) {
        console.error('获取状态栏高度失败:', error)
        this.statusBarHeight = 0
      }
    },
    handleBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack({
          delta: 1,
          fail: () => {
            uni.switchTab({ url: '/pages/modules/index' })
          }
        })
      } else {
        uni.switchTab({ url: '/pages/modules/index' })
      }
    },
    setDirection(direction) {
      this.activeDirection = direction
      this.queryParam = { accountId: this.accountId }
      if (direction === 'income') {
        this.queryParam.direction = 'income'
      } else if (direction === 'expense') {
        this.queryParam.direction = 'expense'
      }
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },
    async loadData() {
      if (this.loading) return
      this.loading = true
      try {
        const params = {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          ...this.queryParam
        }
        const res = await getAccountFlowsList(params)
        if (res && res.success) {
          const result = (res && res.result) ? res.result : {}
          const records = result.records || result.list || []
          if (this.pageNo === 1) {
            this.dataList = records
            // 获取第一条记录的余额作为当前余额
            if (records.length > 0 && records[0].balance) {
              this.currentBalance = records[0].balance
            }
          } else {
            this.dataList = [...this.dataList, ...records]
          }
          this.hasMore = records.length >= this.pageSize
        } else {
          uni.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (e) {
        console.error('加载数据失败:', e)
        uni.showToast({
          title: e.message || '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },
    loadMore() {
      if (this.hasMore && !this.loading) {
        this.pageNo++
        this.loadData()
      }
    },
    handleRefresh() {
      this.refreshing = true
      this.pageNo = 1
      this.dataList = []
      this.loadData().finally(() => {
        // 停止下拉刷新
        uni.stopPullDownRefresh()
        this.refreshing = false
      })
    },
    handleBusinessClick(item) {
      // 根据业务单号类型跳转
      console.log('点击业务单号:', item)
    },
    getDirectionClass(direction) {
      if (direction === 'income') return 'dot-income'
      if (direction === 'expense') return 'dot-expense'
      return ''
    },
    getAmountClass(direction) {
      if (direction === 'income') return 'amount-income'
      if (direction === 'expense') return 'amount-expense'
      return ''
    },
    formatNumber(num) {
      if (!num) return '0.00'
      return Number(num).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    clearAllFilters() {
      this.activeDirection = 'all'
      this.queryParam = { accountId: this.accountId }
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../common/styles/ios-common.scss';

.balance-section {
  background: linear-gradient(135deg, #2e87ff 0%, #1e6fd9 100%);
  padding: 32rpx;
  color: #fff;
}

.balance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.balance-label {
  font-size: 26rpx;
  opacity: 0.9;
}

.balance-value {
  font-size: 48rpx;
  font-weight: 700;
}

.filter-tabs {
  display: flex;
  background: #fff;
  border-bottom: 1rpx solid #e5e5e5;
  padding: 0 16rpx;
}

.filter-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.filter-tab.active {
  color: #2e87ff;
  font-weight: 600;
}

.filter-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: #2e87ff;
  border-radius: 2rpx;
}

/* ===== Base ===== */
.page {
  height: 100vh;
  background: #f2f2f7;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ===== Navbar ===== */
.navbar.fixed-navbar {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 1000 !important;
  background: #fff;
  background-color: #fff;
  border-bottom: 1rpx solid rgba(0, 0, 0, .06);
  backdrop-filter: blur(0);
  -webkit-backdrop-filter: blur(0);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
}

.navbar-left,
.navbar-right {
  width: 90rpx;
  display: flex;
  align-items: center;
}

.navbar-left {
  justify-content: flex-start;
}

.navbar-right {
  justify-content: flex-end;
}

.back-icon {
  font-size: 56rpx;
  color: #1c1c1e;
  font-weight: 300;
  line-height: 1;
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #1c1c1e;
}

/* ===== Page Content ===== */
.page-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: 0;
  padding: 16rpx;
  /* 让 flex 子元素正确计算高度 */
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}

.page-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
  width: 0;
  height: 0;
  background: transparent;
}

.card-hover {
  opacity: .92;
  transform: scale(0.99);
}

.timeline-item {
  position: relative;
  padding-left: 40rpx;
  margin-bottom: 24rpx;
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx 20rpx 20rpx 60rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.timeline-dot {
  position: absolute;
  left: 20rpx;
  top: 24rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #999;
  border: 3rpx solid #fff;
  box-shadow: 0 0 0 2rpx #999;
}

.timeline-dot.dot-income {
  background: #52c41a;
  box-shadow: 0 0 0 2rpx #52c41a;
}

.timeline-dot.dot-expense {
  background: #ff4d4f;
  box-shadow: 0 0 0 2rpx #ff4d4f;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 27rpx;
  top: 40rpx;
  width: 2rpx;
  height: calc(100% + 8rpx);
  background: #e5e5e5;
}

.timeline-content {
  flex: 1;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.item-time {
  font-size: 24rpx;
  color: #999;
}

.item-amount {
  font-size: 28rpx;
  font-weight: 600;
}

.item-amount.amount-income {
  color: #52c41a;
}

.item-amount.amount-expense {
  color: #ff4d4f;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-row {
  display: flex;
  align-items: center;
  font-size: 24rpx;
}

.label {
  color: #666;
  min-width: 120rpx;
  font-size: 24rpx;
}

.value {
  color: #333;
  flex: 1;
  font-size: 24rpx;
}

.value.link {
  color: #2e87ff;
  text-decoration: underline;
}

.loading-more,
.no-more {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 26rpx;
}
</style>
