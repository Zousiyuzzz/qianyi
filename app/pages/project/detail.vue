<template>
  <view class="page">
    <!-- Navbar -->
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
      <!-- 项目主信息 -->
      <view class="group">
        <view class="group-header">
          <text class="project-name">{{ projectData.proName || '-' }}</text>
          <text class="project-sub">{{ projectData.customerName || '-' }}</text>
        </view>
      </view>

      <!-- 基础信息 -->
      <view class="group">
        <view class="group-item">
          <text class="label">渠道</text>
          <text class="value">{{ projectData.businessName || '-' }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">运营方式</text>
          <text class="value">{{ getOperationTypeText(projectData.operationType) }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">商务</text>
          <text class="value">{{ projectData.businessPerson_dictText || '-' }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">AE</text>
          <text class="value">{{ projectData.aePerson_dictText || '-' }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">合作方式</text>
          <text class="value">{{ projectData.collaborationMode_dictText || '-' }}</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">结算方式</text>
          <text class="value">{{ getPaymentMethodText(projectData.paymentMethod) }}</text>
        </view>
      </view>

      <!-- 可用余额 -->
      <view class="group" v-if="fundPoolData">
        <view class="group-item large">
          <text class="label">可用余额</text>
          <text class="balance-value">
            ¥{{ formatNumber(fundPoolData ? fundPoolData.availablebBalance : 0) }}
          </text>
        </view>
      </view>

      <!-- 资金概览 -->
      <view class="group" v-if="fundPoolData">
        <view class="group-item">
          <text class="label">授信总额度</text>
          <text class="value">
            ¥{{ formatNumber(fundPoolData ? fundPoolData.totalCreditLimit : 0) }}
          </text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">授信可用</text>
          <text class="value">
            ¥{{ formatNumber(fundPoolData ? fundPoolData.availableCreditBalance : 0) }}
          </text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">总备款</text>
          <text class="value">
            ¥{{ formatNumber(fundPoolData ? fundPoolData.totalCashReserve : 0) }}
          </text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">总欠款</text>
          <text class="value negative">
            ¥{{ formatNumber(fundPoolData ? fundPoolData.totalArrears : 0) }}
          </text>
        </view>
      </view>

      <!-- 对公资金 -->
      <view class="group" v-if="fundPoolData">
        <view class="group-item section-title">
          <text>对公资金</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">现金备款</text>
          <text class="value">
            ¥{{ formatNumber(fundPoolData ? fundPoolData.publicCashReserves : 0) }}
          </text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">授信欠款</text>
          <text class="value negative">
            ¥{{ formatNumber(fundPoolData ? fundPoolData.publicCreditArrears : 0) }}
          </text>
        </view>
      </view>

      <!-- 对私资金 -->
      <view class="group" v-if="fundPoolData">
        <view class="group-item section-title">
          <text>对私资金</text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">现金备款</text>
          <text class="value">
            ¥{{ formatNumber(fundPoolData ? fundPoolData.privateCashReserve : 0) }}
          </text>
        </view>
        <view class="divider"></view>
        <view class="group-item">
          <text class="label">授信欠款</text>
          <text class="value negative">
            ¥{{ formatNumber(fundPoolData ? fundPoolData.privateCreditArrears : 0) }}
          </text>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="bottom-safe">
        <view class="bottom-actions">
          <button class="btn ios-secondary" @click="handleChangeLog">变动明细</button>
          <button class="btn ios-primary" @click="handleFundPool">查看资金池</button>
        </view>
      </view>
    </scroll-view>

    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import { getProjectDetail, getProjectFundPool } from '../../common/api/project'

export default {
  data() {
    return {
      projectId: '',
      projectData: null,
      fundPoolData: null,
      loading: false
    }
  },
  onLoad(query) {
    this.projectId = query.id
    const tempData = uni.getStorageSync('_temp_project_data')
    if (tempData && tempData.id === this.projectId) {
      this.projectData = tempData
      uni.removeStorageSync('_temp_project_data')
      this.loadFundPool()
    } else {
      this.loadDetail()
    }
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
    async loadFundPool() {
      const res = await getProjectFundPool({ proId: this.projectId })
      if (res && res.success) {
        const list = res.result && (res.result.records || res.result.list) || []
        this.fundPoolData = list.length ? list[0] : null
      }
    },
    async loadDetail() {
      this.loading = true
      try {
        const detailRes = await getProjectDetail(this.projectId)
        const fundRes = await getProjectFundPool({ proId: this.projectId })
        if (detailRes && detailRes.success) {
          this.projectData = detailRes.result
        }
        if (fundRes && fundRes.success) {
          const list = fundRes.result && (fundRes.result.records || fundRes.result.list) || []
          this.fundPoolData = list.length ? list[0] : null
        }
      } finally {
        this.loading = false
      }
    },
    handleFundPool() {
      uni.navigateTo({ url: `/pages/project/fundPool?proId=${this.projectId}` })
    },
    handleChangeLog() {
      uni.navigateTo({ url: `/pages/project/fundChangeLog?proId=${this.projectId}` })
    },
    formatNumber(num) {
      return Number(num || 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    getOperationTypeText(v) {
      return { 1: '自运营', 2: '走量', 3: '收量' }[v] || '-'
    },
    getPaymentMethodText(v) {
      return { 0: '充值结算', 1: '消耗结算' }[v] || '-'
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../common/styles/ios-common.scss';

/* Navbar */
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

.project-name {
  font-size: 34rpx;
  font-weight: 600;
}

.project-sub {
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

.value.negative {
  color: #ff3b30;
}

.balance-value {
  margin-top: 6rpx;
  font-size: 40rpx;
  font-weight: 600;
}

/* Divider */
.divider {
  height: 1rpx;
  background: rgba(0, 0, 0, .06);
  margin-left: 20rpx;
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

/* Loading */
.loading {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}
</style>
