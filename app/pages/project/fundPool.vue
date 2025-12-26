<template>
  <view class="page" :style="{ paddingTop: (statusBarHeight + navBarContentHeight) + 'px' }">
    <!-- Navbar -->
    <view class="navbar fixed-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">{{ proName || '项目资金池' }}</view>
        <view class="navbar-right" @click="toggleFilter">
          <text class="filter-icon">{{ showFilter ? '⏶' : '⏷' }}</text>
        </view>
      </view>
    </view>

    <!-- Search + Sort（固定在 navbar 下方） -->
    <view class="search-section">
      <view class="search-bar">
        <text class="search-icon" @click="handleSearch">🔎</text>
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索项目名称"
          @confirm="handleSearch"
          confirm-type="search"
        />
        <text class="clear-icon" v-if="searchKeyword" @click.stop="clearSearch">×</text>
      </view>

      <!-- 已选条件 tags -->
      <view class="filter-summary" v-if="hasActiveFilters">
        <scroll-view class="filter-tags" scroll-x :show-scrollbar="false">
          <view class="tags-inner">
            <view
              class="filter-tag"
              v-for="(tag, index) in activeFilterTags"
              :key="index"
              @click.stop="removeFilter(tag.key)"
            >
              <text class="tag-text">{{ tag.label }}</text>
              <text class="tag-close">×</text>
            </view>
          </view>
        </scroll-view>
        <text class="clear-all" @click.stop="clearAllFilters">清除</text>
      </view>

      <!-- Sort segmented -->
      <view class="segmented">
        <view class="seg-item" :class="{ active: sortField === 'availableCreditBalance' }" @click="handleSort('availableCreditBalance')">
          <text>授信可用</text>
          <text class="seg-arrow" v-if="sortField === 'availableCreditBalance'">{{ sortOrder === 'desc' ? '↓' : '↑' }}</text>
        </view>
        <view class="seg-item" :class="{ active: sortField === 'totalCashReserve' }" @click="handleSort('totalCashReserve')">
          <text>总备款</text>
          <text class="seg-arrow" v-if="sortField === 'totalCashReserve'">{{ sortOrder === 'desc' ? '↓' : '↑' }}</text>
        </view>
        <view class="seg-item" :class="{ active: sortField === 'totalArrears' }" @click="handleSort('totalArrears')">
          <text>总欠款</text>
          <text class="seg-arrow" v-if="sortField === 'totalArrears'">{{ sortOrder === 'desc' ? '↓' : '↑' }}</text>
        </view>
      </view>
    </view>

    <!-- Filter panel -->
    <view class="filter-panel" v-if="showFilter">
      <view class="filter-item">
        <text class="filter-label">欠款筛选</text>
        <picker mode="selector" :range="arrearsOptions" range-key="text" @change="handleArrearsChange">
          <view class="filter-value">{{ selectedArrears ? selectedArrears.text : '全部' }}</view>
        </picker>
      </view>

      <view class="filter-actions">
        <button class="filter-btn reset" @click="resetFilter">重置</button>
        <button class="filter-btn confirm" @click="applyFilter">确定</button>
      </view>
    </view>

    <!-- List -->
    <view class="page-content">
      <!-- Skeleton（首屏加载） -->
      <view class="skeleton-list" v-if="loading && dataList.length === 0">
        <view class="skeleton-item" v-for="n in 6" :key="n">
          <view class="skeleton-line w70"></view>
          <view class="skeleton-line w50"></view>
          <view class="skeleton-line w90"></view>
        </view>
      </view>

      <view
        class="list-item"
        v-for="(item, index) in dataList"
        :key="item.id || index"
        @click="handleItemClick(item)"
        hover-class="card-hover"
        hover-stay-time="80"
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

          <view class="amount-grid">
            <view class="amount-cell">
              <text class="amount-label">授信可用余额</text>
              <text class="amount-value">¥{{ formatNumber(item.availableCreditBalance || 0) }}</text>
            </view>
            <view class="amount-cell">
              <text class="amount-label">总备款</text>
              <text class="amount-value positive">¥{{ formatNumber(item.totalCashReserve || 0) }}</text>
            </view>
            <view class="amount-cell">
              <text class="amount-label">总欠款</text>
              <text class="amount-value negative">¥{{ formatNumber(item.totalArrears || 0) }}</text>
            </view>
            <view class="amount-cell">
              <text class="amount-label">合计总余额</text>
              <text class="amount-value">¥{{ formatNumber(item.totalBalanceSum || 0) }}</text>
            </view>
          </view>
        </view>

        <view class="item-actions">
          <button class="action-btn" @click.stop="handleChangeLog(item)">变动明细</button>
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
import { getProjectFundPoolList } from '../../common/api/project'

