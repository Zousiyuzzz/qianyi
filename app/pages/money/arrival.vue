<template>
  <view class="page" :style="{ paddingTop: (statusBarHeight + navBarContentHeight) + 'px' }">
    <!-- 导航栏 - 固定定位 -->
    <view class="navbar fixed-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">客户到账</view>
        <view class="navbar-right" @click="showAdd = true">
          <text class="add-icon">+</text>
        </view>
      </view>
    </view>

    <view class="search-section">
      <view class="search-bar">
        <input class="search-input" v-model="searchKeyword" placeholder="搜索客户、项目" @confirm="handleSearch"
          confirm-type="search" />
        <text class="search-icon" @click="handleSearch">🔍</text>
      </view>
    </view>

    <!-- 列表 -->
    <view class="page-content">
      <view class="list-item" v-for="(item, index) in dataList" :key="item.id || index" @click="handleItemClick(item)">
        <view class="item-header">
          <view class="item-title">{{ item.customerName || item.proName || '未知' }}</view>
          <view class="item-status" :class="getStatusClass(item.status)">
            {{ item.status || '已确认' }}
          </view>
        </view>

        <view class="item-content">
          <view class="item-row">
            <text class="label">项目：</text>
            <text class="value">{{ item.proName || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">到账时间：</text>
            <text class="value">{{ item.arrivalTime || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">金额：</text>
            <text class="value amount">¥{{ formatNumber(item.amount || 0) }}</text>
          </view>
          <view class="item-row">
            <text class="label">支付方式：</text>
            <text class="value">{{ item.payMethod || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">到账渠道：</text>
            <text class="value">{{ item.arrivalChannel || '-' }}</text>
          </view>
          <view class="item-row" v-if="item.ticketNo">
            <text class="label">票据号：</text>
            <text class="value">{{ item.ticketNo }}</text>
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
import { getCustomerArrivalList } from '../../common/api/money'
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
      showAdd: false,
      queryParam: {},
      // 导航栏相关数据
      statusBarHeight: 0,
      navBarContentHeight: 44 // 导航栏内容高度44px
    }
  },
  onLoad() {
    // 获取状态栏高度
    this.getStatusBarHeight()
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
      return false
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
        const res = await getCustomerArrivalList(params)
        if (res && res.success) {
          const result = (res && res.result) ? res.result : {}
          const records = result.records || result.list || []
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
      this.loadData().finally(() => {
        // 停止下拉刷新
        uni.stopPullDownRefresh()
        this.refreshing = false
      })
    },
    handleItemClick(item) {
      uni.navigateTo({
        url: `/pages/money/arrivalDetail?id=${item.id}`
      })
    },
    getStatusClass(status) {
      if (status === '已确认') return 'status-confirmed'
      if (status === '待确认') return 'status-pending'
      return 'status-other'
    },
    formatNumber(num) {
      if (!num) return '0.00'
      return Number(num).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    clearAllFilters() {
      // No filters to clear
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../common/styles/ios-common.scss';

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
  background: #fff !important;
  background-color: #fff !important;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

/* ===== Page Content ===== */
.page-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: 0; /* 让 flex 子元素正确计算高度 */
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

.search-section {
  background: #fff;
  padding: 16rpx 16rpx 12rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.search-bar {
  display: flex;
  align-items: center;
  background: #ededf0;
  border-radius: 999px;
  padding: 0 18rpx;
  height: 72rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #1c1c1e;
}

.search-icon {
  font-size: 28rpx;
  color: #8e8e93;
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

.status-confirmed {
  background: #f6ffed;
  color: #52c41a;
}

.status-pending {
  background: #fff7e6;
  color: #fa8c16;
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
  text-align: right;
}

.value.amount {
  color: #2e87ff;
  font-weight: 600;
}

.loading-more,
.no-more {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 26rpx;
}
</style>
