<template>
  <view class="page">
    <!-- Navbar 固定 -->
    <view class="navbar fixed-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">资金变动明细</view>
        <view class="navbar-right" @click="toggleFilter">
          <text class="filter-icon">{{ showFilter ? '⏶' : '⏷' }}</text>
        </view>
      </view>
    </view>

    <!-- Header 固定在 Navbar 下方 -->
    <view class="header-fixed" :style="{ top: navBarHeight + 'px' }">
      <view class="search-section">
        <!-- 搜索框 -->
        <view class="search-bar">
          <text class="search-icon" @click="handleSearch">🔎</text>
          <input class="search-input" v-model="searchKeyword" placeholder="搜索项目名称" @confirm="handleSearch"
            confirm-type="search" />
          <text class="clear-icon" v-if="searchKeyword" @click.stop="clearSearch">×</text>
        </view>

        <!-- 已选条件 tags（改为单行横向滚动，避免样式冲突） -->
        <view class="filter-summary" v-if="hasActiveFilters">
          <scroll-view class="filter-tags" scroll-x :show-scrollbar="false">
            <view class="tags-inner">
              <view class="filter-tag" v-for="(tag, index) in activeFilterTags" :key="index"
                @click.stop="removeFilter(tag.key)">
                <text class="tag-text">{{ tag.label }}</text>
                <text class="tag-close">×</text>
              </view>
            </view>
          </scroll-view>
          <text class="clear-all" @click.stop="clearAllFilters">清除</text>
        </view>

        <!-- 排序 tabs -->
        <view class="segmented">
          <view class="seg-item" :class="{ active: sortField === 'createTime' }" @click="handleSort('createTime')">
            <text>创建时间</text>
            <text class="seg-arrow" v-if="sortField === 'createTime'">{{ sortOrder === 'desc' ? '↓' : '↑' }}</text>
          </view>
          <view class="seg-item" :class="{ active: sortField === 'money' }" @click="handleSort('money')">
            <text>金额</text>
            <text class="seg-arrow" v-if="sortField === 'money'">{{ sortOrder === 'desc' ? '↓' : '↑' }}</text>
          </view>
          <view class="seg-item" :class="{ active: sortField === 'changeType' }" @click="handleSort('changeType')">
            <text>变更类型</text>
            <text class="seg-arrow" v-if="sortField === 'changeType'">{{ sortOrder === 'desc' ? '↓' : '↑' }}</text>
          </view>
        </view>
      </view>

      <!-- Filter 面板 -->
      <view class="filter-panel" v-if="showFilter">
        <view class="filter-item">
          <text class="filter-label">资金性质</text>
          <picker mode="selector" :range="fundsNatureOptions" range-key="text" @change="handleFundsNatureChange">
            <view class="filter-value">{{ selectedFundsNature ? selectedFundsNature.text : '全部' }}</view>
          </picker>
        </view>

        <view class="filter-item">
          <text class="filter-label">变更类型</text>
          <picker mode="selector" :range="changeTypeOptions" range-key="text" @change="handleChangeTypeChange">
            <view class="filter-value">{{ selectedChangeType ? selectedChangeType.text : '全部' }}</view>
          </picker>
        </view>

        <!-- <view class="filter-item">
          <text class="filter-label">金额区间</text>
          <view class="range-input">
            <input class="range-field" v-model="minMoney" type="digit" placeholder="最小" />
            <text class="range-sep">—</text>
            <input class="range-field" v-model="maxMoney" type="digit" placeholder="最大" />
          </view>
        </view> -->

        <view class="filter-actions">
          <button class="filter-btn reset" @click="resetFilter">重置</button>
          <button class="filter-btn confirm" @click="applyFilter">确定</button>
        </view>
      </view>
    </view>

    <!-- 占位：把列表顶到 header 下方 -->
    <view class="top-placeholder" :style="{ height: topPlaceholderHeight + 'px' }" />

    <!-- 列表：页面原生滚动 -->
    <view class="content">
      <!-- Skeleton -->
      <view class="skeleton-list" v-if="loading && dataList.length === 0">
        <view class="skeleton-item" v-for="n in 6" :key="n">
          <view class="skeleton-row">
            <view class="skeleton-line w55"></view>
            <view class="skeleton-line w25"></view>
          </view>
          <view class="skeleton-line w35"></view>
          <view class="skeleton-line w80"></view>
        </view>
      </view>

      <!-- Cards -->
      <view class="card" v-for="(item, index) in dataList" :key="item.id || index" hover-class="card-hover"
        hover-stay-time="80">
        <view class="card-header">
          <text class="pro-name">{{ item.proName || '-' }}</text>
          <text class="money" :class="amountClass(item.changeType)">
            {{ amountSign(item.changeType) }}¥{{ formatNumber(item.money || 0) }}
          </text>
        </view>

        <view class="chips">
          <view class="chip">{{ getFundsNatureText(item.fundsNature) }}</view>
          <view class="chip" :class="chipTypeClass(item.changeType)">{{ getChangeTypeText(item.changeType) }}</view>
        </view>

        <view class="kv">
          <view class="kv-row">
            <text class="k">业务场景</text>
            <text class="v">{{ getBusinessScenarioText(item.businessScenario) }}</text>
          </view>
          <view class="kv-row">
            <text class="k">合计总余额</text>
            <text class="v strong">¥{{ formatNumber(item.totalBalanceSum || 0) }}</text>
          </view>
        </view>

        <view class="card-footer">
          <text class="time">{{ item.createTime || '-' }}</text>
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
import { getProjectFundChangesList } from '../../common/api/project'

