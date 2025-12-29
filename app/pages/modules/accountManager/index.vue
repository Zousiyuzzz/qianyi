<template>
  <scroll-view class="page" scroll-y>
    <view class="section">
      <view class="icon-grid">
        <view
          v-for="item in accountModules"
          :key="item.title"
          class="icon-item"
          @click="openModule(item)"
        >
          <view class="icon-wrapper" :style="{ background: item.gradient }">
            <text class="icon-text">{{ item.icon }}</text>
          </view>
          <text class="icon-label">{{ item.title }}</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script>
import { buildWebUrl } from '../../../common/config'

export default {
  data () {
    return {
      accountModules: [
        {
          title: '账户列表',
          path: '/accountids/index',
          native: '/pages/account/index',
          icon: '💳',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
          title: '账户主体',
          path: '/accountSubject/index',
          native: '/pages/account/subject',
          icon: '🏢',
          gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
          title: '共享钱包',
          path: '/advertiserWallet/advertiserWalletInfo/TabAdvertiserWalletInfoList',
          native: '/pages/account/wallet',
          icon: '👛',
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
          title: '子端口',
          path: '/channelManager/subPort',
          native: '/pages/account/subport',
          icon: '🔌',
          gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        },
        {
          title: '广告主ID复制',
          path: '/accountids/copy',
          native: '/pages/account/advertiserCopy',
          icon: '📋',
          gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
        },
        {
          title: '账户绑定变动记录',
          path: '/accountids/accountChangeRecord',
          native: '/pages/account/changeRecord',
          icon: '📜',
          gradient: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)'
        },
        {
          title: '充退处理列表',
          path: '/chongtui/index',
          native: '/pages/fundTransfer/index',
          icon: '💸',
          gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
        },
        {
          title: '账户流水明细',
          path: '/fundTransferRecord/TabFundTransferRecordList',
          native: '/pages/account/flow',
          icon: '💱',
          gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
        },
        {
          title: '账户消耗明细',
          path: '/consume/index',
          native: '/pages/account/consume',
          icon: '📊',
          gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
        }
      ]
    }
  },
  methods: {
    openModule (item) {
      if (item.native) {
        uni.navigateTo({ url: item.native })
        return
      }
      const url = buildWebUrl(item.path)
      uni.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(url)}` })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 20rpx;
}
.section {
  padding: 24rpx 28rpx;
}
.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32rpx 20rpx;
}
.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
.icon-wrapper {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}
.icon-text {
  font-size: 56rpx;
  line-height: 1;
}
.icon-label {
  font-size: 24rpx;
  color: #333;
  text-align: center;
  line-height: 1.4;
}
</style>
