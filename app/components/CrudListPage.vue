<template>
  <view class="page" :style="{ paddingTop: (statusBarHeight + navBarContentHeight) + 'px' }">
    <view class="navbar fixed-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">{{ crud.ui.pageTitle }}</view>
        <view class="navbar-right" @click="toggleFilter">
          <text class="filter-icon">{{ crud.ui.filter.toggleIcon }}</text>
        </view>
      </view>
    </view>

    <view class="search-section">
      <view class="search-bar">
        <text class="search-icon" @click="handleSearch">{{ crud.ui.search.icon }}</text>
        <input class="search-input" v-model="searchKeyword" :placeholder="crud.ui.search.placeholder" @confirm="handleSearch"
          confirm-type="search" />
        <text class="clear-icon" v-if="searchKeyword" @click.stop="clearSearch">{{ crud.ui.search.clearIcon }}</text>
      </view>

      <view class="filter-summary" v-if="hasActiveFilters">
        <view class="filter-tags">
          <view class="filter-tag" v-for="(tag, index) in activeFilterTags" :key="index" @click.stop="removeFilter(tag.key)">
            <text class="tag-text">{{ tag.label }}</text>
            <text class="tag-close">{{ crud.ui.filter.tagCloseIcon }}</text>
          </view>
        </view>
        <text class="clear-all" @click.stop="clearAllFilters">{{ crud.ui.filter.clearAllText }}</text>
      </view>

      <view class="segmented" v-if="crud.sort && crud.sort.items && crud.sort.items.length">
        <view class="seg-item" v-for="opt in crud.sort.items" :key="opt.field" :class="{ active: sortField === opt.field }"
          @click="handleSort(opt.field)">
          <text>{{ opt.label }}</text>
          <text class="seg-arrow" v-if="sortField === opt.field">{{ sortOrder === 'desc' ? '↓' : '↑' }}</text>
        </view>
      </view>
    </view>

    <view class="filter-panel" v-if="showFilter">
      <view class="filter-item" v-for="f in crud.filters" :key="f.key">
        <text class="filter-label">{{ f.label }}</text>
        <picker mode="selector" :range="f.options" range-key="text" @change="handleFilterChange(f.key, $event)">
          <view class="filter-value">
            {{ filterState[f.key] ? filterState[f.key].text : crud.ui.filter.allText }}
          </view>
        </picker>
      </view>

      <view class="filter-actions">
        <button class="filter-btn reset" @click="resetFilter">{{ crud.ui.filter.resetText }}</button>
        <button class="filter-btn confirm" @click="applyFilter">{{ crud.ui.filter.confirmText }}</button>
      </view>
    </view>

    <view class="page-content">
      <view class="skeleton-list" v-if="loading && dataList.length === 0">
        <view class="skeleton-item" v-for="n in 6" :key="n">
          <view class="skeleton-line w60"></view>
          <view class="skeleton-line w85"></view>
          <view class="skeleton-line w45"></view>
        </view>
      </view>

      <view class="list-item" v-for="(item, index) in dataList" :key="getItemKey(item, index)"
        @click="handleItemClick(item)" @longpress="handleItemActions(item)" hover-class="card-hover" hover-stay-time="80">
        <view class="item-header">
          <view class="item-title-wrapper">
            <text class="item-title">{{ getVal(item, crud.card.titleProp) || crud.ui.list.titleFallback }}</text>
          </view>
          <view class="item-right">
            <text class="arrow-icon">›</text>
          </view>
        </view>

        <view class="item-subtitle" v-if="getSubtitle(item)">
          <text class="subtext">{{ getSubtitle(item) }}</text>
        </view>

        <view class="item-content">
          <view class="line" v-if="crud.card.line1">
            <text class="icon">{{ crud.card.line1.icon }}</text>
            <text class="text primary two-line">{{ getVal(item, crud.card.line1.prop) || '-' }}</text>
          </view>

          <view class="line" v-if="crud.card.line2">
            <text class="icon">{{ crud.card.line2.icon }}</text>
            <text class="text secondary">{{ getVal(item, crud.card.line2.leftProp) || '-' }}</text>
            <text class="sep">{{ crud.card.line2.sep }}</text>
            <text class="text tertiary">
              {{ crud.card.line2.rightPrefix }} {{ formatBy(item, crud.card.line2.rightProp, crud.card.line2.rightFormatter) }}
            </text>
          </view>
        </view>
      </view>

      <view class="loading-more" v-if="loading && dataList.length > 0">
        <text>{{ crud.ui.list.loadingMoreText }}</text>
      </view>
      <view class="no-more" v-if="!hasMore && dataList.length > 0">
        <text>{{ crud.ui.list.noMoreText }}</text>
      </view>
      <view class="empty" v-if="!loading && dataList.length === 0">
        <text class="empty-title">{{ crud.ui.list.emptyTitle }}</text>
        <text class="empty-sub" v-if="hasActiveFilters">{{ crud.ui.list.emptySubWhenFiltered }}</text>

        <view class="empty-actions" v-if="hasActiveFilters">
          <button class="clear-filter-btn" @click="clearAllFilters">{{ crud.ui.list.clearFilterBtnText }}</button>
        </view>
      </view>
    </view>

    <view class="floating-add" :class="{ 'floating-add-hidden': drawerVisible }" @click.stop="handleAdd">
      <text class="add-icon">{{ crud.ui.fab.icon }}</text>
    </view>

    <component v-if="formComponent" :is="formComponent" :visible="drawerVisible" :editData="drawerEditData"
      :titleAdd="crud.ui.pageTitle" :titleEdit="crud.ui.pageTitle" :fields="crud.form.fields" :api="crud.form.api"
      :primaryKey="crud.form.primaryKey || 'id'" @update:visible="drawerVisible = $event" @success="handleDrawerSuccess"
      @close="handleDrawerClose" />
  </view>
