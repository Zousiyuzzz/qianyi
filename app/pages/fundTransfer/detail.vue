<template>
  <view class="page">
    <view class="navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">充退详情</view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <scroll-view class="content-scroll" scroll-y v-if="recordData">
      <view class="section">
        <view class="section-title">基本信息</view>
        <view class="info-card">
          <view class="info-item">
            <text class="info-label">项目ID</text>
            <text class="info-value">{{ recordData.proUniqueId || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">项目名称</text>
            <text class="info-value">{{ recordData.proName || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">交易类型</text>
            <text class="info-value">{{ getTradeTypeText(recordData.tradeType) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">交易金额</text>
            <text class="info-value amount">¥{{ formatNumber(recordData.amount || 0) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">交易时间</text>
            <text class="info-value">{{ recordData.createTime || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">状态</text>
            <view class="status-badge" :class="getStatusClass(recordData.state)">
              {{ getStatusText(recordData.state) }}
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">账户信息</view>
        <view class="info-card">
          <view class="info-item">
            <text class="info-label">转出账户ID</text>
            <text class="info-value">{{ recordData.sourceAdvertiserId || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">转出账户名称</text>
            <text class="info-value">{{ recordData.sourceAdvertiserName || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">转入账户ID</text>
            <text class="info-value">{{ recordData.targetAdvertiserId || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">转入账户名称</text>
            <text class="info-value">{{ recordData.targetAdvertiserName || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">资金性质</text>
            <text class="info-value">{{ recordData.fundsNature === '1' ? '对公' : recordData.fundsNature === '2' ? '对私' : '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">返点形式</text>
            <text class="info-value">{{ recordData.rebateForm === '1' ? '返货' : recordData.rebateForm === '2' ? '返现' : '-' }}</text>
          </view>
          <view class="info-item" v-if="recordData.rebateNum">
            <text class="info-label">返点</text>
            <text class="info-value">{{ ((recordData.rebateNum || 0) * 100).toFixed(2) }}%</text>
          </view>
        </view>
      </view>

      <view class="section" v-if="recordData.state === '2'">
        <view class="action-buttons">
          <button class="action-btn agree" @click="handleAgree">同意</button>
          <button class="action-btn reject" @click="handleReject">驳回</button>
        </view>
      </view>
    </scroll-view>

    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import { getFundTransferRecordList, agreeFundTransfer, rejectFundTransfer } from '../../common/api/fund'

export default {
  data() {
    return {
      recordId: '',
      recordData: null,
      loading: false
    }
  },
  onLoad(query) {
    this.recordId = query.id
    if (this.recordId) {
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
          // 如果返回失败，返回到充退列表
          uni.navigateTo({
            url: '/pages/fundTransfer/index'
          })
        }
      })
    },
    async loadDetail() {
      this.loading = true
      try {
        const res = await getFundTransferRecordList({ id: this.recordId })
        if (res && res.success) {
          const records = res.result?.records || res.result?.list || []
          if (records.length > 0) {
            this.recordData = records[0]
          } else {
            uni.showToast({
              title: '未找到记录',
              icon: 'none'
            })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
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
    async handleAgree() {
      uni.showModal({
        title: '确认',
        content: '确定要同意这条记录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await agreeFundTransfer(this.recordId)
              if (result && result.success) {
                uni.showToast({
                  title: '同意成功',
                  icon: 'success'
                })
                this.loadDetail()
              } else {
                uni.showToast({
                  title: result.message || '操作失败',
                  icon: 'none'
                })
              }
            } catch (e) {
              uni.showToast({
                title: e.message || '操作失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    async handleReject() {
      uni.showModal({
        title: '确认',
        content: '确定要驳回这条记录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await rejectFundTransfer(this.recordId)
              if (result && result.success) {
                uni.showToast({
                  title: '驳回成功',
                  icon: 'success'
                })
                this.loadDetail()
              } else {
                uni.showToast({
                  title: result.message || '操作失败',
                  icon: 'none'
                })
              }
            } catch (e) {
              uni.showToast({
                title: e.message || '操作失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    getTradeTypeText(type) {
      const map = { '1': '充值', '2': '转账', '3': '退款' }
      return map[type] || '未知'
    },
    getStatusText(state) {
      const map = { '1': '已同意', '2': '待处理', '3': '已驳回' }
      return map[state] || '未知'
    },
    getStatusClass(state) {
      const map = { '1': 'status-agreed', '2': 'status-pending', '3': 'status-rejected' }
      return map[state] || ''
    },
    formatNumber(num) {
      if (!num) return '0.00'
      return Number(num).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
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

.info-value.amount {
  color: #2e87ff;
  font-weight: 600;
}

.status-badge {
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  display: inline-block;
}

.status-pending {
  background: #fff7e6;
  color: #fa8c16;
}

.status-agreed {
  background: #f6ffed;
  color: #52c41a;
}

.status-rejected {
  background: #fff1f0;
  color: #ff4d4f;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.agree {
  background: #2e87ff;
  color: #fff;
}

.action-btn.reject {
  background: #ff4d4f;
  color: #fff;
}

.action-btn::after {
  border: none;
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