export default {
  data() {
    return {
      proId: '',
      month: '',
      dataList: [],
      loading: false,
      hasMore: true,
      pageNo: 1,
      pageSize: 20,

      showFilter: false,
      searchKeyword: '',

      queryParam: {},
      sortField: 'createTime',
      sortOrder: 'desc',

      fundsNatureOptions: [
        { value: '', text: '全部' },
        { value: '1', text: '对公' },
        { value: '2', text: '对私' }
      ],
      changeTypeOptions: [
        { value: '', text: '全部' },
        { value: '1', text: '增加' },
        { value: '2', text: '减少' }
      ],
      selectedFundsNature: null,
      selectedChangeType: null,
      minMoney: '',
      maxMoney: '',

      statusBarHeight: 0,
      navBarHeight: 0,
      headerBaseHeight: 0,
      filterPanelHeight: 0
    }
  },

  computed: {
    hasActiveFilters() {
      return !!(
        this.searchKeyword ||
        (this.selectedFundsNature && this.selectedFundsNature.value) ||
        (this.selectedChangeType && this.selectedChangeType.value) ||
        this.minMoney ||
        this.maxMoney
      )
    },
    activeFilterTags() {
      const tags = []
      if (this.searchKeyword) tags.push({ key: 'keyword', label: `搜索：${this.searchKeyword}` })
      if (this.selectedFundsNature && this.selectedFundsNature.value) tags.push({ key: 'fundsNature', label: this.selectedFundsNature.text })
      if (this.selectedChangeType && this.selectedChangeType.value) tags.push({ key: 'changeType', label: this.selectedChangeType.text })
      if (this.minMoney || this.maxMoney) tags.push({ key: 'moneyRange', label: `金额：${this.minMoney || '0'}-${this.maxMoney || '∞'}` })
      return tags
    },
    topPlaceholderHeight() {
      return this.navBarHeight + this.headerBaseHeight + (this.showFilter ? this.filterPanelHeight : 0)
    }
  },

  onLoad(query) {
    this.initHeights()
    this.proId = query.proId || ''
    this.month = query.month || ''

    if (this.proId) this.queryParam.proId = this.proId
    if (this.month) this.queryParam.month = this.month

    this.queryParam.column = this.sortField
    this.queryParam.order = this.sortOrder

    this.$nextTick(() => {
      this.measureHeaderHeights()
      this.loadData()
    })
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
    initHeights() {
      const info = uni.getSystemInfoSync()
      this.statusBarHeight = info.statusBarHeight || 0
      this.navBarHeight = this.statusBarHeight + 44
    },

    measureHeaderHeights() {
      // 注意：搜索 tags 出现/消失也要重新测量，否则占位高度不对就会“冲突”
      uni.createSelectorQuery()
        .in(this)
        .select('.search-section')
        .boundingClientRect(rect => {
          this.headerBaseHeight = rect ? rect.height : 0
        })
        .exec()

      uni.createSelectorQuery()
        .in(this)
        .select('.filter-panel')
        .boundingClientRect(rect => {
          this.filterPanelHeight = rect ? rect.height : 0
        })
        .exec()
    },

    toggleFilter() {
      this.showFilter = !this.showFilter
      this.$nextTick(() => this.measureHeaderHeights())
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

    // === 关键：把 keyword 变成 *keyword*（自动去掉首尾*再包一层） ===
    buildWildcardKeyword(raw) {
      const k = String(raw || '').trim()
      if (!k) return ''
      const stripped = k.replace(/^\*+/, '').replace(/\*+$/, '')
      return stripped ? `*${stripped}*` : ''
    },

    // 搜索
    clearSearch() {
      this.searchKeyword = ''
      delete this.queryParam.proName
      this.pageNo = 1
      this.dataList = []
      this.$nextTick(() => this.measureHeaderHeights())
      this.loadData()
    },
    handleSearch() {
      const wildcard = this.buildWildcardKeyword(this.searchKeyword)
      if (wildcard) this.queryParam.proName = wildcard
      else delete this.queryParam.proName

      this.pageNo = 1
      this.dataList = []
      this.$nextTick(() => this.measureHeaderHeights())
      this.loadData()
    },

    // 排序
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
      this.$nextTick(() => this.measureHeaderHeights())
      this.loadData()
    },

    // 筛选
    handleFundsNatureChange(e) {
      this.selectedFundsNature = this.fundsNatureOptions[e.detail.value]
    },
    handleChangeTypeChange(e) {
      this.selectedChangeType = this.changeTypeOptions[e.detail.value]
    },
    resetFilter() {
      this.selectedFundsNature = null
      this.selectedChangeType = null
      this.minMoney = ''
      this.maxMoney = ''
      this.$nextTick(() => this.measureHeaderHeights())
    },
    applyFilter() {
      const base = { proId: this.proId }
      if (this.month) base.month = this.month

      const wildcard = this.buildWildcardKeyword(this.searchKeyword)
      if (wildcard) base.proName = wildcard

      if (this.selectedFundsNature && this.selectedFundsNature.value) base.fundsNature = this.selectedFundsNature.value
      if (this.selectedChangeType && this.selectedChangeType.value) base.changeType = this.selectedChangeType.value
      if (this.minMoney) base.minMoney = this.minMoney
      if (this.maxMoney) base.maxMoney = this.maxMoney

      base.column = this.sortField
      base.order = this.sortOrder

      this.queryParam = base
      this.showFilter = false
      this.pageNo = 1
      this.dataList = []
      this.$nextTick(() => this.measureHeaderHeights())
      this.loadData()
    },

    removeFilter(key) {
      if (key === 'keyword') {
        this.searchKeyword = ''
        delete this.queryParam.proName
      }
      if (key === 'fundsNature') this.selectedFundsNature = null
      if (key === 'changeType') this.selectedChangeType = null
      if (key === 'moneyRange') {
        this.minMoney = ''
        this.maxMoney = ''
      }
      this.applyFilter()
    },

    clearAllFilters() {
      this.searchKeyword = ''
      this.selectedFundsNature = null
      this.selectedChangeType = null
      this.minMoney = ''
      this.maxMoney = ''

      this.queryParam = { proId: this.proId }
      if (this.month) this.queryParam.month = this.month
      this.queryParam.column = this.sortField
      this.queryParam.order = this.sortOrder

      this.pageNo = 1
      this.dataList = []
      this.$nextTick(() => this.measureHeaderHeights())
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
          const result = res.result || {}
          const records = result.records || result.list || []
          this.dataList = this.pageNo === 1 ? records : this.dataList.concat(records)
          this.hasMore = records.length >= this.pageSize
        } else {
          uni.showToast({ title: res.message || '加载失败', icon: 'none' })
        }
      } catch (e) {
        console.error(e)
        uni.showToast({ title: e.message || '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    // 映射
    getFundsNatureText(v) {
      const s = String(v)
      if (s === '1') return '对公'
      if (s === '2') return '对私'
      return '—'
    },
    getChangeTypeText(v) {
      const s = String(v)
      if (s === '1') return '增加'
      if (s === '2') return '减少'
      return '—'
    },
    getBusinessScenarioText(v) {
      const t = Number(v)
      if (t === 1) return '设置授信额度'
      if (t === 2) return '项目备款'
      if (t === 3) return '账户充值'
      if (t === 4) return '账户转账'
      if (t === 5) return '账户退款'
      if (t === 6) return '调整授信'
      if (t === 7) return '钱包充值'
      if (t === 8) return '钱包退款'
      if (t === 9) return '子端口充值'
      if (t === 10) return '子端口退款'
      if (t === 11) return '客户退款'
      if (t === 12) return '撤销备款'
      if (t === 13) return '项目划转'
      if (t === 14) return '到账导入'
      if (t === 15) return '非API充值'
      if (t === 16) return '非API退款'
      if (t === 17) return '项目损失'
      return v ? String(v) : '—'
    },

    amountSign(changeType) {
      return String(changeType) === '2' ? '-' : '+'
    },
    amountClass(changeType) {
      return String(changeType) === '2' ? 'money-neg' : 'money-pos'
    },
    chipTypeClass(changeType) {
      return String(changeType) === '2' ? 'chip-down' : 'chip-up'
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

.page {
  min-height: 100vh;
  background: #f2f2f7;
}

/* Navbar */
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
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

/* Header fixed */
.header-fixed {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 999;
  background: #fff;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

/* Search / controls */
.search-section {
  padding: 16rpx 16rpx 12rpx;
  background: #fff;
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

/* tags（改为横向滚动，解决“冲突/挤压”） */
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

/* segmented */
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

/* filter panel */
.filter-panel {
  padding: 18rpx 16rpx;
  background: #fff;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
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

.range-input {
  flex: 1;
  display: flex;
  align-items: center;
  background: #ededf0;
  border-radius: 14rpx;
  padding: 10rpx 12rpx;
}

.range-field {
  flex: 1;
  font-size: 26rpx;
  color: #1c1c1e;
  padding: 6rpx 8rpx;
}

.range-sep {
  color: #8e8e93;
  padding: 0 6rpx;
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

/* placeholder */
.top-placeholder {
  width: 100%;
}

/* content */
.content {
  padding: 12rpx 0 24rpx;
}

.card {
  background: #fff;
  margin: 12rpx 16rpx;
  padding: 18rpx;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
}

.card-hover {
  opacity: 0.92;
  transform: scale(0.99);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.pro-name {
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
  color: #111;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.money {
  font-size: 30rpx;
  font-weight: 800;
  flex-shrink: 0;
}

.money-pos {
  color: #34c759;
}

.money-neg {
  color: #ff3b30;
}

.chips {
  display: flex;
  gap: 10rpx;
  margin: 12rpx 0;
}

.chip {
  padding: 10rpx 14rpx;
  border-radius: 999px;
  font-size: 24rpx;
  background: #ededf0;
  color: #3a3a3c;
}

.chip-up {
  background: rgba(52, 199, 89, 0.12);
  color: #1f8a3a;
}

.chip-down {
  background: rgba(255, 59, 48, 0.12);
  color: #d12a22;
}

.kv {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.kv-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

.k {
  font-size: 26rpx;
  color: #6e6e73;
  flex-shrink: 0;
}

.v {
  font-size: 26rpx;
  color: #1c1c1e;
  text-align: right;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.v.strong {
  font-weight: 800;
}

.card-footer {
  margin-top: 12rpx;
  padding-top: 10rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
}

.time {
  font-size: 24rpx;
  color: #8e8e93;
}

/* skeleton */
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

.skeleton-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14rpx;
}

.skeleton-line {
  height: 22rpx;
  border-radius: 10rpx;
  background: linear-gradient(90deg, #f0f0f3 25%, #e7e7ec 50%, #f0f0f3 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-line.w55 {
  width: 55%;
  height: 28rpx;
}

.skeleton-line.w25 {
  width: 25%;
  height: 28rpx;
}

.skeleton-line.w35 {
  width: 35%;
  margin-bottom: 14rpx;
}

.skeleton-line.w80 {
  width: 80%;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* footer states */
.loading-more,
.no-more {
  text-align: center;
  padding: 40rpx 0;
  color: #8e8e93;
  font-size: 26rpx;
}
</style>
