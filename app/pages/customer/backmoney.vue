<template>
  <view class="page">
    <view class="navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">{{ customerName || '回款状态' }}</view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-bar">
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索项目、渠道"
          @confirm="handleSearch"
          confirm-type="search"
        />
        <text class="search-icon" @click="handleSearch">🔍</text>
      </view>
    </view>

    <!-- 列表 -->
    <scroll-view 
      class="list-scroll" 
      scroll-y 
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="handleRefresh"
    >
      <view 
        class="list-item" 
        v-for="(item, index) in dataList" 
        :key="item.id || index"
      >
        <view class="item-header">
          <view class="item-title">{{ item.customerName || item.proName || '未知' }}</view>
          <view class="item-month">{{ item.month || '-' }}</view>
        </view>
        
        <view class="item-content">
          <view class="item-row">
            <text class="label">项目：</text>
            <text class="value">{{ item.proName || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">渠道：</text>
            <text class="value">{{ item.business_name || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">总消耗：</text>
            <text class="value amount">¥{{ formatNumber(item.totalCharged || 0) }}</text>
          </view>
          <view class="item-row">
            <text class="label">现金消耗：</text>
            <text class="value amount">¥{{ formatNumber(item.totalCashDrain || 0) }}</text>
          </view>
          <view class="item-row">
            <text class="label">收入：</text>
            <text class="value amount">¥{{ formatNumber(item.totalRevenue || 0) }}</text>
          </view>
          <view class="item-row">
            <text class="label">返点金额：</text>
            <text class="value amount">¥{{ formatNumber(item.totalRebateAmount || 0) }}</text>
          </view>
          <view class="item-row">
            <text class="label">到账金额：</text>
            <text class="value amount">¥{{ formatNumber(item.totalArrivalAmount || 0) }}</text>
          </view>
          <view class="item-row" v-if="item.overdueDays > 0">
            <text class="label">逾期天数：</text>
            <text class="value overdue">{{ item.overdueDays }}天</text>
          </view>
        </view>

        <view class="item-actions" v-if="item.overdueDays > 0 && item.collaborationMode != '0'">
          <button class="action-btn" @click="handleDelay(item)">延期申请</button>
        </view>
      </view>

      <!-- 加载状态 -->
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
import { getBackmoneyList } from '../../common/api/customer'

export default {
  data() {
    return {
      customerId: '',
      customerName: '',
      dataList: [],
      loading: false,
      hasMore: true,
      refreshing: false,
      pageNo: 1,
      pageSize: 20,
      searchKeyword: '',
      queryParam: {}
    }
  },
  onLoad(query) {
    this.customerId = query.customerId || ''
    this.customerName = decodeURIComponent(query.customerName || '')
    if (this.customerId) {
      this.queryParam.customerId = this.customerId
    }
    this.loadData()
  },
  onBackPress() {
    this.handleBack()
    return true
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    handleSearch() {
      if (this.searchKeyword) {
        this.queryParam.proName = this.searchKeyword
        this.queryParam.business_name = this.searchKeyword
      } else {
        delete this.queryParam.proName
        delete this.queryParam.business_name
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
        const res = await getBackmoneyList(params)
        if (res && res.success) {
          const records = res.result?.records || res.result?.list || []
          if (this.pageNo === 1) {
            this.dataList = records
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
    handleDelay(item) {
      uni.navigateTo({
        url: `/pages/customer/delay?recordId=${item.id}&proName=${encodeURIComponent(item.proName || '')}`
      })
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

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: #fff;
  border-bottom: 1rpx solid #e5e5e5;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
}

.navbar-left {
  width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.back-icon {
  font-size: 56rpx;
  color: #333;
  font-weight: 300;
  line-height: 1;
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navbar-right {
  width: 80rpx;
}

.search-section {
  background: #fff;
  padding: 16rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 48rpx;
  padding: 0 20rpx;
  height: 64rpx;
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.search-icon {
  font-size: 28rpx;
  color: #999;
  margin-left: 12rpx;
}

.list-scroll {
  flex: 1;
}

.list-item {
  background: #fff;
  margin: 12rpx 16rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.item-month {
  font-size: 24rpx;
  color: #999;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 16rpx;
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

.value.amount {
  color: #2e87ff;
  font-weight: 600;
}

.value.overdue {
  color: #ff4d4f;
  font-weight: 600;
}

.item-actions {
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  width: 100%;
  height: 56rpx;
  border-radius: 28rpx;
  font-size: 24rpx;
  background: #2e87ff;
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn::after {
  border: none;
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

