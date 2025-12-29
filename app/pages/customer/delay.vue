<template>
  <view class="page" :style="{ paddingTop: (statusBarHeight + navBarContentHeight) + 'px' }">
    <!-- Navbar - 固定定位 -->
    <view class="navbar fixed-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">回款延期</view>
        <view class="navbar-right" @click="showFilter = !showFilter">
          <text class="filter-icon">⏷</text>
        </view>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-bar">
        <input class="search-input" v-model="searchKeyword" placeholder="搜索客户、项目" @confirm="handleSearch"
          confirm-type="search" />
        <text class="search-icon" @click="handleSearch">🔍</text>
      </view>
    </view>

    <!-- 筛选面板 -->
    <view class="filter-panel" v-if="showFilter">
      <view class="filter-item">
        <text class="filter-label">状态：</text>
        <picker mode="selector" :range="statusOptions" range-key="text" @change="handleStatusChange">
          <view class="filter-value">
            {{ selectedStatus ? selectedStatus.text : '全部' }}
          </view>
        </picker>
      </view>
      <view class="filter-actions">
        <button class="filter-btn reset" @click="resetFilter">重置</button>
        <button class="filter-btn confirm" @click="applyFilter">确定</button>
      </view>
    </view>

    <!-- List - 使用普通view，不再使用scroll-view -->
    <view class="page-content">
      <view class="list-item" v-for="(item, index) in dataList" :key="item.id || index" @click="handleItemClick(item)"
        hover-class="card-hover" hover-stay-time="80">
        <view class="item-header">
          <view class="item-title">{{ item.customerName || item.proName || '未知' }}</view>
          <view class="item-status" :class="getStatusClass(item.status)">
            {{ getStatusText(item.status) }}
          </view>
        </view>

        <view class="item-content">
          <view class="item-row">
            <text class="label">项目：</text>
            <text class="value">{{ item.proName || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">原到期日：</text>
            <text class="value">{{ item.originalDueDate || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">申请延期日：</text>
            <text class="value">{{ item.appliedDelayDate || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">延期原因：</text>
            <text class="value">{{ item.delayReason || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">审批人：</text>
            <text class="value">{{ item.approverName || '-' }}</text>
          </view>
        </view>

        <view class="item-actions" v-if="item.status === 'pending'">
          <button class="action-btn" @click.stop="handleApprove(item)">审批</button>
          <button class="action-btn reject" @click.stop="handleReject(item)">拒绝</button>
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
import { approvePaymentDelay, getPaymentDelayApplyList, rejectPaymentDelay } from '../../common/api/customer'

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
      showFilter: false,
      queryParam: {},
      statusOptions: [
        { value: '', text: '全部' },
        { value: 'pending', text: '待审批' },
        { value: 'approved', text: '已通过' },
        { value: 'rejected', text: '已拒绝' }
      ],
      selectedStatus: null,
      // 导航栏相关数据
      statusBarHeight: 0,
      navBarContentHeight: 44 // 导航栏内容高度44px
    }
  },
  onLoad() {
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
      return !!(this.searchKeyword || (this.queryParam && Object.keys(this.queryParam).length))
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
    handleStatusChange(e) {
      const index = e.detail.value
      this.selectedStatus = this.statusOptions[index]
    },
    resetFilter() {
      this.selectedStatus = null
    },
    applyFilter() {
      this.queryParam = {}
      if (this.selectedStatus && this.selectedStatus.value) {
        this.queryParam.status = this.selectedStatus.value
      }
      this.showFilter = false
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
        const res = await getPaymentDelayApplyList(params)
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
        url: `/pages/customer/delayDetail?id=${item.id}`
      })
    },
    handleApprove(item) {
      this.submitApproval(item, 'approve')
    },
    handleReject(item) {
      this.submitApproval(item, 'reject')
    },
    submitApproval(item, action) {
      const isApprove = action === 'approve'
      uni.showModal({
        title: isApprove ? '同意延期' : '拒绝延期',
        editable: true,
        placeholderText: '请输入审批原因，可选',
        success: async (res) => {
          if (!res.confirm) return
          try {
            const payload = {
              id: item.id,
              approvalReason: res.content || ''
            }
            if (isApprove) {
              await approvePaymentDelay(payload)
            } else {
              await rejectPaymentDelay(payload)
            }
            uni.showToast({
              title: isApprove ? '审批成功' : '已拒绝',
              icon: 'success'
            })
            this.handleRefresh()
          } catch (error) {
            uni.showToast({
              title: error.message || '操作失败',
              icon: 'none'
            })
          }
        }
      })
    },
    getStatusText(status) {
      const map = {
        'pending': '待审批',
        'approved': '已通过',
        'rejected': '已拒绝'
      }
      return map[status] || '未知'
    },
    getStatusClass(status) {
      const map = {
        'pending': 'status-pending',
        'approved': 'status-approved',
        'rejected': 'status-rejected'
      }
      return map[status] || ''
    },
    clearAllFilters() {
      this.searchKeyword = ''
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

.filter-panel {
  background: #fff;
  padding: 20rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.filter-label {
  font-size: 26rpx;
  color: #666;
  min-width: 100rpx;
}

.filter-value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
  padding: 12rpx 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

.filter-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 24rpx;
}

.filter-btn {
  flex: 1;
  height: 64rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-btn.reset {
  background: #f5f5f5;
  color: #666;
}

.filter-btn.confirm {
  background: #2e87ff;
  color: #fff;
}

.filter-btn::after {
  border: none;
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

.filter-icon {
  font-size: 34rpx;
  color: #0a84ff;
}

/* ===== Page Content ===== */
.page-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: 0;
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

.status-approved {
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

.item-actions {
  display: flex;
  gap: 12rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  flex: 1;
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

.action-btn.reject {
  background: #ff4d4f;
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
