<template>
  <view class="page">
    <view class="navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">客户退款</view>
        <view class="navbar-right" @click="handleAdd">
          <text class="add-icon">+</text>
        </view>
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

    <view class="filter-tabs">
      <view 
        class="filter-tab" 
        :class="{ active: activeStatus === 'all' }"
        @click="setStatus('all')"
      >
        全部
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: activeStatus === 'pending' }"
        @click="setStatus('pending')"
      >
        待审批
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: activeStatus === 'approved' }"
        @click="setStatus('approved')"
      >
        已通过
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: activeStatus === 'rejected' }"
        @click="setStatus('rejected')"
      >
        已拒绝
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
            {{ getStatusText(item.status) }}
          </view>
        </view>
        
        <view class="item-content">
          <view class="item-row">
            <text class="label">项目：</text>
            <text class="value">{{ item.proName || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">退款时间：</text>
            <text class="value">{{ item.refundTime || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">退款金额：</text>
            <text class="value amount">¥{{ formatNumber(item.refundAmount || 0) }}</text>
          </view>
          <view class="item-row" v-if="item.reason">
            <text class="label">原因：</text>
            <text class="value">{{ item.reason }}</text>
          </view>
          <view class="item-row" v-if="item.originalArrivalNo">
            <text class="label">原到账单号：</text>
            <text class="value">{{ item.originalArrivalNo }}</text>
          </view>
        </view>

        <view class="item-actions" v-if="item.status === 'pending'">
          <button class="action-btn" @click.stop="handleApprove(item)">审批</button>
          <button class="action-btn reject" @click.stop="handleReject(item)">驳回</button>
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
import { getCustomerRefundList } from '../../common/api/money'

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
      activeStatus: 'all',
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
    handleAdd() {
      uni.navigateTo({
        url: '/pages/money/refundAdd'
      })
    },
    setStatus(status) {
      this.activeStatus = status
      this.queryParam = {}
      if (status === 'pending') {
        this.queryParam.status = 'pending'
      } else if (status === 'approved') {
        this.queryParam.status = 'approved'
      } else if (status === 'rejected') {
        this.queryParam.status = 'rejected'
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
        const res = await getCustomerRefundList(params)
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
      uni.navigateTo({
        url: `/pages/money/refundDetail?id=${item.id}`
      })
    },
    handleApprove(item) {
      uni.showModal({
        title: '确认',
        content: '确定要通过这个退款申请吗？',
        success: (res) => {
          if (res.confirm) {
            // TODO: 调用审批接口
            uni.showToast({
              title: '审批成功',
              icon: 'success'
            })
            this.handleRefresh()
          }
        }
      })
    },
    handleReject(item) {
      uni.showModal({
        title: '确认',
        content: '确定要驳回这个退款申请吗？',
        success: (res) => {
          if (res.confirm) {
            // TODO: 调用驳回接口
            uni.showToast({
              title: '已驳回',
              icon: 'success'
            })
            this.handleRefresh()
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
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.add-icon {
  font-size: 40rpx;
  color: #2e87ff;
  font-weight: 300;
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
  text-align: right;
}

.value.amount {
  color: #ff4d4f;
  font-weight: 600;
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
.no-more,
.empty {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 26rpx;
}
</style>

