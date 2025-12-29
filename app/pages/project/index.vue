<template>
  <view class="page" :style="{ paddingTop: (statusBarHeight + navBarContentHeight) + 'px' }">
    <!-- Navbar - 固定定位 -->
    <view class="navbar fixed-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">{{ crud.ui.pageTitle }}</view>
        <view class="navbar-right" @click="showFilter = !showFilter">
          <text class="filter-icon">{{ crud.ui.filter.toggleIcon }}</text>
        </view>
      </view>
    </view>

    <!-- Search + Summary + Sort -->
    <view class="search-section">
      <view class="search-bar">
        <text class="search-icon" @click="handleSearch">{{ crud.ui.search.icon }}</text>
        <input class="search-input" v-model="searchKeyword" :placeholder="crud.ui.search.placeholder"
          @confirm="handleSearch" confirm-type="search" />
        <text class="clear-icon" v-if="searchKeyword" @click.stop="clearSearch">{{ crud.ui.search.clearIcon }}</text>
      </view>

      <!-- Filter summary -->
      <view class="filter-summary" v-if="hasActiveFilters">
        <view class="filter-tags">
          <view class="filter-tag" v-for="(tag, index) in activeFilterTags" :key="index"
            @click.stop="removeFilter(tag.key)">
            <text class="tag-text">{{ tag.label }}</text>
            <text class="tag-close">{{ crud.ui.filter.tagCloseIcon }}</text>
          </view>
        </view>
        <text class="clear-all" @click.stop="clearAllFilters">{{ crud.ui.filter.clearAllText }}</text>
      </view>

      <!-- iOS-ish segmented -->
      <view class="segmented">
        <view class="seg-item" v-for="opt in crud.sort.items" :key="opt.field"
          :class="{ active: sortField === opt.field }" @click="handleSort(opt.field)">
          <text>{{ opt.label }}</text>
          <text class="seg-arrow" v-if="sortField === opt.field">{{ sortOrder === 'desc' ? '↓' : '↑' }}</text>
        </view>
      </view>
    </view>

    <!-- Filter panel -->
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
      <view class="list-item" v-for="(item, index) in dataList" :key="getItemKey(item, index)"
        @click="handleItemClick(item)" @longpress="handleItemActions(item)" hover-class="card-hover"
        hover-stay-time="80">
        <!-- Header -->
        <view class="item-header">
          <view class="item-title-wrapper">
            <text class="item-title">{{ getVal(item, crud.card.titleProp) || crud.ui.list.titleFallback }}</text>
          </view>

          <view class="item-right">
            <text class="arrow-icon">›</text>
          </view>
        </view>

        <!-- One-line summary -->
        <view class="item-subtitle" v-if="getSubtitle(item)">
          <text class="subtext">{{ getSubtitle(item) }}</text>
        </view>

        <!-- Content -->
        <view class="item-content">
          <view class="line">
            <text class="icon">{{ crud.card.line1.icon }}</text>
            <text class="text primary two-line">{{ getVal(item, crud.card.line1.prop) || '-' }}</text>
          </view>

          <view class="line">
            <text class="icon">{{ crud.card.line2.icon }}</text>
            <text class="text secondary">{{ getVal(item, crud.card.line2.leftProp) || '-' }}</text>
            <text class="sep">{{ crud.card.line2.sep }}</text>
            <text class="text tertiary">
              {{ crud.card.line2.rightPrefix }} {{ formatBy(item, crud.card.line2.rightProp,
                crud.card.line2.rightFormatter) }}
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

    <!-- 浮动新增按钮 -->
    <view class="floating-add" :class="{ 'floating-add-hidden': drawerVisible }" @click.stop="handleAdd">
      <text class="add-icon">{{ crud.ui.fab.icon }}</text>
    </view>

    <!-- 项目表单抽屉 -->
    <project-form-drawer :visible="drawerVisible" :editData="drawerEditData" @update:visible="drawerVisible = $event"
      @success="handleDrawerSuccess" @close="handleDrawerClose" />
  </view>
</template>

<script>
import { getProjectList } from '../../common/api/project'
import { openWebView } from '../../common/navigation'
import ProjectFormDrawer from './ProjectFormDrawer.vue'

/**
 * ======= 你复制“客户管理”只需要改这里 =======
 * - ui 文案
 * - api.list 接口
 * - search.keywordProp 搜索字段
 * - sort.items 排序项字段/文案
 * - filters 筛选项/字段/选项
 * - routes/detail/form 页面路径
 * - card 显示字段映射
 * - actions 跳转行为（App页 or WebView）
 */
