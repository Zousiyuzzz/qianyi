<template>
  <view class="page">
    <view class="navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">{{ proName || '项目资金池' }}</view>
        <view class="navbar-right"></view>
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
          <view class="item-title">{{ item.proName || '-' }}</view>
          <view class="item-status">{{ getCollaborationModeText(item.collaborationMode) }}</view>
        </view>
        
        <view class="item-content">
          <view class="item-row">
            <text class="label">项目ID：</text>
            <text class="value">{{ item.proUniqueId || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">合作方式：</text>
            <text class="value">{{ getCollaborationModeText(item.collaborationMode) }}</text>
          </view>
          <view class="amount-row">
            <view class="amount-item">
              <text class="amount-label">授信总额度</text>
              <text class="amount-value">¥{{ formatNumber(item.totalCreditLimit || 0) }}</text>
            </view>
            <view class="amount-item">
              <text class="amount-label">授信可用余额</text>
              <text class="amount-value">¥{{ formatNumber(item.availableCreditBalance || 0) }}</text>
            </view>
          </view>
          <view class="amount-row">
            <view class="amount-item">
              <text class="amount-label">总备款</text>
              <text class="amount-value positive">¥{{ formatNumber(item.totalCashReserve || 0) }}</text>
            </view>
            <view class="amount-item">
              <text class="amount-label">总欠款</text>
              <text class="amount-value negative">¥{{ formatNumber(item.totalArrears || 0) }}</text>
            </view>
          </view>
          <view class="amount-row">
            <view class="amount-item">
              <text class="amount-label">合计总余额</text>
              <text class="amount-value">¥{{ formatNumber(item.totalBalanceSum || 0) }}</text>
            </view>
            <view class="amount-item">
              <text class="amount-label">可用余额</text>
              <text class="amount-value">¥{{ formatNumber(item.availablebBalance || 0) }}</text>
            </view>
          </view>
        </view>

        <view class="item-actions">
          <button class="action-btn" @click.stop="handleDetail(item)">详情</button>
          <button class="action-btn" @click.stop="handleChangeLog(item)">变动明细</button>
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
import { getProjectFundPoolList } from '../../common/api/project'

export default {
  data() {
    return {
      proId: '',
      proName: '',
      dataList: [],
      loading: false,
      hasMore: true,
      refreshing: false,
      pageNo: 1,
      pageSize: 20
    }
  },
  onLoad(query) {
    this.proId = query.proId || ''
    this.proName = decodeURIComponent(query.proName || '')
    if (this.proId) {
      this.queryParam = { proId: this.proId }
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
    async loadData() {
      if (this.loading) return
      this.loading = true
      try {
        const params = {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          proId: this.proId
        }
        const res = await getProjectFundPoolList(params)
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
      this.handleDetail(item)
    },
    handleDetail(item) {
      uni.navigateTo({
        url: `/pages/project/fundPoolDetail?id=${item.id}`
      })
    },
    handleChangeLog(item) {
      uni.navigateTo({
        url: `/pages/project/fundChangeLog?proId=${item.proId || this.proId}`
      })
    },
    getCollaborationModeText(mode) {
      const map = {
        '0': '预付',
        '1': '垫付',
        '2': '服务费'
      }
      return map[mode] || '-'
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
  font-size: 24rpx;
  color: #999;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.amount-row {
  display: flex;
  gap: 24rpx;
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
  color: #333;
}

.amount-value.positive {
  color: #52c41a;
}

.amount-value.negative {
  color: #ff4d4f;
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

.value.locked {
  color: #fa8c16;
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



