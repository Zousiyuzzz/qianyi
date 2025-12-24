<template>
  <view class="page">
    <view class="navbar">
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
      <view 
        class="filter-tab" 
        :class="{ active: activeDirection === 'all' }"
        @click="setDirection('all')"
      >
        全部
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: activeDirection === 'income' }"
        @click="setDirection('income')"
      >
        收入
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: activeDirection === 'expense' }"
        @click="setDirection('expense')"
      >
        支出
      </view>
    </view>

    <scroll-view 
      class="list-scroll" 
      scroll-y 
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="handleRefresh"
    >
      <view 
        class="list-item timeline-item" 
        v-for="(item, index) in dataList" 
        :key="item.id || index"
      >
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
        <text>暂无数据</text>
      </view>
    </scroll-view>
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
      queryParam: {}
    }
  },
  onLoad(query) {
    this.accountId = query.accountId || ''
    this.accountName = decodeURIComponent(query.accountName || '')
    if (this.accountId) {
      this.queryParam.accountId = this.accountId
    }
    this.loadData()
  },
  onBackPress() {
    this.handleBack()
    return true
  },
  methods: {
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
          const records = res.result?.records || res.result?.list || []
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
      this.loadData()
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

.list-scroll {
  flex: 1;
  padding: 16rpx;
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
.no-more,
.empty {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 26rpx;
}
</style>