const crud = {
  ui: {
    pageTitle: '项目管理',
    search: {
      placeholder: '搜索项目名称',
      icon: '🔎',
      clearIcon: '×'
    },
    filter: {
      toggleIcon: '⏷',
      allText: '全部',
      clearAllText: '清除',
      tagCloseIcon: '×',
      resetText: '重置',
      confirmText: '确定'
    },
    list: {
      titleFallback: '未知项目',
      loadingMoreText: '加载中...',
      noMoreText: '没有更多了',
      emptyTitle: '暂无数据',
      emptySubWhenFiltered: '试试清除筛选条件后再看看',
      clearFilterBtnText: '清除筛选'
    },
    fab: {
      icon: '＋'
    },
    actionSheet: {
      items: [
        { key: 'detail', label: '查看详情' },
        { key: 'edit', label: '修改项目' },
        { key: 'web', label: '网页详情' }
      ]
    }
  },

  // 列表接口
  api: {
    list: getProjectList
  },

  // 路由（App原生页面）
  routes: {
    detail: '/pages/project/detail',
    form: '/pages/project/form'
  },

  // 搜索字段映射
  search: {
    keywordProp: 'proName' // 后端接收的字段名
  },

  // 排序
  sort: {
    defaultField: 'updateTime',
    defaultOrder: 'desc',
    paramColumn: 'column',
    paramOrder: 'order',
    items: [
      { field: 'updateTime', label: '更新时间' },
      { field: 'createTime', label: '创建时间' },
      { field: 'businessName', label: '渠道' }
    ]
  },

  // 筛选（完全动态渲染）
  filters: [
    {
      key: 'status',
      label: '状态',
      queryProp: 'status',
      options: [
        { value: '', text: '全部' },
        { value: '1', text: '进行中' },
        { value: '2', text: '暂停' },
        { value: '3', text: '结束' }
      ]
    },
    {
      key: 'operationType',
      label: '运营方式',
      queryProp: 'operationType',
      options: [
        { value: '', text: '全部' },
        { value: '1', text: '自运营' },
        { value: '2', text: '走量' },
        { value: '3', text: '收量' }
      ]
    },
    {
      key: 'collaborationMode',
      label: '合作方式',
      queryProp: 'collaborationMode',
      options: [
        { value: '', text: '全部' },
        { value: '0', text: '预付' },
        { value: '1', text: '垫付' },
        { value: '2', text: '服务费' }
      ]
    }
  ],

  // 卡片显示字段映射
  card: {
    idProp: 'id',
    titleProp: 'proName',
    subtitleParts: [
      { prop: 'businessName', fallback: '-' },
      { prop: 'operationType', formatter: 'operationTypeText' },
      { prop: 'collaborationMode_dictText' }
    ],
    line1: { icon: '🏢', prop: 'customerName' },
    line2: {
      icon: '👤',
      leftProp: 'businessPerson_dictText',
      sep: '·',
      rightPrefix: '更新于',
      rightProp: 'updateTime',
      rightFormatter: 'relativeTime'
    }
  },

  // WebView 行为（可选）
  web: {
    workbenchPath: '/projectManager/workbench',
    titleWorkbench: '项目工作台',
    titleDetail: '项目详情'
  },

  // 行为（你要切成客户管理，改这里即可）
  actions: {
    add(ctx) {
      // App 原生新增
      uni.navigateTo({ url: `${ctx.crud.routes.form}?mode=add` })
      // 如果你仍想走 Web，换成下面这行：
      // openWebView('/projectManager/TabProjectmanageList?openAdd=1', ctx.crud.ui.pageTitle)
    },
    edit(ctx, item) {
      if (!item) return
      uni.navigateTo({ url: `${ctx.crud.routes.form}?mode=edit&id=${encodeURIComponent(item[ctx.crud.card.idProp] || '')}` })
      // Web 工作台（保留备用）
      // const url = `${ctx.crud.web.workbenchPath}?id=${encodeURIComponent(item.uniqueId || '')}&oid=${encodeURIComponent(item.id || '')}`
      // openWebView(url, ctx.crud.web.titleWorkbench)
    },
    webDetail(ctx, item) {
      if (!item) return
      const url = `${ctx.crud.web.workbenchPath}?id=${encodeURIComponent(item.uniqueId || '')}&oid=${encodeURIComponent(item.id || '')}`
      openWebView(url, ctx.crud.web.titleDetail)
    }
  }
}

