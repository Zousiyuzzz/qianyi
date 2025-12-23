<template>
  <view class="page">
    <view class="toolbar gradient">
      <view class="title">{{ title }}</view>
      <view class="subtitle">支持所有 Web/H5 功能，加载中请稍候。</view>
    </view>

    <view class="state" v-if="!decodedUrl">
      <view class="state-title">暂无跳转地址</view>
      <view class="state-desc">未收到 H5 链接，将自动切回默认首页。</view>
      <button class="primary" @click="openDefault">前往默认首页</button>
    </view>

    <view class="state" v-else-if="hasError">
      <view class="state-title">页面加载异常</view>
      <view class="state-desc">请检查网络或稍后重试，如持续失败可返回上一页。</view>
      <button class="primary" @click="reload">重新加载</button>
    </view>

    <view class="webview-wrapper" v-else>
      <web-view :src="decodedUrl" @load="handleLoad" @error="handleError"></web-view>
      <view class="loading" v-if="loading">正在加载 H5 页面…</view>
    </view>
  </view>
</template>

<script>
import { buildAuthedWebUrl } from '../../common/config'

export default {
  data () {
    return {
      url: '',
      title: 'H5 功能',
      loading: true,
      hasError: false
    }
  },
  computed: {
    decodedUrl () {
      if (!this.url) return ''
      return decodeURIComponent(this.url)
    }
  },
  onLoad (query) {
    this.url = query.url || ''
    this.title = query.title || 'H5 功能'
    if (!this.url) {
      this.openDefault()
    }
  },
  methods: {
    handleLoad () {
      this.loading = false
      this.hasError = false
    },
    handleError () {
      this.loading = false
      this.hasError = true
    },
    reload () {
      if (!this.decodedUrl) {
        this.openDefault()
        return
      }
      this.hasError = false
      this.loading = true
      const refreshedUrl = `${this.decodedUrl}${this.decodedUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`
      this.url = encodeURIComponent(refreshedUrl)
    },
    openDefault () {
      const fallback = encodeURIComponent(buildAuthedWebUrl())
      this.url = fallback
      this.title = 'H5 功能'
      this.loading = true
      this.hasError = false
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
}
.toolbar {
  padding: 24rpx 28rpx 12rpx;
  background: #f6f8fb;
  color: #0f172a;
}
.gradient {
  background: linear-gradient(135deg, #e8f2ff 0%, #f4f8ff 100%);
}
.title {
  font-size: 32rpx;
  font-weight: 700;
}
.subtitle {
  font-size: 24rpx;
  color: #475569;
}
.state {
  padding: 60rpx 32rpx;
  text-align: center;
  color: #0f172a;
}
.state-title {
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 16rpx;
}
.state-desc {
  font-size: 26rpx;
  color: #64748b;
  margin-bottom: 28rpx;
}
.primary {
  width: 320rpx;
  height: 80rpx;
  line-height: 80rpx;
  color: #fff;
  font-size: 28rpx;
  border: none;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #2e87ff 0%, #4ca1ff 40%, #7ecbff 100%);
}
.webview-wrapper {
  position: relative;
  min-height: 60vh;
}
.loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16rpx 20rpx;
  background: rgba(255, 255, 255, 0.92);
  color: #475569;
  font-size: 24rpx;
  text-align: center;
  z-index: 10;
}
</style>