</template>

<script>
import { openWebView } from '../common/navigation'

export default {
  props: {
    crud: { type: Object, required: true },
    formComponent: { type: [Object, Function], default: null }
  },
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
      filterState: {},
      sortField: '',
      sortOrder: '',
      statusBarHeight: 0,
      navBarContentHeight: 44,
      drawerVisible: false,
      drawerEditData: null
    }
  },
  computed: {
    hasActiveFilters() {
      if (this.searchKeyword) return true
      return (this.crud.filters || []).some(f => this.filterState[f.key] && this.filterState[f.key].value)
    },
    activeFilterTags() {
      const tags = []
      ;(this.crud.filters || []).forEach(f => {
        const sel = this.filterState[f.key]
        if (sel && sel.value) tags.push({ key: f.key, label: sel.text })
      })
      if (this.searchKeyword) {
        tags.push({ key: '__keyword__', label: `${this.crud.ui.search.placeholder.replace('搜索', '搜索：')}${this.searchKeyword}` })
      }
      return tags
    }
  },
  created() {
    this.sortField = this.crud.sort?.defaultField || ''
    this.sortOrder = this.crud.sort?.defaultOrder || 'desc'
    this.queryParam[this.crud.sort?.paramColumn] = this.sortField
    this.queryParam[this.crud.sort?.paramOrder] = this.sortOrder
  },
  onLoad() {
    this.getStatusBarHeight()
    ;(this.crud.filters || []).forEach(f => {
      this.$set(this.filterState, f.key, null)
    })
    this.loadData()
  },
  onPullDownRefresh() {
    this.handleRefresh()
  },
  onReachBottom() {
    this.loadMore()
  },
  onBackPress() {
    this.handleBack()
    return true
  },
  methods: {
    getItemKey(item, index) {
      const idProp = this.crud.card.idProp || 'id'
      return (item && item[idProp]) || index
    },
    getVal(obj, prop) {
      if (!obj || !prop) return ''
      if (prop.indexOf('.') > -1) {
        return prop.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj)
      }
      return obj[prop]
    },
    formatBy(item, prop, formatterName) {
      const v = this.getVal(item, prop)
      if (!formatterName) return (v ?? '-') || '-'
      if (formatterName === 'relativeTime') return this.getRelativeTime(v)
      if (formatterName === 'operationTypeText') return this.getOperationTypeText(v)
      return (v ?? '-') || '-'
    },
    getSubtitle(item) {
      const parts = this.crud.card.subtitleParts || []
      const texts = []
      parts.forEach(p => {
        const v = this.getVal(item, p.prop)
        if (p.formatter === 'operationTypeText') {
          if (v) texts.push(this.getOperationTypeText(v))
          return
        }
        if (v) {
          texts.push(v)
        } else if (p.fallback !== undefined && texts.length === 0) {
          texts.push(p.fallback)
        }
      })
      const cleaned = texts.filter(t => t !== undefined && t !== null && String(t).trim() !== '')
      return cleaned.length ? cleaned.join(' · ') : ''
    },
    getStatusBarHeight() {
      try {
        const systemInfo = uni.getSystemInfoSync()
        this.statusBarHeight = systemInfo.statusBarHeight || 0
      } catch (error) {
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
    toggleFilter() {
      this.showFilter = !this.showFilter
    },
    clearSearch() {
      this.searchKeyword = ''
      delete this.queryParam[this.crud.search.keywordProp]
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },
    handleSearch() {
      const key = this.crud.search.keywordProp
      if (this.searchKeyword) this.queryParam[key] = this.searchKeyword
      else delete this.queryParam[key]
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },
    handleFilterChange(key, e) {
      const f = (this.crud.filters || []).find(x => x.key === key)
      if (!f) return
      const idx = e.detail.value
      this.filterState[key] = f.options[idx]
    },
    resetFilter() {
      (this.crud.filters || []).forEach(f => {
        this.filterState[f.key] = null
      })
    },
    applyFilter() {
      (this.crud.filters || []).forEach(f => {
        delete this.queryParam[f.queryProp]
      })
      ;(this.crud.filters || []).forEach(f => {
        const sel = this.filterState[f.key]
        if (sel && sel.value) this.queryParam[f.queryProp] = sel.value
      })
      this.showFilter = false
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },
    removeFilter(key) {
      if (key === '__keyword__') {
        this.searchKeyword = ''
        delete this.queryParam[this.crud.search.keywordProp]
        this.applyFilter()
        return
      }
      if (this.filterState[key]) this.filterState[key] = null
      this.applyFilter()
    },
    handleSort(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc'
      } else {
        this.sortField = field
        this.sortOrder = 'desc'
      }
      this.queryParam[this.crud.sort.paramColumn] = this.sortField
      this.queryParam[this.crud.sort.paramOrder] = this.sortOrder
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },
    async loadData() {
      if (this.loading) return
      this.loading = true
      try {
        const params = { pageNo: this.pageNo, pageSize: this.pageSize, ...this.queryParam }
        const res = await this.crud.api.list(params)
        if (res && res.success) {
          const result = res.result || {}
          const records = result.records || result.list || []
          this.dataList = this.pageNo === 1 ? records : [...this.dataList, ...records]
          this.hasMore = records.length >= this.pageSize
        }
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
        uni.stopPullDownRefresh()
        this.refreshing = false
      })
    },
    handleItemClick(item) {
      if (this.crud.actions?.detail) {
        this.crud.actions.detail(this, item)
        return
      }
      if (this.crud.routes?.detail) {
        uni.navigateTo({ url: `${this.crud.routes.detail}?id=${encodeURIComponent(item[this.crud.card.idProp] || '')}` })
      }
    },
    handleItemActions(item) {
      if (!this.crud.ui.actionSheet) return
      uni.showActionSheet({
        itemList: this.crud.ui.actionSheet.items.map(it => it.label),
        success: res => {
          const chosen = this.crud.ui.actionSheet.items[res.tapIndex]
          if (!chosen) return
          if (chosen.key === 'edit') this.crud.actions?.edit?.(this, item) || this.openDrawer(item)
          if (chosen.key === 'detail') this.handleItemClick(item)
          if (chosen.key === 'web') this.crud.actions?.webDetail?.(this, item)
        }
      })
    },
    handleAdd() {
      if (this.crud.actions?.add) {
        this.crud.actions.add(this)
        return
      }
      this.openDrawer()
    },
    openDrawer(item) {
      if (!this.formComponent) return
      this.drawerEditData = item || null
      this.drawerVisible = true
    },
    handleDrawerSuccess() {
      this.handleRefresh()
    },
    handleDrawerClose() {
      this.drawerEditData = null
    },
    openWebView(path, title) {
      openWebView(path, title)
    },
    getRelativeTime(ts) {
      if (!ts) return '-'
      const date = new Date(ts)
      const diff = Date.now() - date.getTime()
      const minutes = Math.floor(diff / 60000)
      if (minutes < 60) return `${minutes} 分钟前`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours} 小时前`
      const days = Math.floor(hours / 24)
      if (days < 30) return `${days} 天前`
      const months = Math.floor(days / 30)
      if (months < 12) return `${months} 个月前`
      const years = Math.floor(months / 12)
      return `${years} 年前`
    },
    getOperationTypeText(v) {
      const map = { 1: '自运营', 2: '走量', 3: '收量', '1': '自运营', '2': '走量', '3': '收量' }
      return map[v] || v || '-'
    }
  }
}
</script>

<style scoped lang="scss">
@import '../common/styles/ios-common.scss';

.page {
  height: 100vh;
  background: #f2f2f7;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar.fixed-navbar {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 1000 !important;
  background: #fff;
  border-bottom: 1rpx solid rgba(0, 0, 0, .06);
}

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
  width: 0;
  height: 0;
  background: transparent;
}

.skeleton-list {
  padding: 16rpx;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16rpx;
}

.skeleton-item {
  background: #fff;
  padding: 20rpx;
  border-radius: 12rpx;
  display: grid;
  gap: 10rpx;
}

.skeleton-line {
  height: 18rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #fafafa 50%, #f0f0f0 75%);
  background-size: 400% 100%;
  animation: shimmer 1.2s ease infinite;
  border-radius: 8rpx;
}

.w60 { width: 60%; }
.w85 { width: 85%; }
.w45 { width: 45%; }

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
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
  margin-bottom: 12rpx;
}

.item-title-wrapper { flex: 1; }

.item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1c1c1e;
}

.item-right { width: 40rpx; text-align: right; color: #c7c7cc; }

.arrow-icon { font-size: 28rpx; }

.item-subtitle { margin-bottom: 8rpx; }

.subtext { font-size: 24rpx; color: #8e8e93; }

.item-content { display: flex; flex-direction: column; gap: 12rpx; }

.line { display: flex; align-items: center; gap: 10rpx; }

.icon { font-size: 26rpx; color: #8e8e93; }

.text { font-size: 26rpx; line-height: 1.35; color: #1c1c1e; word-break: break-word; }

.primary { color: #1c1c1e; }
.secondary { color: #3a3a3c; }
.tertiary { color: #8e8e93; font-size: 24rpx; }
.sep { margin: 0 8rpx; color: #c7c7cc; }
.two-line { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }

.loading-more, .no-more { text-align: center; padding: 40rpx 0; color: #8e8e93; font-size: 26rpx; }

.empty { text-align: center; padding: 80rpx 0 40rpx; color: #8e8e93; font-size: 26rpx; }

.empty-title { font-size: 28rpx; color: #8e8e93; }

.empty-sub { display: block; margin-top: 12rpx; font-size: 24rpx; color: #c7c7cc; }

.empty-actions { margin-top: 28rpx; display: flex; justify-content: center; }

.clear-filter-btn { width: 320rpx; height: 72rpx; border-radius: 999px; background: rgba(10, 132, 255, 0.12); color: #0a84ff; border: 1rpx solid rgba(10, 132, 255, 0.22); font-size: 26rpx; font-weight: 600; display: flex; align-items: center; justify-content: center; box-shadow: none; }

.clear-filter-btn:active { background: rgba(10, 132, 255, 0.18); }
.clear-filter-btn::after { border: none; }

.floating-add { position: fixed; right: 26rpx; bottom: 40rpx; width: 96rpx; height: 96rpx; border-radius: 50%; background: #0a84ff; box-shadow: 0 12rpx 32rpx rgba(10, 132, 255, .3); display: flex; align-items: center; justify-content: center; z-index: 100; transition: opacity 0.3s, transform 0.3s; pointer-events: auto; }

.floating-add-hidden { opacity: 0; pointer-events: none; transform: scale(0.8); }

.add-icon { color: #fff; font-size: 48rpx; font-weight: 600; }
</style>