export default {
  components: {
    ProjectFormDrawer
  },
  data() {
    return {
      crud,

      dataList: [],
      loading: false,
      hasMore: true,
      refreshing: false,
      pageNo: 1,
      pageSize: 20,

      searchKeyword: '',
      showFilter: false,
      queryParam: {},

      // 动态筛选状态
      filterState: {},

      // 排序
      sortField: crud.sort.defaultField,
      sortOrder: crud.sort.defaultOrder,

      // 导航栏相关数据
      statusBarHeight: 0,
      navBarContentHeight: 44,

      // 抽屉相关
      drawerVisible: false,
      drawerEditData: null
    }
  },

  computed: {
    hasActiveFilters() {
      if (this.searchKeyword) return true
      return this.crud.filters.some(f => this.filterState[f.key] && this.filterState[f.key].value)
    },

    activeFilterTags() {
      const tags = []
      // filter tags
      this.crud.filters.forEach(f => {
        const sel = this.filterState[f.key]
        if (sel && sel.value) tags.push({ key: f.key, label: sel.text })
      })
      // keyword tag
      if (this.searchKeyword) {
        tags.push({ key: '__keyword__', label: `${this.crud.ui.search.placeholder.replace('搜索', '搜索：')}${this.searchKeyword}` })
      }
      return tags
    }
  },

  onLoad() {
    this.getStatusBarHeight()

    // 初始化筛选状态
    this.crud.filters.forEach(f => {
      this.$set(this.filterState, f.key, null)
    })

    // 初始化排序入参
    this.queryParam[this.crud.sort.paramColumn] = this.sortField
    this.queryParam[this.crud.sort.paramOrder] = this.sortOrder

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
    // ========= utils =========
    getItemKey(item, index) {
      const idProp = this.crud.card.idProp
      return (item && item[idProp]) || index
    },

    getVal(obj, prop) {
      if (!obj || !prop) return ''
      // 支持 "a.b.c" 取值
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
          // 只给第一个兜底（保持你原本 businessName || '-' 的效果）
          texts.push(p.fallback)
        }
      })
      // 去掉空串
      const cleaned = texts.filter(t => t !== undefined && t !== null && String(t).trim() !== '')
      return cleaned.length ? cleaned.join(' · ') : ''
    },

    // ========= navbar =========
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

    // ========= search =========
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

    // ========= filters =========
    handleFilterChange(key, e) {
      const f = this.crud.filters.find(x => x.key === key)
      if (!f) return
      const idx = e.detail.value
      this.filterState[key] = f.options[idx]
    },

    resetFilter() {
      this.crud.filters.forEach(f => {
        this.filterState[f.key] = null
      })
    },

    applyFilter() {
      // 清空所有筛选对应 queryProp
      this.crud.filters.forEach(f => {
        delete this.queryParam[f.queryProp]
      })

      // 写入选中的筛选
      this.crud.filters.forEach(f => {
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

    clearAllFilters() {
      this.searchKeyword = ''
      this.crud.filters.forEach(f => (this.filterState[f.key] = null))
      this.queryParam = {}

      // 重新写入排序入参（保持你原逻辑）
      this.queryParam[this.crud.sort.paramColumn] = this.sortField
      this.queryParam[this.crud.sort.paramOrder] = this.sortOrder

      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },

    // ========= sort =========
    handleSort(field) {
      if (this.sortField === field) this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc'
      else {
        this.sortField = field
        this.sortOrder = 'desc'
      }
      this.queryParam[this.crud.sort.paramColumn] = field
      this.queryParam[this.crud.sort.paramOrder] = this.sortOrder

      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },

    // ========= list =========
    async loadData() {
      if (this.loading) return
      this.loading = true
      try {
        const params = {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          ...this.queryParam
        }
        const res = await this.crud.api.list(params)
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
        uni.stopPullDownRefresh()
        this.refreshing = false
      })
    },

    // ========= navigation/actions =========
    handleItemClick(item) {
      // 存储当前 item（detail 页优先读取，保留你原逻辑）
      uni.setStorageSync('_temp_project_data', item)
      const id = this.getVal(item, this.crud.card.idProp)
      uni.navigateTo({ url: `${this.crud.routes.detail}?id=${encodeURIComponent(id || '')}` })
    },

    handleItemActions(item) {
      // 长按直接打开编辑抽屉
      this.drawerEditData = item
      this.drawerVisible = true
    },

    handleAdd() {
      // 打开新增抽屉
      this.drawerEditData = null
      this.drawerVisible = true
    },

    handleEdit(item) {
      // 打开编辑抽屉（保留此方法以兼容其他地方调用）
      this.drawerEditData = item
      this.drawerVisible = true
    },

    handleDrawerSuccess() {
      // 抽屉保存成功后刷新列表
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },

    handleDrawerClose() {
      this.drawerEditData = null
    },

    openWebDetail(item) {
      this.crud.actions.webDetail(this, item)
    },

    // ========= formatters =========
    getOperationTypeText(type) {
      const map = { '1': '自运营', '2': '走量', '3': '收量' }
      return map[String(type)] || '-'
    },

    getRelativeTime(timeStr) {
      if (!timeStr) return '-'
      const time = new Date(String(timeStr).replace(/-/g, '/'))
      const now = new Date()
      const diff = now - time
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days === 1) {
        const hour = time.getHours()
        const minute = time.getMinutes()
        return `昨天 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      }
      if (days < 7) return `${days}天前`
      return String(timeStr).substring(0, 10)
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
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.page-content::-webkit-scrollbar {
  display: none;
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

.empty {
  text-align: center;
  padding: 80rpx 0 40rpx;
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

/* Floating add button */
.floating-add {
  position: fixed;
  right: 26rpx;
  bottom: 40rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #0a84ff;
  box-shadow: 0 12rpx 32rpx rgba(10, 132, 255, .3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: auto;

  &.floating-add-hidden {
    opacity: 0;
    pointer-events: none;
    transform: scale(0.8);
  }
}

.add-icon {
  color: #fff;
  font-size: 48rpx;
  font-weight: 600;
}
</style>
