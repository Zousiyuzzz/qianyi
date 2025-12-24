<template>
  <view class="page">
    <view class="navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">项目详情</view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <scroll-view class="content-scroll" scroll-y v-if="projectData">
      <!-- 基本信息 -->
      <view class="section">
        <view class="section-title">基本信息</view>
        <view class="info-card">
          <view class="info-item">
            <text class="info-label">项目名称</text>
            <text class="info-value">{{ projectData.proName || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">唯一ID</text>
            <text class="info-value">{{ projectData.uniqueId || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">客户名称</text>
            <text class="info-value">{{ projectData.customerName || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">渠道名称</text>
            <text class="info-value">{{ projectData.businessName || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">AE</text>
            <text class="info-value">{{ projectData.aePerson_dictText || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">商务</text>
            <text class="info-value">{{ projectData.businessPerson_dictText || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">运营方式</text>
            <text class="info-value">{{ getOperationTypeText(projectData.operationType) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">合作方式</text>
            <text class="info-value">{{ projectData.collaborationMode_dictText || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">结算方式</text>
            <text class="info-value">{{ getPaymentMethodText(projectData.paymentMethod) }}</text>
          </view>
          <view class="info-item" v-if="projectData.beginDate">
            <text class="info-label">项目开始时间</text>
            <text class="info-value">{{ projectData.beginDate || '-' }}</text>
          </view>
          <view class="info-item" v-if="projectData.endDate">
            <text class="info-label">项目结束时间</text>
            <text class="info-value">{{ projectData.endDate || '-' }}</text>
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
import { getProjectDetail } from '../../common/api/project'

export default {
  data() {
    return {
      projectId: '',
      projectData: null,
      loading: false
    }
  },
  onLoad(query) {
    this.projectId = query.id
    if (this.projectId) {
      this.loadDetail()
    }
  },
  onBackPress() {
    this.handleBack()
    return true
  },
  methods: {
    handleBack() {
      uni.navigateBack({
        fail: () => {
          // 如果返回失败，返回到项目列表
          uni.navigateTo({
            url: '/pages/project/index'
          })
        }
      })
    },
    async loadDetail() {
      this.loading = true
      try {
        const res = await getProjectDetail(this.projectId)
        if (res && res.success) {
          this.projectData = res.result
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
    getOperationTypeText(type) {
      const map = {
        '1': '自运营',
        '2': '走量',
        '3': '收量'
      }
      return map[type] || '-'
    },
    getPaymentMethodText(method) {
      const map = {
        '0': '充值结算',
        '1': '消耗结算'
      }
      return map[method] || '-'
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: #fff;
  border-bottom: 1rpx solid #e5e5e5;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
}

.navbar-left {
  width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.back-icon {
  font-size: 56rpx;
  color: #333;
  font-weight: 300;
  line-height: 1;
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.navbar-right {
  width: 80rpx;
}

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
  min-width: 140rpx;
}

.info-value {
  font-size: 24rpx;
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

