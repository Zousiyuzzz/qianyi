<template>
  <scroll-view class="page" scroll-y>
    <view class="section">
      <view class="icon-grid">
        <view 
          v-for="item in modules" 
          :key="item.title" 
          class="icon-item"
          @click="openWeb(item.path)"
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
import { buildAuthedWebUrl } from '../../../common/config'

export default {
  data () {
    return {
      modules: [
        { 
          title: '客户池海', 
          path: '/customerManager/TabCustomermanageList', 
          icon: '👥',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        { 
          title: '客户回款', 
          path: '/customerManager/BackmoneyList', 
          icon: '💰',
          gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        { 
          title: '回款延期', 
          path: '/customerManager/delay', 
          icon: '⏰',
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        }
      ]
    }
  },
  methods: {
    openWeb (path) {
      const url = buildAuthedWebUrl(path)
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
