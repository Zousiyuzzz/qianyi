<template>
  <view class="page">
    <view class="navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">返点管理</view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <view class="filter-tabs">
      <view 
        class="filter-tab" 
        :class="{ active: activeMedia === 'all' }"
        @click="setMedia('all')"
      >
        全部
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: activeMedia === 'DY' }"
        @click="setMedia('DY')"
      >
        巨量引擎
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: activeMedia === 'CL' }"
        @click="setMedia('CL')"
      >
        磁力引擎
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: activeMedia === 'TX' }"
        @click="setMedia('TX')"
      >
        腾讯广告
      </view>
    </view>

    <view class="search-section">
      <view class="search-bar">
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索客户、项目"
          @confirm="handleSearch"
          confirm-type="search"
        />
        <text class="search-icon" @click="handleSearch">🔍</text>
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
        class="list-item" 
        v-for="(item, index) in dataList" 
        :key="item.id || index"
        @click="handleItemClick(item)"
      >
        <view class="item-header">
          <view class="item-title">{{ item.customerName || item.proName || '未知' }}</view>
          <view class="item-status" :class="getStatusClass(item.status)">
            {{ item.status || '待发放' }}
          </view>
        </view>
        
        <view class="item-content">
          <view class="item-row">
            <text class="label">月份：</text>
            <text class="value">{{ item.month || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">项目：</text>
            <text class="value">{{ item.proName || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">渠道：</text>
            <text class="value">{{ item.channelName || '-' }}</text>
          </view>
          <view class="amount-row">
            <view class="amount-item">
              <text class="amount-label">应返金额</text>
              <text class="amount-value">¥{{ formatNumber(item.shouldRebateAmount || 0) }}</text>
            </view>
            <view class="amount-item">
              <text class="amount-label">已返金额</text>
              <text class="amount-value">¥{{ formatNumber(item.paidRebateAmount || 0) }}</text>
            </view>
          </view>
          <view class="item-row">
            <text class="label">返点比例：</text>
            <text class="value">{{ ((item.rebateRate || 0) * 100).toFixed(2) }}%</text>
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
import { getRebateList } from '../../common/api/rebate'

export default {
  data() {
    return {
      dataList: [],
      loading: false,
      hasMore: true,
      refreshing: false,
      pageNo: 1,
      pageSize: 20,
      searchKeyword: '',
      activeMedia: 'all',
      queryParam: {}
    }
  },
  onLoad() {
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
    setMedia(media) {
      this.activeMedia = media
      this.queryParam = {}
      if (media !== 'all') {
        this.queryParam.channelId = media
      }
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },
    handleSearch() {
      if (this.searchKeyword) {
        this.queryParam.customerName = this.searchKeyword
        this.queryParam.proName = this.searchKeyword
      } else {
        delete this.queryParam.customerName
        delete this.queryParam.proName
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
        const res = await getRebateList(params)
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
    handleItemClick(item) {
      // 可以跳转到详情页
      console.log('点击项目:', item)
    },
    getStatusClass(status) {
      if (status === '已发放') return 'status-paid'
      if (status === '待发放') return 'status-pending'
      return 'status-other'
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
}

.navbar-right {
  width: 80rpx;
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
  font-size: 26rpx;
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

.item-status {
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
}

.status-pending {
  background: #fff7e6;
  color: #fa8c16;
}

.status-paid {
  background: #f6ffed;
  color: #52c41a;
}

.status-other {
  background: #f5f5f5;
  color: #999;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
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

.amount-row {
  display: flex;
  gap: 24rpx;
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  margin: 8rpx 0;
}

.amount-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.amount-label {
  font-size: 24rpx;
  color: #666;
}

.amount-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #2e87ff;
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

