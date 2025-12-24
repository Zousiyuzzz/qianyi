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
        <text class="search-icon" @click="handleSearch">🔎</text>
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索项目、渠道"
          @confirm="handleSearch"
          confirm-type="search"
        />
        <text class="clear-icon" v-if="searchKeyword" @click.stop="clearSearch">×</text>
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
          <view class="item-right">
            <view class="month-chip">{{ item.month || '-' }}</view>
            <text class="arrow-icon">›</text>
          </view>
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
    clearSearch() {
      this.searchKeyword = ''
      delete this.queryParam.proName
      delete this.queryParam.business_name
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

<style scoped lang="scss">
@import '../../common/styles/ios-common.scss';

.list-item {
  padding-bottom: 14rpx;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.month-chip {
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  background: rgba(10, 132, 255, 0.1);
  color: #0a84ff;
}

.item-row .label {
  width: 160rpx;
}

.value.amount {
  color: #0a84ff;
  font-weight: 600;
}

.value.overdue {
  color: #ff3b30;
  font-weight: 600;
}

.item-actions {
  padding-top: 12rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
}

.action-btn {
  width: 100%;
  height: 62rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  background: #0a84ff;
  color: #fff;
  border: none;
}

.action-btn::after {
  border: none;
}

.loading-more,
.no-more,
.empty {
  text-align: center;
  padding: 18rpx 0 28rpx;
  color: #8e8e93;
  font-size: 24rpx;
}
</style>
