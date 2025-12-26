<template>
  <view class="page" :style="{ paddingTop: (statusBarHeight + navBarContentHeight) + 'px' }">
    <!-- 导航栏 - 固定定位 -->
    <view class="navbar fixed-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">客户池海</view>
        <view class="navbar-right" @click="showFilter = !showFilter">
          <text class="filter-icon">⏷</text>
        </view>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-bar">
        <text class="search-icon" @click="handleSearch">🔎</text>
        <input class="search-input" v-model="searchKeyword" placeholder="搜索客户主体" @confirm="handleSearch"
          confirm-type="search" />
        <text class="clear-icon" v-if="searchKeyword" @click.stop="clearSearch">×</text>
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
    <view class="page-content">
      <view class="list-item" v-for="(item, index) in dataList" :key="item.id || index" @click="handleItemClick(item)">
        <view class="item-header">
          <view class="item-title-wrapper">
            <view class="item-title">{{ item.customerName || '未知客户' }}</view>
          </view>
          <view class="item-right">
            <view class="status-pill" :class="getCooperationStatusClass(item)">
              {{ getCooperationStatus(item) }}
            </view>
            <text class="arrow-icon">›</text>
          </view>
        </view>

        <view class="item-subtitle"
          v-if="item.projectsByClientDistinctOnOperationModes && item.projectsByClientDistinctOnOperationModes.length">
          <text class="subtext">{{ getOperationModes(item.projectsByClientDistinctOnOperationModes) }}</text>
        </view>

        <view class="item-content">
          <view class="line">
            <text class="icon">👤</text>
            <text class="text">商务：<text class="primary">{{ item.salesPerson_dictText || '-' }}</text></text>
          </view>
          <view class="line">
            <text class="icon">🌐</text>
            <text class="text">渠道：<text class="primary">{{ getChannels(item.lastConsumeTimeByProjectChannels) }}</text></text>
          </view>
          <view class="line">
            <text class="icon">🆔</text>
            <text class="text">客户ID：<text class="tertiary">{{ item.id || '-' }}</text></text>
          </view>
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
    </view>
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
      selectedOperationType: null,
      // 导航栏相关数据
      statusBarHeight: 0,
      navBarContentHeight: 44 // 导航栏内容高度44px
    }
  },
  onLoad() {
    // 获取状态栏高度
    this.getStatusBarHeight()
    this.loadBusinessOptions()
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
    clearSearch() {
      this.searchKeyword = ''
      delete this.queryParam.customerName
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

/* ===== Search / Controls ===== */
.search-section {
  background: #fff;
  padding: 16rpx 16rpx 12rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, .06);
}

.search-bar {
  display: flex;
  align-items: center;
  background: #ededf0;
  border-radius: 999px;
  height: 72rpx;
  padding: 0 18rpx;
}

.search-icon {
  font-size: 28rpx;
  color: #8e8e93;
  margin-right: 8rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #1c1c1e;
}

.clear-icon {
  font-size: 34rpx;
  color: #8e8e93;
  padding: 0 6rpx;
}

/* ===== Filter Panel ===== */
.filter-panel {
  background: #fff;
  padding: 18rpx 16rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, .06);
}

.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.filter-label {
  width: 140rpx;
  font-size: 26rpx;
  color: #3a3a3c;
}

.filter-value {
  flex: 1;
  font-size: 26rpx;
  color: #1c1c1e;
  padding: 14rpx 16rpx;
  background: #ededf0;
  border-radius: 14rpx;
}

.filter-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 8rpx;
}

.filter-btn {
  flex: 1;
  height: 68rpx;
  border-radius: 999px;
  font-size: 26rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-btn.reset {
  background: #ededf0;
  color: #3a3a3c;
}

.filter-btn.confirm {
  background: #0a84ff;
  color: #fff;
}

.filter-btn::after {
  border: none;
}

/* ===== Page Content ===== */
.page-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: 0;
  /* 让 flex 子元素正确计算高度 */
}

.card-hover {
  opacity: .92;
  transform: scale(0.99);
}

/* Card */
.list-item {
  background: #fff;
  margin: 12rpx 16rpx;
  padding: 18rpx 18rpx;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, .06);
}

/* Header */
.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.item-title-wrapper {
  flex: 1;
  margin-right: 12rpx;
}

.item-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #111;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
  padding-top: 2rpx;
}

.arrow-icon {
  font-size: 34rpx;
  font-weight: 300;
  color: #c7c7cc;
  margin-left: 2rpx;
}

.status-pill {
  padding: 6rpx 14rpx;
  border-radius: 999px;
  font-size: 22rpx;
  line-height: 1;
  background: rgba(10, 132, 255, 0.08);
  color: #0a84ff;
}

.status-normal {
  background: rgba(52, 199, 89, 0.12);
  color: #34c759;
}

.status-slow {
  background: rgba(255, 159, 10, 0.14);
  color: #ff9f0a;
}

.status-pending {
  background: rgba(255, 69, 58, 0.14);
  color: #ff3b30;
}

/* Subtitle */
.item-subtitle {
  margin-bottom: 10rpx;
}

.subtext {
  font-size: 24rpx;
  color: #6e6e73;
}

/* Content */
.item-content {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.line {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
}

.icon {
  width: 34rpx;
  text-align: center;
  font-size: 22rpx;
  opacity: .9;
  padding-top: 2rpx;
}

.text {
  font-size: 26rpx;
  line-height: 1.35;
  color: #1c1c1e;
  word-break: break-word;
}

.primary {
  color: #1c1c1e;
}

.secondary {
  color: #3a3a3c;
}

.tertiary {
  color: #8e8e93;
  font-size: 24rpx;
}

/* Footer states */
.loading-more,
.no-more,
.empty {
  text-align: center;
  padding: 40rpx 0;
  color: #8e8e93;
  font-size: 26rpx;
}

.tertiary {
  color: #6e6e73;
}

.list-action-btn {
  background: #f6f6f8;
  color: #0a84ff;
}

.list-action-btn::after {
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
