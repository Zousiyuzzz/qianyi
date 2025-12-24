<template>
  <view class="page">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">客户池海</view>
        <view class="navbar-right" @click="showFilter = !showFilter">
          <text class="filter-icon">筛选</text>
        </view>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-bar">
        <input class="search-input" v-model="searchKeyword" placeholder="搜索客户主体" @confirm="handleSearch"
          confirm-type="search" />
        <text class="search-icon" @click="handleSearch">🔍</text>
      </view>
    </view>

    <!-- 筛选面板 -->
    <view class="filter-panel" v-if="showFilter">
      <view class="filter-item">
        <text class="filter-label">商务：</text>
        <picker mode="selector" :range="businessOptions" range-key="text" @change="handleBusinessChange">
          <view class="filter-value">
            {{ selectedBusiness ? selectedBusiness.text : '全部' }}
          </view>
        </picker>
      </view>
      <view class="filter-item">
        <text class="filter-label">运营方式：</text>
        <picker mode="selector" :range="operationTypeOptions" range-key="text" @change="handleOperationTypeChange">
          <view class="filter-value">
            {{ selectedOperationType ? selectedOperationType.text : '全部' }}
          </view>
        </picker>
      </view>
      <view class="filter-actions">
        <button class="filter-btn reset" @click="resetFilter">重置</button>
        <button class="filter-btn confirm" @click="applyFilter">确定</button>
      </view>
    </view>

    <!-- 列表 -->
    <scroll-view class="list-scroll" scroll-y @scrolltolower="loadMore" :refresher-enabled="true"
      :refresher-triggered="refreshing" @refresherrefresh="handleRefresh">
      <view class="list-item" v-for="(item, index) in dataList" :key="item.id || index" @click="handleItemClick(item)">
        <view class="item-header">
          <view class="item-title">{{ item.customerName || '未知客户' }}</view>
          <view class="item-id">ID: {{ item.id }}</view>
        </view>

        <view class="item-content">
          <view class="item-row">
            <text class="label">商务：</text>
            <text class="value">{{ item.salesPerson_dictText || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">运营方式：</text>
            <text class="value">{{ getOperationModes(item.projectsByClientDistinctOnOperationModes) }}</text>
          </view>
          <view class="item-row">
            <text class="label">已合作渠道：</text>
            <text class="value channels">{{ getChannels(item.lastConsumeTimeByProjectChannels) }}</text>
          </view>
          <view class="item-row">
            <text class="label">合作状态：</text>
            <view class="status-badge" :class="getCooperationStatusClass(item)">
              {{ getCooperationStatus(item) }}
            </view>
          </view>
        </view>

        <view class="item-actions">
          <button class="action-btn" @click.stop="handleDetail(item)">详情</button>
          <button class="action-btn" @click.stop="handleConsume(item)">回款状态</button>
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
import { getCustomerList } from '../../common/api/customer'
import { openWebView } from '../../common/navigation'

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
      businessOptions: [{ value: '', text: '全部' }],
      selectedBusiness: null,
      operationTypeOptions: [
        { value: '', text: '全部' },
        { value: '1', text: '自运营' },
        { value: '2', text: '走量' },
        { value: '3', text: '收量' }
      ],
      selectedOperationType: null
    }
  },
  onLoad() {
    this.loadBusinessOptions()
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
    async loadBusinessOptions() {
      // 加载商务选项，可以从字典接口获取
      // 这里先使用空数组，实际应该调用字典接口
      try {
        // const res = await getDictItems('business_person')
        // if (res && res.success) {
        //   this.businessOptions = [{ value: '', text: '全部' }, ...res.result]
        // }
      } catch (e) {
        console.error('加载商务选项失败:', e)
      }
    },
    handleSearch() {
      if (this.searchKeyword) {
        this.queryParam.customerName = this.searchKeyword
      } else {
        delete this.queryParam.customerName
      }
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },
    handleBusinessChange(e) {
      const index = e.detail.value
      this.selectedBusiness = this.businessOptions[index]
    },
    handleOperationTypeChange(e) {
      const index = e.detail.value
      this.selectedOperationType = this.operationTypeOptions[index]
    },
    resetFilter() {
      this.selectedBusiness = null
      this.selectedOperationType = null
    },
    applyFilter() {
      this.queryParam = {}
      if (this.selectedBusiness && this.selectedBusiness.value) {
        this.queryParam.businessPerson = this.selectedBusiness.value
      }
      if (this.selectedOperationType && this.selectedOperationType.value) {
        this.queryParam.operationType = this.selectedOperationType.value
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
        const res = await getCustomerList(params)
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
        url: `/pages/customer/detail?id=${item.id}`
      })
    },
    handleConsume(item) {
      uni.navigateTo({
        url: `/pages/customer/backmoney?customerId=${item.id}&customerName=${encodeURIComponent(item.customerName || '')}`
      })
    },
    getOperationModes(modes) {
      if (!modes || !Array.isArray(modes)) {
        return '-'
      }
      const modeMap = {
        '1': '自运营',
        '2': '走量',
        '3': '收量'
      }
      const uniqueModes = [...new Set(modes)]
      return uniqueModes.map(m => modeMap[m] || m).join('、') || '-'
    },
    getChannels(channels) {
      if (!channels || !Array.isArray(channels)) {
        return '-'
      }
      const channelSigns = channels
        .map(ch => ch.channel_sign)
        .filter(sign => sign)
        .filter((sign, index, arr) => arr.indexOf(sign) === index)
      return channelSigns.join('、') || '-'
    },
    getCooperationStatus(item) {
      if (!item.lastConsumeTimeByProjectChannels || !Array.isArray(item.lastConsumeTimeByProjectChannels)) {
        return '待消耗'
      }
      // 根据最后消耗时间判断状态
      const now = Date.now()
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

      let hasRecent = false
      let hasOld = false

      item.lastConsumeTimeByProjectChannels.forEach(ch => {
        if (ch.last_consume_time) {
          const consumeTime = new Date(ch.last_consume_time).getTime()
          if (consumeTime > sevenDaysAgo) {
            hasRecent = true
          } else if (consumeTime > thirtyDaysAgo) {
            hasOld = true
          }
        }
      })

      if (hasRecent) {
        return '正常合作'
      } else if (hasOld) {
        return '合作放缓'
      } else {
        return '待消耗'
      }
    },
    getCooperationStatusClass(item) {
      const status = this.getCooperationStatus(item)
      if (status === '正常合作') {
        return 'status-normal'
      } else if (status === '合作放缓') {
        return 'status-slow'
      } else {
        return 'status-pending'
      }
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

.search-section {
  background: #fff;
  padding: 24rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 48rpx;
  padding: 0 24rpx;
  height: 72rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.search-icon {
  font-size: 32rpx;
  color: #999;
  margin-left: 16rpx;
}

.filter-panel {
  background: #fff;
  padding: 24rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.filter-label {
  font-size: 28rpx;
  color: #666;
  min-width: 140rpx;
}

.filter-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  padding: 16rpx 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

.filter-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 32rpx;
}

.filter-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
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

.item-id {
  font-size: 22rpx;
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

.value.channels {
  color: #2e87ff;
}

.status-badge {
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  display: inline-block;
}

.status-normal {
  background: #f6ffed;
  color: #52c41a;
}

.status-slow {
  background: #fff7e6;
  color: #fa8c16;
}

.status-pending {
  background: #e6f7ff;
  color: #1890ff;
}

.item-actions {
  display: flex;
  gap: 12rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
  justify-content: flex-start;
}

.action-btn {
  width: 25%;
  height: 48rpx;
  border-radius: 24rpx;
  font-size: 22rpx;
  background: #2e87ff;
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
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
