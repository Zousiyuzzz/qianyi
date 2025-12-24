<template>
  <view class="page">
    <view class="navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">资金变动明细</view>
        <view class="navbar-right" @click="showFilter = !showFilter">
          <text class="filter-icon">筛选</text>
        </view>
      </view>
    </view>

    <view class="filter-panel" v-if="showFilter">
      <view class="filter-item">
        <text class="filter-label">类型：</text>
        <picker 
          mode="selector" 
          :range="typeOptions" 
          range-key="text"
          @change="handleTypeChange"
        >
          <view class="filter-value">
            {{ selectedType ? selectedType.text : '全部' }}
          </view>
        </picker>
      </view>
      <view class="filter-actions">
        <button class="filter-btn reset" @click="resetFilter">重置</button>
        <button class="filter-btn confirm" @click="applyFilter">确定</button>
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
        <view class="timeline-dot"></view>
        <view class="timeline-content">
          <view class="item-header">
            <view class="item-time">{{ item.createTime || '-' }}</view>
            <view class="item-type" :class="getTypeClass(item.changeType)">
              {{ getChangeTypeText(item.changeType) }}
            </view>
          </view>
          <view class="item-content">
            <view class="item-row">
              <text class="label">变动类型：</text>
              <text class="value">{{ getChangeTypeText(item.changeType) }}</text>
            </view>
            <view class="item-row">
              <text class="label">金额：</text>
              <text class="value" :class="getAmountClass(item.changeType)">
                {{ item.changeType === '2' || item.changeType === '3' ? '-' : '+' }}¥{{ formatNumber(item.money || 0) }}
              </text>
            </view>
            <view class="item-row" v-if="item.sourceNo">
              <text class="label">来源单号：</text>
              <text class="value link" @click="handleSourceClick(item)">{{ item.sourceNo }}</text>
            </view>
            <view class="item-row" v-if="item.createBy">
              <text class="label">操作人：</text>
              <text class="value">{{ item.createBy }}</text>
            </view>
            <view class="item-row" v-if="item.remark">
              <text class="label">备注：</text>
              <text class="value">{{ item.remark }}</text>
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
import { getProjectFundChangesList } from '../../common/api/project'

export default {
  data() {
    return {
      proId: '',
      month: '',
      dataList: [],
      loading: false,
      hasMore: true,
      refreshing: false,
      pageNo: 1,
      pageSize: 20,
      showFilter: false,
      queryParam: {},
      typeOptions: [
        { value: '', text: '全部' },
        { value: '1', text: '入账' },
        { value: '2', text: '出账' },
        { value: '3', text: '锁定' }
      ],
      selectedType: null
    }
  },
  onLoad(query) {
    this.proId = query.proId || ''
    this.month = query.month || ''
    if (this.proId) {
      this.queryParam.proId = this.proId
    }
    if (this.month) {
      this.queryParam.month = this.month
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
    handleTypeChange(e) {
      const index = e.detail.value
      this.selectedType = this.typeOptions[index]
    },
    resetFilter() {
      this.selectedType = null
    },
    applyFilter() {
      this.queryParam = { proId: this.proId }
      if (this.month) {
        this.queryParam.month = this.month
      }
      if (this.selectedType && this.selectedType.value) {
        this.queryParam.changeType = this.selectedType.value
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
        const res = await getProjectFundChangesList(params)
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
    handleSourceClick(item) {
      // 根据来源单号类型跳转到对应详情
      if (item.sourceType === 'arrival') {
        uni.navigateTo({
          url: `/pages/money/arrivalDetail?id=${item.sourceId}`
        })
      }
    },
    getChangeTypeText(type) {
      const map = {
        '1': '入账',
        '2': '出账',
        '3': '锁定'
      }
      return map[type] || type || '-'
    },
    getTypeClass(type) {
      const map = {
        '1': 'type-in',
        '2': 'type-out',
        '3': 'type-lock'
      }
      return map[type] || ''
    },
    getAmountClass(type) {
      if (type === '1') return 'amount-positive'
      if (type === '2' || type === '3') return 'amount-negative'
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

.filter-icon {
  font-size: 28rpx;
  color: #2e87ff;
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
  padding: 20rpx 24rpx 20rpx 60rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  margin-left: 0;
  margin-right: 0;
}

.timeline-dot {
  position: absolute;
  left: 24rpx;
  top: 24rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #2e87ff;
  border: 3rpx solid #fff;
  box-shadow: 0 0 0 2rpx #2e87ff;
  flex-shrink: 0;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 31rpx;
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
  gap: 16rpx;
}

.item-time {
  font-size: 24rpx;
  color: #999;
  flex-shrink: 0;
}

.item-type {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  flex-shrink: 0;
}

.type-in {
  background: #f6ffed;
  color: #52c41a;
}

.type-out {
  background: #fff1f0;
  color: #ff4d4f;
}

.type-lock {
  background: #fff7e6;
  color: #fa8c16;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-row {
  display: flex;
  align-items: flex-start;
  font-size: 24rpx;
  margin-bottom: 8rpx;
  word-break: break-all;
}

.label {
  color: #666;
  min-width: 100rpx;
  font-size: 24rpx;
  flex-shrink: 0;
}

.value {
  color: #333;
  flex: 1;
  font-size: 24rpx;
  word-break: break-all;
  overflow-wrap: break-word;
}

.value.link {
  color: #2e87ff;
  text-decoration: underline;
}

.value.amount-positive {
  color: #52c41a;
  font-weight: 600;
}

.value.amount-negative {
  color: #ff4d4f;
  font-weight: 600;
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

