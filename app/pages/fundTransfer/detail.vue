<template>
  <view class="page" :style="{ paddingTop: (statusBarHeight + navBarContentHeight) + 'px' }">
    <!-- Navbar - 固定定位 -->
    <view class="navbar fixed-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">充退详情</view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <view class="page-content" v-if="recordData">
      <!-- 记录主信息 -->
      <view class="group">
        <view class="group-header">
          <text class="record-name">{{ recordData.proName || '-' }}</text>
          <text class="record-sub">{{ getTradeTypeText(recordData.tradeType) }} · {{ getStatusText(recordData.state)
          }}</text>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="group">
        <view class="group-item large">
          <text class="label">交易金额</text>
          <text class="balance-value">¥{{ formatNumber(recordData.amount || 0) }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">项目ID</text>
          <text class="value">{{ recordData.proUniqueId || '-' }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">项目名称</text>
          <text class="value">{{ recordData.proName || '-' }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">交易类型</text>
          <text class="value">{{ getTradeTypeText(recordData.tradeType) }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">交易时间</text>
          <text class="value">{{ recordData.createTime || '-' }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">状态</text>
          <view class="status-badge" :class="getStatusClass(recordData.state)">
            {{ getStatusText(recordData.state) }}
          </view>
        </view>
      </view>

      <!-- 账户信息 -->
      <view class="group">
        <view class="group-item section-title">
          <text>账户信息</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">转出账户ID</text>
          <text class="value">{{ recordData.sourceAdvertiserId || '-' }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">转出账户名称</text>
          <text class="value">{{ recordData.sourceAdvertiserName || '-' }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">转入账户ID</text>
          <text class="value">{{ recordData.targetAdvertiserId || '-' }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">转入账户名称</text>
          <text class="value">{{ recordData.targetAdvertiserName || '-' }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">资金性质</text>
          <text class="value">{{ recordData.fundsNature === '1' ? '对公' : recordData.fundsNature === '2' ? '对私' : '-'
          }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">返点形式</text>
          <text class="value">{{ recordData.rebateForm === '1' ? '返货' : recordData.rebateForm === '2' ? '返现' : '-'
          }}</text>
        </view>
        <view class="divider" v-if="recordData.rebateNum"></view>
        <view class="group-item" v-if="recordData.rebateNum">
          <text class="label">返点</text>
          <text class="value">{{ ((recordData.rebateNum || 0) * 100).toFixed(2) }}%</text>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="bottom-safe" v-if="recordData.state === '2'">
        <view class="bottom-actions">
          <button class="btn ios-secondary" @click="handleReject">驳回</button>
          <button class="btn ios-primary" @click="handleAgree">同意</button>
        </view>
      </view>
    </view>

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
      loading: false,
      // 导航栏相关数据
      statusBarHeight: 0,
      navBarContentHeight: 44 // 导航栏内容高度44px
    }
  },
  onLoad(query) {
    this.getStatusBarHeight()
    this.recordId = query.id
    // 先从列表传递的数据获取
    const tempData = uni.getStorageSync('_temp_fundTransfer_data')
    if (tempData && tempData.id === this.recordId) {
      this.recordData = tempData
      uni.removeStorageSync('_temp_fundTransfer_data')
      // 如果状态是待处理，需要重新加载以获取最新状态
      if (tempData.state === '2') {
        this.loadDetail()
      }
    } else if (this.recordId) {
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
        const res = await getFundTransferRecordList({ id: this.recordId })
        if (res && res.success) {
          const result = (res && res.result) ? res.result : {}
          const records = result.records || result.list || []
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

.record-name {
  font-size: 34rpx;
  font-weight: 600;
}

.record-sub {
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

.group-item.large {
  flex-direction: column;
  align-items: flex-start;
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

.balance-value {
  margin-top: 6rpx;
  font-size: 40rpx;
  font-weight: 600;
  color: #0a84ff;
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

/* Bottom actions */
.bottom-safe {
  position: sticky;
  bottom: 0;
  background: #f2f2f7;
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-actions {
  display: flex;
  gap: 12rpx;
  padding: 12rpx 16rpx 16rpx;
}

.btn {
  flex: 1;
  height: 72rpx;
  border-radius: 18rpx;
  font-size: 26rpx;
}

.btn::after {
  border: none;
}

.btn.ios-secondary {
  background: #ededf0;
  color: #1c1c1e;
}

.btn.ios-primary {
  background: #ffffff;
  color: #0a84ff;
  box-shadow: 0 0 0 1rpx rgba(0, 0, 0, .06) inset;
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
