<template>
  <view class="page" :style="{ paddingTop: (statusBarHeight + navBarContentHeight) + 'px' }">
    <!-- Navbar - 固定定位 -->
    <view class="navbar fixed-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">客户详情</view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <view class="page-content" v-if="customerData">
      <!-- 客户主信息 -->
      <view class="group">
        <view class="group-header">
          <text class="customer-name">{{ customerData.customerName || '-' }}</text>
          <text class="customer-sub">{{ customerData.salesPerson_dictText || '-' }}</text>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="group">
        <view class="group-item">
          <text class="label">客户ID</text>
          <text class="value">{{ customerData.id }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">客户主体</text>
          <view class="value-row">
            <text class="value" v-if="!isEditingName">{{ customerData.customerName }}</text>
            <input v-else class="value-input" v-model="editingName" @blur="saveName" @confirm="saveName"
              confirm-type="done" />
            <text class="edit-btn" @click="toggleEdit">{{ isEditingName ? '保存' : '编辑' }}</text>
          </view>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">商务</text>
          <text class="value">{{ customerData.salesPerson_dictText || '-' }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">运营方式</text>
          <text class="value">{{ getOperationModes(customerData.projectsByClientDistinctOnOperationModes) }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">合作状态</text>
          <view class="status-badge" :class="getCooperationStatusClass(customerData)">
            {{ getCooperationStatus(customerData) }}
          </view>
        </view>
      </view>

      <!-- 渠道信息 -->
      <view class="group" v-if="channelList.length > 0">
        <view class="group-item section-title">
          <text>渠道信息</text>
        </view>
        <view v-for="(channel, index) in channelList" :key="index">
          <view class="divider" v-if="index > 0"></view>
          <view class="group-item">
            <text class="label">渠道名称</text>
            <view class="value-row">
              <text class="value">{{ channel.channelName || channel.channel_sign || '-' }}</text>
              <view class="status-badge" :class="getChannelStatusClass(channel)">
                {{ getChannelStatus(channel) }}
              </view>
            </view>
          </view>
          <view class="divider"></view>
          <view class="group-item">
            <text class="label">项目</text>
            <text class="value">{{ channel.proName || '-' }}</text>
          </view>
          <view class="divider"></view>
          <view class="group-item">
            <text class="label">商务</text>
            <text class="value">{{ channel.businessPerson || '-' }}</text>
          </view>
          <view class="divider"></view>
          <view class="group-item">
            <text class="label">最后消耗时间</text>
            <text class="value">{{ channel.last_consume_time || '-' }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import { getCustomerDetail, updateCustomerName } from '../../common/api/customer'

export default {
  data() {
    return {
      customerId: '',
      customerData: null,
      loading: false,
      isEditingName: false,
      editingName: '',
      channelList: [],
      // 导航栏相关数据
      statusBarHeight: 0,
      navBarContentHeight: 44 // 导航栏内容高度44px
    }
  },
  onLoad(query) {
    this.getStatusBarHeight()
    this.customerId = query.id
    // 先从列表传递的数据获取
    const tempData = uni.getStorageSync('_temp_customer_data')
    if (tempData && tempData.id === this.customerId) {
      this.customerData = tempData
      this.editingName = tempData.customerName
      // 处理渠道数据
      if (tempData.lastConsumeTimeByProjectChannels && Array.isArray(tempData.lastConsumeTimeByProjectChannels)) {
        this.channelList = tempData.lastConsumeTimeByProjectChannels
      }
      uni.removeStorageSync('_temp_customer_data')
    } else if (this.customerId) {
      this.loadDetail()
    }
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
    async loadDetail() {
      this.loading = true
      try {
        const res = await getCustomerDetail(this.customerId)
        if (res && res.success) {
          this.customerData = res.result
          this.editingName = res.result.customerName
          // 处理渠道数据
          if (res.result.lastConsumeTimeByProjectChannels && Array.isArray(res.result.lastConsumeTimeByProjectChannels)) {
            this.channelList = res.result.lastConsumeTimeByProjectChannels
          }
        } else {
          uni.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (e) {
        console.error('加载详情失败:', e)
        uni.showToast({
          title: e.message || '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    toggleEdit() {
      if (this.isEditingName) {
        this.saveName()
      } else {
        this.isEditingName = true
      }
    },
    async saveName() {
      if (!this.editingName || this.editingName === this.customerData.customerName) {
        this.isEditingName = false
        return
      }
      try {
        const res = await updateCustomerName(this.customerId, this.editingName)
        if (res && res.success) {
          this.customerData.customerName = this.editingName
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: res.message || '保存失败',
            icon: 'none'
          })
          this.editingName = this.customerData.customerName
        }
      } catch (e) {
        uni.showToast({
          title: e.message || '保存失败',
          icon: 'none'
        })
        this.editingName = this.customerData.customerName
      } finally {
        this.isEditingName = false
      }
    },
    getOperationModes(modes) {
      if (!modes || !Array.isArray(modes)) return '-'
      const modeMap = { '1': '自运营', '2': '走量', '3': '收量' }
      const uniqueModes = [...new Set(modes)]
      return uniqueModes.map(m => modeMap[m] || m).join('、') || '-'
    },
    getCooperationStatus(item) {
      if (!item.lastConsumeTimeByProjectChannels || !Array.isArray(item.lastConsumeTimeByProjectChannels)) {
        return '待消耗'
      }
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

      if (hasRecent) return '正常合作'
      if (hasOld) return '合作放缓'
      return '待消耗'
    },
    getCooperationStatusClass(item) {
      const status = this.getCooperationStatus(item)
      if (status === '正常合作') return 'status-normal'
      if (status === '合作放缓') return 'status-slow'
      return 'status-pending'
    },
    getChannelStatus(channel) {
      if (!channel.last_consume_time) return '待消耗'
      const now = Date.now()
      const consumeTime = new Date(channel.last_consume_time).getTime()
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

      if (consumeTime > sevenDaysAgo) return '合作中'
      if (consumeTime > thirtyDaysAgo) return '合作放缓'
      return '已停投'
    },
    getChannelStatusClass(channel) {
      const status = this.getChannelStatus(channel)
      if (status === '合作中') return 'status-normal'
      if (status === '合作放缓') return 'status-slow'
      return 'status-stopped'
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

/* Grouped list */
.group {
  margin: 16rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.group-header {
  padding: 20rpx;
}

.customer-name {
  font-size: 34rpx;
  font-weight: 600;
}

.customer-sub {
  margin-top: 6rpx;
  font-size: 26rpx;
  color: #6e6e73;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
}

.group-item.section-title {
  font-weight: 600;
}

.label {
  font-size: 24rpx;
  color: #8e8e93;
}

.value {
  font-size: 26rpx;
  color: #1c1c1e;
}

.value-row {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
}

.value-input {
  flex: 1;
  font-size: 26rpx;
  color: #1c1c1e;
  padding: 8rpx 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  max-width: 300rpx;
}

.edit-btn {
  font-size: 24rpx;
  color: #0a84ff;
  padding: 8rpx 16rpx;
}

/* Divider */
.divider {
  height: 1rpx;
  background: rgba(0, 0, 0, .06);
  margin-left: 20rpx;
}

.status-badge {
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
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

.status-stopped {
  background: #fff1f0;
  color: #ff4d4f;
}


.loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 26rpx;
}
</style>
