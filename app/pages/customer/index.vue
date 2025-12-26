<template>
  <view class="page" :style="{ paddingTop: (statusBarHeight + navBarContentHeight) + 'px' }">
    <!-- Navbar - 固定定位 -->
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

    <!-- Search + Summary + Sort -->
    <view class="search-section">
      <view class="search-bar">
        <text class="search-icon" @click="handleSearch">🔎</text>
        <input class="search-input" v-model="searchKeyword" placeholder="搜索客户主体" @confirm="handleSearch"
          confirm-type="search" />
        <!-- <text class="clear-icon" v-if="searchKeyword" @click.stop="clearSearch">×</text> -->
      </view>

      <!-- Filter summary -->
      <view class="filter-summary" v-if="hasActiveFilters">
        <view class="filter-tags">
          <view class="filter-tag" v-for="(tag, index) in activeFilterTags" :key="index"
            @click.stop="removeFilter(tag.key)">
            <text class="tag-text">{{ tag.label }}</text>
            <text class="tag-close">×</text>
          </view>
        </view>
        <text class="clear-all" @click.stop="clearAllFilters">清除</text>
      </view>

    </view>

    <!-- Filter panel -->
    <view class="filter-panel" v-if="showFilter">
      <!-- <view class="filter-item">
        <text class="filter-label">商务</text>
        <picker mode="selector" :range="businessOptions" range-key="text" @change="handleBusinessChange">
          <view class="filter-value">{{ selectedBusiness ? selectedBusiness.text : '全部' }}</view>
        </picker>
      </view> -->

      <view class="filter-item">
        <text class="filter-label">运营方式</text>
        <picker mode="selector" :range="operationTypeOptions" range-key="text" @change="handleOperationTypeChange">
          <view class="filter-value">{{ selectedOperationType ? selectedOperationType.text : '全部' }}</view>
        </picker>
      </view>

      <view class="filter-actions">
        <button class="filter-btn reset" @click="resetFilter">重置</button>
        <button class="filter-btn confirm" @click="applyFilter">确定</button>
      </view>
    </view>

    <!-- List - 使用普通view，不再使用scroll-view -->
    <view class="page-content">
      <!-- Skeleton -->
      <view class="skeleton-list" v-if="loading && dataList.length === 0">
        <view class="skeleton-item" v-for="n in 6" :key="n">
          <view class="skeleton-line w60"></view>
          <view class="skeleton-line w85"></view>
          <view class="skeleton-line w45"></view>
        </view>
      </view>

      <!-- Cards -->
      <view class="list-item" v-for="(item, index) in dataList" :key="item.id || index" @click="handleItemClick(item)"
        hover-class="card-hover" hover-stay-time="80">
        <!-- Header: title + status + arrow -->
        <view class="item-header">
          <view class="item-title-wrapper">
            <text class="item-title">{{ item.customerName || '未知客户' }}</text>
          </view>
          <view class="item-right">
            <view class="status-pill" :class="getCooperationStatusClass(item)">
              {{ getCooperationStatus(item) }}
            </view>
            <text class="arrow-icon">›</text>
          </view>
        </view>

        <!-- Subtitle: 运营方式 -->
        <!-- <view class="item-subtitle"
          v-if="item.projectsByClientDistinctOnOperationModes && item.projectsByClientDistinctOnOperationModes.length">
          <text class="subtext">{{ getOperationModes(item.projectsByClientDistinctOnOperationModes) }}</text>
        </view> -->

        <!-- Content -->
        <view class="item-content">
          <view class="line">
            <text class="text">商务：<text class="primary">{{ item.salesPerson_dictText || '-' }}</text></text>
          </view>
          <view class="line">
            <text class="text">渠道：<text class="primary">{{ getChannels(item.lastConsumeTimeByProjectChannels)
                }}</text></text>
          </view>
          <view class="line">
            <text class="text">运营方式：<text class="tertiary">{{
              getOperationModes(item.projectsByClientDistinctOnOperationModes) }}</text></text>
          </view>
        </view>
      </view>

      <view class="loading-more" v-if="loading && dataList.length > 0">
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
import { getCustomerList } from '../../common/api/customer'

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

      // 导航栏相关数据
      statusBarHeight: 0,
      navBarContentHeight: 44, // 导航栏内容高度44px

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
  computed: {
    hasActiveFilters() {
      return !!(this.selectedBusiness || this.selectedOperationType || this.searchKeyword)
    },
    activeFilterTags() {
      const tags = []
      if (this.selectedBusiness && this.selectedBusiness.value) tags.push({ key: 'businessPerson', label: this.selectedBusiness.text })
      if (this.selectedOperationType && this.selectedOperationType.value) tags.push({ key: 'operationType', label: this.selectedOperationType.text })
      if (this.searchKeyword) tags.push({ key: 'keyword', label: `搜索：${this.searchKeyword}` })
      return tags
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
    clearSearch() {
      this.searchKeyword = ''
      delete this.queryParam.customerName
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },
    handleSearch() {
      if (this.searchKeyword) {
        this.queryParam.customerName = `*${this.searchKeyword}*`
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
    removeFilter(key) {
      if (key === 'businessPerson') this.selectedBusiness = null
      if (key === 'operationType') this.selectedOperationType = null
      if (key === 'keyword') {
        this.searchKeyword = ''
        delete this.queryParam.customerName
      }
      this.applyFilter()
    },
    clearAllFilters() {
      this.searchKeyword = ''
      this.selectedBusiness = null
      this.selectedOperationType = null
      this.queryParam = {}
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
          if (this.pageNo === 1) this.dataList = records
          else this.dataList = [...this.dataList, ...records]
          this.hasMore = records.length >= this.pageSize
        } else {
          uni.showToast({ title: res.message || '加载失败', icon: 'none' })
        }
      } catch (e) {
        console.error('加载数据失败:', e)
        uni.showToast({ title: e.message || '加载失败', icon: 'none' })
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
      uni.setStorageSync('_temp_customer_data', item)
      uni.navigateTo({
        url: `/pages/customer/detail?id=${item.id}`
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
    getChannelStatusSummary(channels) {
      if (!channels || !Array.isArray(channels)) {
        return '待消耗'
      }

      const today = new Date();
      let activeCount = 0; // 合作中的渠道数
      let stoppedCount = 0; // 停投的渠道数

      channels.forEach(channel => {
        if (channel.data) {
          const targetDate = new Date(channel.data);
          const timeDiff = today.getTime() - targetDate.getTime();
          const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

          if (daysDiff < 30) {
            activeCount++;
          } else {
            stoppedCount++;
          }
        }
      });

      // 根据状态返回汇总信息
      if (activeCount === 0 && stoppedCount > 0) {
        return '全部停投'
      } else if (activeCount > 0 && stoppedCount > 0) {
        return '部分停投'
      } else if (activeCount > 0 && stoppedCount === 0) {
        return '合作中'
      } else {
        return '待消耗'
      }
    },
    getCooperationStatus(item) {

      if (!item.lastConsumeTimeByProjectChannels || !Array.isArray(item.lastConsumeTimeByProjectChannels)) {
        return '待消耗'
      }
      return this.getChannelStatusSummary(item.lastConsumeTimeByProjectChannels);

    },
    getCooperationStatusClass(item) {
      const status = this.getCooperationStatus(item)
      if (status === '合作中') {
        return 'status-normal'
      } else if (status === '部分停投') {
        return 'status-slow'
      } else {
        return 'status-pending'
      }
    }
  }
}
</script>

<style scoped>
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

/* Filter summary */
.filter-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  flex: 1;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 12rpx;
  background: rgba(10, 132, 255, .10);
  border-radius: 999px;
}

.tag-text {
  font-size: 22rpx;
  color: #0a84ff;
}

.tag-close {
  font-size: 24rpx;
  color: #0a84ff;
  line-height: 1;
}

.clear-all {
  font-size: 24rpx;
  color: #0a84ff;
  padding: 6rpx 10rpx;
}

/* Segmented */
.segmented {
  margin-top: 12rpx;
  background: #ededf0;
  border-radius: 14rpx;
  padding: 6rpx;
  display: flex;
  gap: 6rpx;
}

.seg-item {
  flex: 1;
  height: 56rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #6e6e73;
}

.seg-item.active {
  background: #fff;
  color: #1c1c1e;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, .06);
}

.seg-arrow {
  font-size: 20rpx;
  margin-left: 6rpx;
  color: #8e8e93;
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
  /* 隐藏滚动条 */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE 和 Edge */
}

.page-content::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
  width: 0;
  height: 0;
  background: transparent;
}

.card-hover {
  opacity: .92;
  transform: scale(0.99);
}

/* Skeleton */
.skeleton-list {
  padding: 16rpx;
}

.skeleton-item {
  background: #fff;
  margin-bottom: 12rpx;
  padding: 18rpx;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, .06);
}

.skeleton-line {
  height: 22rpx;
  margin-bottom: 14rpx;
  border-radius: 10rpx;
  background: linear-gradient(90deg, #f0f0f3 25%, #e7e7ec 50%, #f0f0f3 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-line.w60 {
  width: 60%;
  height: 28rpx;
}

.skeleton-line.w85 {
  width: 85%;
}

.skeleton-line.w45 {
  width: 45%;
  margin-bottom: 0;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
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

.dot {
  color: #c7c7cc;
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

.sep {
  margin: 0 8rpx;
  color: #c7c7cc;
}

.two-line {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* Footer states */
.loading-more,
.no-more {
  text-align: center;
  padding: 40rpx 0;
  color: #8e8e93;
  font-size: 26rpx;
}
</style>