export default {
  data() {
    return {
      proId: '',
      proName: '',

      dataList: [],
      loading: false,
      hasMore: true,
      pageNo: 1,
      pageSize: 20,

      // 搜索 + 筛选 + 排序
      searchKeyword: '',
      showFilter: false,
      arrearsOptions: [
        { value: '', text: '全部' },
        { value: true, text: '仅看有欠款' },
        { value: false, text: '仅看无欠款' }
      ],
      selectedArrears: null,

      sortField: 'availableCreditBalance',
      sortOrder: 'desc',

      queryParam: {},

      // 导航栏
      statusBarHeight: 0,
      navBarContentHeight: 44
    }
  },

  computed: {
    hasActiveFilters() {
      return !!(this.searchKeyword || (this.selectedArrears && this.selectedArrears.value !== ''))
    },
    activeFilterTags() {
      const tags = []
      if (this.searchKeyword) tags.push({ key: 'keyword', label: `搜索：${this.searchKeyword}` })
      if (this.selectedArrears && this.selectedArrears.value !== '') tags.push({ key: 'isArrears', label: this.selectedArrears.text })
      return tags
    }
  },

  onLoad(query) {
    this.getStatusBarHeight()
    this.proId = query.proId || ''
    this.proName = decodeURIComponent(query.proName || '')

    // 默认排序
    this.queryParam.column = this.sortField
    this.queryParam.order = this.sortOrder

    this.loadData()
  },

  onPullDownRefresh() {
    this.pageNo = 1
    this.dataList = []
    this.loadData().finally(() => uni.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.pageNo++
      this.loadData()
    }
  },

  onBackPress() {
    this.handleBack()
    return true
  },

  methods: {
    getStatusBarHeight() {
      try {
        const systemInfo = uni.getSystemInfoSync()
        this.statusBarHeight = systemInfo.statusBarHeight || 0
      } catch (e) {
        this.statusBarHeight = 0
      }
    },

    handleBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack({
          delta: 1,
          fail: () => uni.switchTab({ url: '/pages/modules/index' })
        })
      } else {
        uni.switchTab({ url: '/pages/modules/index' })
      }
    },

    toggleFilter() {
      this.showFilter = !this.showFilter
    },

    // ===== keyword -> *keyword* =====
    buildWildcardKeyword(raw) {
      const k = String(raw || '').trim()
      if (!k) return ''
      const stripped = k.replace(/^\*+/, '').replace(/\*+$/, '')
      return stripped ? `*${stripped}*` : ''
    },

    clearSearch() {
      this.searchKeyword = ''
      delete this.queryParam.proName
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },

    handleSearch() {
      const wildcard = this.buildWildcardKeyword(this.searchKeyword)
      if (wildcard) this.queryParam.proName = wildcard
      else delete this.queryParam.proName

      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },

    handleArrearsChange(e) {
      this.selectedArrears = this.arrearsOptions[e.detail.value]
    },

    resetFilter() {
      this.selectedArrears = null
    },

    applyFilter() {
      // 重新组装 queryParam，避免残留
      const qp = {}

      // proName
      const wildcard = this.buildWildcardKeyword(this.searchKeyword)
      if (wildcard) qp.proName = wildcard

      // isArrears
      if (this.selectedArrears && this.selectedArrears.value !== '') {
        qp.isArrears = this.selectedArrears.value
      }

      // sort
      qp.column = this.sortField
      qp.order = this.sortOrder

      this.queryParam = qp
      this.showFilter = false
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },

    removeFilter(key) {
      if (key === 'keyword') {
        this.searchKeyword = ''
        delete this.queryParam.proName
      }
      if (key === 'isArrears') {
        this.selectedArrears = null
        delete this.queryParam.isArrears
      }
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },

    clearAllFilters() {
      this.searchKeyword = ''
      this.selectedArrears = null

      this.queryParam = {
        column: this.sortField,
        order: this.sortOrder
      }
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },

    // ===== Sort =====
    handleSort(field) {
      if (this.sortField === field) this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc'
      else {
        this.sortField = field
        this.sortOrder = 'desc'
      }
      this.queryParam.column = this.sortField
      this.queryParam.order = this.sortOrder

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
          proId: this.proId,
          ...this.queryParam
        }
        const res = await getProjectFundPoolList(params)
        if (res && res.success) {
          const result = res.result || {}
          const records = result.records || result.list || []
          this.dataList = this.pageNo === 1 ? records : this.dataList.concat(records)
          this.hasMore = records.length >= this.pageSize
        } else {
          uni.showToast({ title: res.message || '加载失败', icon: 'none' })
        }
      } catch (e) {
        console.error('加载数据失败:', e)
        uni.showToast({ title: e.message || '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    handleItemClick(item) {
      uni.setStorageSync('_temp_project_data', item)
      uni.navigateTo({ url: `/pages/project/detail?id=${item.proId || item.id}` })
    },

    handleChangeLog(item) {
      uni.navigateTo({
        url: `/pages/project/fundChangeLog?proId=${item.proId || this.proId}&proName=${encodeURIComponent(item.proName || '')}`
      })
    },

    getCollaborationModeText(mode) {
      const map = { '0': '预付', '1': '垫付', '2': '服务费' }
      return map[String(mode)] || '-'
    },

    formatNumber(num) {
      const n = Number(num)
      if (Number.isNaN(n)) return '0.00'
      return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

/* ===== Search / Sort ===== */
.search-section {
  background: #fff;
  padding: 16rpx 16rpx 12rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
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

/* Filter tags */
.filter-summary {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 12rpx;
}

.filter-tags {
  flex: 1;
  width: 0;
  white-space: nowrap;
}

.tags-inner {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  padding-right: 6rpx;
}

.filter-tag {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 12rpx;
  background: rgba(10, 132, 255, 0.10);
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
  flex-shrink: 0;
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
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.06);
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
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
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
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.page-content::-webkit-scrollbar {
  display: none;
}

.card-hover {
  opacity: 0.92;
  transform: scale(0.99);
}

.list-item {
  background: #fff;
  margin: 12rpx 16rpx;
  padding: 18rpx 18rpx;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.item-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #111;
  flex: 1;
  margin-right: 12rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.item-status {
  font-size: 24rpx;
  color: #6e6e73;
  background: #ededf0;
  padding: 8rpx 12rpx;
  border-radius: 999px;
  flex-shrink: 0;
}

.item-row {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  margin-bottom: 10rpx;
}

.label {
  color: #6e6e73;
  min-width: 120rpx;
}

.value {
  color: #1c1c1e;
  flex: 1;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
  margin-top: 10rpx;
}

.amount-cell {
  background: #f6f6f8;
  border-radius: 16rpx;
  padding: 14rpx 14rpx 12rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.04);
}

.amount-label {
  font-size: 22rpx;
  color: #8e8e93;
  margin-bottom: 6rpx;
}

.amount-value {
  font-size: 28rpx;
  font-weight: 800;
  color: #1c1c1e;
}

.amount-value.positive {
  color: #34c759;
}

.amount-value.negative {
  color: #ff3b30;
}

.item-actions {
  display: flex;
  gap: 12rpx;
  padding-top: 14rpx;
  margin-top: 14rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
}

.action-btn {
  flex: 1;
  height: 64rpx;
  border-radius: 999px;
  font-size: 26rpx;
  background: #0a84ff;
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn::after {
  border: none;
}

/* Skeleton */
.skeleton-list {
  padding: 16rpx;
}

.skeleton-item {
  background: #fff;
  margin: 12rpx 16rpx;
  padding: 18rpx;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
}

.skeleton-line {
  height: 22rpx;
  margin-bottom: 14rpx;
  border-radius: 10rpx;
  background: linear-gradient(90deg, #f0f0f3 25%, #e7e7ec 50%, #f0f0f3 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-line.w70 {
  width: 70%;
  height: 28rpx;
}

.skeleton-line.w50 {
  width: 50%;
}

.skeleton-line.w90 {
  width: 90%;
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

/* Footer states */
.loading-more,
.no-more {
  text-align: center;
  padding: 40rpx 0;
  color: #8e8e93;
  font-size: 26rpx;
}

.empty-title {
  font-size: 28rpx;
  color: #8e8e93;
}

.empty-sub {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #c7c7cc;
}

.empty-actions {
  margin-top: 28rpx;
  display: flex;
  justify-content: center;
}

/* iOS tinted / ghost button */
.clear-filter-btn {
  width: 320rpx;
  height: 72rpx;
  border-radius: 999px;

  background: rgba(10, 132, 255, 0.12);
  color: #0a84ff;
  border: 1rpx solid rgba(10, 132, 255, 0.22);

  font-size: 26rpx;
  font-weight: 600;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: none;
}

.clear-filter-btn:active {
  background: rgba(10, 132, 255, 0.18);
}

.clear-filter-btn::after {
  border: none;
}

</style>
