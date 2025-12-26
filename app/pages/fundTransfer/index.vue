<template>
  <view class="page" :style="{ paddingTop: (statusBarHeight + navBarContentHeight) + 'px' }">
    <!-- 导航栏 - 固定定位 -->
    <view class="navbar fixed-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">充退处理列表</view>
        <view class="navbar-right" @click="handleAdd">
          <text class="add-icon">+</text>
        </view>
      </view>
    </view>

    <!-- 搜索和筛选 -->
    <view class="search-section">
      <view class="search-bar">
        <input class="search-input" v-model="searchKeyword" placeholder="搜索项目名称、账户ID" @confirm="handleSearch"
          confirm-type="search" />
        <text class="search-icon" @click="handleSearch">🔍</text>
      </view>

      <view class="filter-tabs">
        <view class="filter-tab" :class="{ active: activeFilter === 'all' }" @click="setFilter('all')">
          全部
        </view>
        <view class="filter-tab" :class="{ active: activeFilter === 'pending' }" @click="setFilter('pending')">
          待处理
        </view>
        <view class="filter-tab" :class="{ active: activeFilter === 'agreed' }" @click="setFilter('agreed')">
          已同意
        </view>
        <view class="filter-tab" :class="{ active: activeFilter === 'rejected' }" @click="setFilter('rejected')">
          已驳回
        </view>
      </view>
    </view>

    <!-- 列表 -->
    <!-- 列表 -->
    <view class="page-content">
      <view class="list-item" v-for="(item, index) in dataList" :key="item.id || index" @click="handleItemClick(item)">
        <view class="item-header">
          <view class="item-title">{{ item.proName || '未知项目' }}</view>
          <view class="item-status" :class="getStatusClass(item.state)">
            {{ getStatusText(item.state) }}
          </view>
        </view>

        <view class="item-content">
          <view class="item-row">
            <text class="label">交易类型：</text>
            <text class="value">{{ getTradeTypeText(item.tradeType) }}</text>
          </view>
          <view class="item-row">
            <text class="label">交易金额：</text>
            <text class="value amount">¥{{ formatNumber(item.amount || 0) }}</text>
          </view>
          <view class="item-row">
            <text class="label">转入账户：</text>
            <text class="value">{{ item.targetAdvertiserId || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">转出账户：</text>
            <text class="value">{{ item.sourceAdvertiserId || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">交易时间：</text>
            <text class="value">{{ item.createTime || '-' }}</text>
          </view>
        </view>

        <view class="item-actions" v-if="item.state === '2'">
          <button class="action-btn agree" @click.stop="handleAgree(item)">同意</button>
          <button class="action-btn reject" @click.stop="handleReject(item)">驳回</button>
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
import {
  getFundTransferRecordList,
  agreeFundTransfer,
  rejectFundTransfer
} from '../../common/api/fund'

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
      activeFilter: 'all',
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
      return this.activeFilter !== 'all' || this.searchKeyword.trim() !== ''
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
    handleAdd() {
      // 跳转到新增充退页面
      uni.navigateTo({
        url: '/pages/fundTransfer/add'
      })
    },
    setFilter(filter) {
      this.activeFilter = filter
      this.queryParam = {}
      if (filter === 'pending') {
        this.queryParam.state = '2'
      } else if (filter === 'agreed') {
        this.queryParam.state = '1'
      } else if (filter === 'rejected') {
        this.queryParam.state = '3'
      }
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },
    handleSearch() {
      if (this.searchKeyword) {
        this.queryParam.proName = this.searchKeyword
        this.queryParam.targetAdvertiserId = this.searchKeyword
        this.queryParam.sourceAdvertiserId = this.searchKeyword
      } else {
        delete this.queryParam.proName
        delete this.queryParam.targetAdvertiserId
        delete this.queryParam.sourceAdvertiserId
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
        const res = await getFundTransferRecordList(params)
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
      // 传递数据到详情页
      uni.setStorageSync('_temp_fundTransfer_data', item)
      uni.navigateTo({
        url: `/pages/fundTransfer/detail?id=${item.id}`
      })
    },
    async handleAgree(item) {
      uni.showModal({
        title: '确认',
        content: '确定要同意这条记录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await agreeFundTransfer(item.id)
              if (result && result.success) {
                uni.showToast({
                  title: '同意成功',
                  icon: 'success'
                })
                this.handleRefresh()
              } else {
                uni.showToast({
                  title: result.message || '操作失败',
                  icon: 'none'
                })
              }
            } catch (e) {
              uni.showToast({
                title: e.message || '操作失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    async handleReject(item) {
      uni.showModal({
        title: '确认',
        content: '确定要驳回这条记录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await rejectFundTransfer(item.id)
              if (result && result.success) {
                uni.showToast({
                  title: '驳回成功',
                  icon: 'success'
                })
                this.handleRefresh()
              } else {
                uni.showToast({
                  title: result.message || '操作失败',
                  icon: 'none'
                })
              }
            } catch (e) {
              uni.showToast({
                title: e.message || '操作失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    getStatusText(state) {
      const map = {
        '1': '已同意',
        '2': '待处理',
        '3': '已驳回'
      }
      return map[state] || '未知'
    },
    getStatusClass(state) {
      const map = {
        '1': 'status-agreed',
        '2': 'status-pending',
        '3': 'status-rejected'
      }
      return map[state] || ''
    },
    getTradeTypeText(type) {
      const map = {
        '1': '充值',
        '2': '转账',
        '3': '退款'
      }
      return map[type] || '未知'
    },
    formatNumber(num) {
      if (!num) return '0.00'
      return Number(num).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    clearAllFilters() {
      this.searchKeyword = ''
      this.activeFilter = 'all'
      this.queryParam = {}
      this.pageNo = 1
      this.dataList = []
      this.loadData()
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

.add-icon {
  font-size: 34rpx;
  color: #0a84ff;
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
  padding: 24rpx 24rpx 16rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.search-bar {
  display: flex;
  align-items: center;
  background: #ededf0;
  border-radius: 999px;
  padding: 0 20rpx;
  height: 72rpx;
  margin-bottom: 24rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #1c1c1e;
}

.search-icon {
  font-size: 32rpx;
  color: #8e8e93;
  margin-left: 16rpx;
}

.filter-tabs {
  display: flex;
  gap: 16rpx;
}

.filter-tab {
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  background: #f5f5f5;
  color: #666;
  font-size: 26rpx;
}

.filter-tab.active {
  background: #2e87ff;
  color: #fff;
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
}

.item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.item-status {
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-size: 22rpx;
}

.status-pending {
  background: #fff7e6;
  color: #fa8c16;
}

.status-agreed {
  background: #f6ffed;
  color: #52c41a;
}

.status-rejected {
  background: #fff1f0;
  color: #ff4d4f;
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

.value.amount {
  color: #2e87ff;
  font-weight: 600;
}

.item-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  flex: 1;
  height: 56rpx;
  border-radius: 28rpx;
  font-size: 24rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.agree {
  background: #2e87ff;
  color: #fff;
}

.action-btn.reject {
  background: #ff4d4f;
  color: #fff;
}

.action-btn::after {
  border: none;
}

.loading-more,
.no-more {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 26rpx;
}
</style>
