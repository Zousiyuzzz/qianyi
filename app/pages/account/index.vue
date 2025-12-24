<template>
  <view class="page">
    <view class="navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">账户列表</view>
        <view class="navbar-right" @click="showFilter = !showFilter">
          <text class="filter-icon">筛选</text>
        </view>
      </view>
    </view>

    <view class="search-section">
      <view class="search-bar">
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索账户名称"
          @confirm="handleSearch"
          confirm-type="search"
        />
        <text class="search-icon" @click="handleSearch">🔍</text>
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
        class="list-item" 
        v-for="(item, index) in dataList" 
        :key="item.id || index"
        @click="handleItemClick(item)"
      >
        <view class="item-header">
          <view class="item-title">{{ item.accountName || '未知账户' }}</view>
          <view class="item-status" :class="getStatusClass(item.status)">
            {{ item.status || '正常' }}
          </view>
        </view>
        
        <view class="item-content">
          <view class="item-row">
            <text class="label">主体：</text>
            <text class="value">{{ item.subjectName || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">类型：</text>
            <text class="value">{{ item.accountType || '-' }}</text>
          </view>
          <view class="amount-section">
            <view class="amount-item">
              <text class="amount-label">余额</text>
              <text class="amount-value">¥{{ formatNumber(item.balance || 0) }}</text>
            </view>
            <view class="amount-item">
              <text class="amount-label">授信</text>
              <text class="amount-value">¥{{ formatNumber(item.credit || 0) }}</text>
            </view>
          </view>
          <view class="item-row">
            <text class="label">负责人：</text>
            <text class="value">{{ item.ownerName || '-' }}</text>
          </view>
        </view>

        <view class="item-actions">
          <button class="action-btn" @click.stop="handleDetail(item)">详情</button>
          <button class="action-btn" @click.stop="handleFlow(item)">流水</button>
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
import { getAccountList } from '../../common/api/account'

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
      typeOptions: [
        { value: '', text: '全部' },
        { value: '1', text: '对公' },
        { value: '2', text: '对私' }
      ],
      selectedType: null
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
    handleSearch() {
      if (this.searchKeyword) {
        this.queryParam.keyword = this.searchKeyword
      } else {
        delete this.queryParam.keyword
      }
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },
    handleTypeChange(e) {
      const index = e.detail.value
      this.selectedType = this.typeOptions[index]
    },
    resetFilter() {
      this.selectedType = null
    },
    applyFilter() {
      this.queryParam = {}
      if (this.selectedType && this.selectedType.value) {
        this.queryParam.accountType = this.selectedType.value
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
        const res = await getAccountList(params)
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
    handleItemClick(item) {
      this.handleDetail(item)
    },
    handleDetail(item) {
      uni.navigateTo({
        url: `/pages/account/detail?id=${item.id}`
      })
    },
    handleFlow(item) {
      uni.navigateTo({
        url: `/pages/account/flow?accountId=${item.id}&accountName=${encodeURIComponent(item.accountName || '')}`
      })
    },
    getStatusClass(status) {
      if (status === '停用') return 'status-disabled'
      return 'status-active'
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

.status-active {
  background: #e6f7ff;
  color: #1890ff;
}

.status-disabled {
  background: #f5f5f5;
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

.amount-section {
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

