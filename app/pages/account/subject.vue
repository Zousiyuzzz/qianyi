<template>
  <view class="page" :style="{ paddingTop: (statusBarHeight + navBarContentHeight) + 'px' }">
    <view class="navbar fixed-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">账户主体</view>
        <view class="navbar-right" @click="showFilter = !showFilter">
          <text class="filter-icon">筛选</text>
        </view>
      </view>
    </view>

    <view class="search-section">
      <view class="search-bar">
        <input class="search-input" v-model="searchKeyword" placeholder="搜索主体名称" @confirm="handleSearch"
          confirm-type="search" />
        <text class="search-icon" @click="handleSearch">🔍</text>
      </view>
    </view>

    <view class="filter-panel" v-if="showFilter">
      <view class="filter-item">
        <text class="filter-label">渠道：</text>
        <picker mode="selector" :range="channelOptions" range-key="text" @change="handleChannelChange">
          <view class="filter-value">
            {{ selectedChannel ? selectedChannel.text : '全部' }}
          </view>
        </picker>
      </view>
      <view class="filter-actions">
        <button class="filter-btn reset" @click="resetFilter">重置</button>
        <button class="filter-btn confirm" @click="applyFilter">确定</button>
      </view>
    </view>

    <view class="page-content">
      <view class="list-item" v-for="(item, index) in dataList" :key="item.id || index">
        <view class="item-header">
          <view class="item-title">{{ item.subjectName || '-' }}</view>
          <view class="item-status">{{ item.channelPlatform || '-' }}</view>
        </view>
        <view class="item-content">
          <view class="item-row">
            <text class="label">渠道：</text>
            <text class="value">{{ item.channelName || '-' }}</text>
          </view>
          <view class="item-row">
            <text class="label">合作方式：</text>
            <text class="value">{{ formatCollaboration(item.collaborationMode) }}</text>
          </view>
          <view class="item-row" v-if="item.proName">
            <text class="label">项目：</text>
            <text class="value">{{ item.proName }}</text>
          </view>
          <view class="item-row" v-if="item.rebateTeptName">
            <text class="label">返点模板：</text>
            <text class="value">{{ item.rebateTeptName }}</text>
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
import { getAccountSubjectList } from '../../common/api/account'

export default {
  data () {
    return {
      dataList: [],
      loading: false,
      hasMore: true,
      pageNo: 1,
      pageSize: 20,
      searchKeyword: '',
      showFilter: false,
      queryParam: {},
      statusBarHeight: 0,
      navBarContentHeight: 44,
      channelOptions: [
        { value: '', text: '全部' },
        { value: 'KS', text: '快手' },
        { value: 'DY', text: '抖音' },
        { value: 'TX', text: '腾讯' },
        { value: 'XHS', text: '小红书' },
        { value: 'CJHC', text: '穿山甲' },
        { value: 'BLBL', text: '哔哩哔哩' }
      ],
      selectedChannel: null
    }
  },
  computed: {
    hasActiveFilters () {
      return !!(this.selectedChannel || this.searchKeyword)
    }
  },
  onLoad () {
    this.getStatusBarHeight()
    this.loadData()
  },
  onPullDownRefresh () {
    this.handleRefresh()
  },
  onReachBottom () {
    this.loadMore()
  },
  onBackPress () {
    this.handleBack()
    return true
  },
  methods: {
    getStatusBarHeight () {
      try {
        const systemInfo = uni.getSystemInfoSync()
        this.statusBarHeight = systemInfo.statusBarHeight || 0
      } catch (error) {
        this.statusBarHeight = 0
      }
    },
    handleBack () {
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
    handleSearch () {
      if (this.searchKeyword) {
        this.queryParam.subjectName = this.searchKeyword
      } else {
        delete this.queryParam.subjectName
      }
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },
    handleChannelChange (e) {
      const index = e.detail.value
      this.selectedChannel = this.channelOptions[index]
    },
    resetFilter () {
      this.selectedChannel = null
    },
    applyFilter () {
      this.queryParam = {}
      if (this.searchKeyword) this.queryParam.subjectName = this.searchKeyword
      if (this.selectedChannel && this.selectedChannel.value) {
        this.queryParam.channelSign = this.selectedChannel.value
      }
      this.showFilter = false
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },
    async loadData () {
      if (this.loading) return
      this.loading = true
      try {
        const params = {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          ...this.queryParam
        }
        const res = await getAccountSubjectList(params)
        if (res && res.success) {
          const result = res.result || {}
          const records = result.records || result.list || []
          this.dataList = this.pageNo === 1 ? records : [...this.dataList, ...records]
          this.hasMore = records.length >= this.pageSize
        } else {
          uni.showToast({ title: res.message || '加载失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: e.message || '加载失败', icon: 'none' })
      } finally {
        this.loading = false
        uni.stopPullDownRefresh()
      }
    },
    loadMore () {
      if (this.hasMore && !this.loading) {
        this.pageNo++
        this.loadData()
      }
    },
    handleRefresh () {
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },
    clearAllFilters () {
      this.searchKeyword = ''
      this.selectedChannel = null
      this.queryParam = {}
      this.pageNo = 1
      this.dataList = []
      this.loadData()
    },
    formatCollaboration (value) {
      const map = { 0: '预付', 1: '垫付', 2: '服务费' }
      return map[value] || map[Number(value)] || '-'
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../common/styles/ios-common.scss';
.page {
  height: 100vh;
  background: #f2f2f7;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
.list-item {
  background: #fff;
  margin: 12rpx 16rpx;
  padding: 18rpx 18rpx;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
}
.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}
.item-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #111;
}
.item-status {
  font-size: 24rpx;
  color: #6e6e73;
}
.item-content {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.item-row {
  display: flex;
  font-size: 26rpx;
  color: #333;
}
.label {
  width: 150rpx;
  color: #6e6e73;
}
.value {
  flex: 1;
  color: #111;
}
.loading-more,
.no-more,
.empty {
  text-align: center;
  color: #8e8e93;
  padding: 24rpx 0;
}
.empty-title {
  font-size: 28rpx;
  color: #111;
}
.empty-sub {
  font-size: 24rpx;
  color: #6e6e73;
  margin-top: 8rpx;
}
.empty-actions {
  margin-top: 12rpx;
}
.clear-filter-btn {
  background: #0a84ff;
  color: #fff;
  border-radius: 999px;
}
</style>
