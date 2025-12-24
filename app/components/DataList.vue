<template>
  <view class="data-list">
    <!-- 搜索栏 -->
    <view class="search-bar" v-if="showSearch">
      <view class="search-input-wrapper">
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          :placeholder="searchPlaceholder"
          @confirm="handleSearch"
          confirm-type="search"
        />
        <text class="search-icon" @click="handleSearch">🔍</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar" v-if="filters && filters.length > 0">
      <scroll-view class="filter-scroll" scroll-x>
        <view class="filter-item" 
          v-for="(filter, index) in filters" 
          :key="index"
          :class="{ active: activeFilterIndex === index }"
          @click="handleFilterChange(index)"
        >
          {{ filter.label }}
        </view>
      </scroll-view>
    </view>

    <!-- 列表 -->
    <scroll-view 
      class="list-scroll" 
      scroll-y 
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="handleRefresh"
    >
      <view class="list-item" 
        v-for="(item, index) in dataList" 
        :key="item.id || index"
        @click="handleItemClick(item)"
      >
        <slot name="item" :item="item" :index="index">
          <view class="item-content">
            <view class="item-title">{{ item.title || item.name || '未命名' }}</view>
            <view class="item-desc" v-if="item.desc">{{ item.desc }}</view>
            <view class="item-meta">
              <text class="meta-item" v-if="item.time">{{ item.time }}</text>
              <text class="meta-item" v-if="item.status">{{ item.status }}</text>
            </view>
          </view>
        </slot>
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
export default {
  name: 'DataList',
  props: {
    dataList: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    hasMore: {
      type: Boolean,
      default: true
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    searchPlaceholder: {
      type: String,
      default: '请输入搜索关键词'
    },
    filters: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchKeyword: '',
      activeFilterIndex: 0,
      refreshing: false
    }
  },
  methods: {
    handleSearch() {
      this.$emit('search', this.searchKeyword)
    },
    handleFilterChange(index) {
      this.activeFilterIndex = index
      this.$emit('filter-change', this.filters[index])
    },
    loadMore() {
      if (this.hasMore && !this.loading) {
        this.$emit('load-more')
      }
    },
    handleRefresh() {
      this.refreshing = true
      this.$emit('refresh', () => {
        this.refreshing = false
      })
    },
    handleItemClick(item) {
      this.$emit('item-click', item)
    }
  }
}
</script>

<style scoped>
.data-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.search-bar {
  padding: 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #e5e5e5;
}

.search-input-wrapper {
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

.filter-bar {
  background: #fff;
  border-bottom: 1rpx solid #e5e5e5;
}

.filter-scroll {
  white-space: nowrap;
  padding: 20rpx 24rpx;
}

.filter-item {
  display: inline-block;
  padding: 12rpx 32rpx;
  margin-right: 16rpx;
  border-radius: 32rpx;
  background: #f5f5f5;
  color: #666;
  font-size: 26rpx;
}

.filter-item.active {
  background: #2e87ff;
  color: #fff;
}

.list-scroll {
  flex: 1;
}

.list-item {
  background: #fff;
  margin-bottom: 20rpx;
  padding: 32rpx;
  border-radius: 0;
}

.item-content {
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.item-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 16rpx;
  line-height: 1.5;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.meta-item {
  font-size: 24rpx;
  color: #999;
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

