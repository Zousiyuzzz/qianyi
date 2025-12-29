<template>
  <view class="page" :style="{ paddingTop: (statusBarHeight + navBarContentHeight) + 'px' }">
    <view class="navbar fixed-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">广告主ID复制</view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <view class="search-section">
      <view class="search-bar">
        <input class="search-input" v-model="searchKeyword" placeholder="搜索广告主ID" @confirm="handleSearch"
          confirm-type="search" />
        <text class="search-icon" @click="handleSearch">🔍</text>
      </view>
    </view>

    <view class="page-content">
      <view class="list-item" v-for="(item, index) in dataList" :key="item.id || index">
        <view class="item-header">
          <view class="item-title">{{ item.accountId || '-' }}</view>
          <view class="item-status">{{ item.status_dictText || item.status || '待处理' }}</view>
        </view>
        <view class="item-content">
          <view class="item-row">
            <text class="label">渠道：</text>
            <text class="value">{{ item.channelName || '-' }}</text>
          </view>
          <view class="item-row" v-if="item.copyResult">
            <text class="label">结果：</text>
            <text class="value">{{ item.copyResult }}</text>
          </view>
          <view class="item-row" v-if="item.createTime">
            <text class="label">创建时间：</text>
            <text class="value">{{ item.createTime }}</text>
          </view>
        </view>
        <view class="item-actions">
          <button class="action-btn" @click.stop="copyId(item.accountId)">复制ID</button>
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
      </view>
    </view>
  </view>
</template>

<script>
import { getAdvertiserCopyList } from '../../common/api/account'

export default {
  data () {
    return {
      dataList: [],
      loading: false,
      hasMore: true,
      pageNo: 1,
      pageSize: 20,
      searchKeyword: '',
      queryParam: {},
      statusBarHeight: 0,
      navBarContentHeight: 44
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
        this.queryParam.accountId = this.searchKeyword
      } else {
        delete this.queryParam.accountId
      }
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
        const res = await getAdvertiserCopyList(params)
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
    copyId (id) {
      if (!id) {
        uni.showToast({ title: '无可复制ID', icon: 'none' })
        return
      }
      uni.setClipboardData({
        data: String(id),
        success: () => {
          uni.showToast({ title: '已复制', icon: 'success' })
        }
      })
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
  width: 160rpx;
  color: #6e6e73;
}
.value {
  flex: 1;
  color: #111;
}
.item-actions {
  margin-top: 12rpx;
  display: flex;
  justify-content: flex-end;
}
.action-btn {
  background: #0a84ff;
  color: #fff;
  border-radius: 12rpx;
  padding: 12rpx 20rpx;
}
.loading-more,
.no-more,
.empty {
  text-align: center;
  color: #8e8e93;
  padding: 24rpx 0;
}
</style>
