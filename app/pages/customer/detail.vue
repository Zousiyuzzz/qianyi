<template>
  <view class="page">
    <view class="navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">客户详情</view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <scroll-view class="content-scroll" scroll-y v-if="customerData">
      <!-- 基本信息 -->
      <view class="section">
        <view class="section-title">基本信息</view>
        <view class="info-card">
          <view class="info-item">
            <text class="info-label">客户ID</text>
            <text class="info-value">{{ customerData.id }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">客户主体</text>
            <view class="info-value-row">
              <text class="info-value" v-if="!isEditingName">{{ customerData.customerName }}</text>
              <input 
                v-else 
                class="info-input" 
                v-model="editingName" 
                @blur="saveName"
                @confirm="saveName"
                confirm-type="done"
              />
              <text class="edit-btn" @click="toggleEdit">{{ isEditingName ? '保存' : '编辑' }}</text>
            </view>
          </view>
          <view class="info-item">
            <text class="info-label">商务</text>
            <text class="info-value">{{ customerData.salesPerson_dictText || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">运营方式</text>
            <text class="info-value">{{ getOperationModes(customerData.projectsByClientDistinctOnOperationModes) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">合作状态</text>
            <view class="status-badge" :class="getCooperationStatusClass(customerData)">
              {{ getCooperationStatus(customerData) }}
            </view>
          </view>
        </view>
      </view>

      <!-- 渠道信息 -->
      <view class="section" v-if="channelList.length > 0">
        <view class="section-title">渠道信息</view>
        <view class="channel-card" v-for="(channel, index) in channelList" :key="index">
          <view class="channel-header">
            <text class="channel-name">{{ channel.channelName || channel.channel_sign }}</text>
            <view class="channel-status" :class="getChannelStatusClass(channel)">
              {{ getChannelStatus(channel) }}
            </view>
          </view>
          <view class="channel-info">
            <view class="channel-row">
              <text class="label">项目：</text>
              <text class="value">{{ channel.proName || '-' }}</text>
            </view>
            <view class="channel-row">
              <text class="label">商务：</text>
              <text class="value">{{ channel.businessPerson || '-' }}</text>
            </view>
            <view class="channel-row">
              <text class="label">最后消耗时间：</text>
              <text class="value">{{ channel.last_consume_time || '-' }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

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
      channelList: []
    }
  },
  onLoad(query) {
    this.customerId = query.id
    if (this.customerId) {
      this.loadDetail()
    }
  },
  onBackPress() {
    this.handleBack()
    return true
  },
  methods: {
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

.content-scroll {
  flex: 1;
}

.section {
  margin: 16rpx;
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-item {
  display: flex;
  align-items: center;
  min-height: 48rpx;
}

.info-label {
  font-size: 24rpx;
  color: #666;
  min-width: 120rpx;
}

.info-value {
  font-size: 24rpx;
  color: #333;
  flex: 1;
}

.info-value-row {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.info-input {
  flex: 1;
  font-size: 24rpx;
  color: #333;
  padding: 8rpx 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

.edit-btn {
  font-size: 24rpx;
  color: #2e87ff;
  padding: 8rpx 16rpx;
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

.channel-card {
  background: #f9f9f9;
  border-radius: 8rpx;
  padding: 16rpx;
  margin-bottom: 12rpx;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.channel-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.channel-status {
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
  font-size: 22rpx;
}

.channel-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.channel-row {
  display: flex;
  font-size: 24rpx;
}

.channel-row .label {
  color: #666;
  min-width: 140rpx;
}

.channel-row .value {
  color: #333;
  flex: 1;
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

