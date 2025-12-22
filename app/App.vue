<template>
  <app>
    <slot />
  </app>
</template>

<script>
import { buildAuthedWebUrl } from './common/config'
import { clearLoginSession, getLastWebRoute, hasValidToken } from './common/auth'

export default {
  mpType: 'app',
  onLaunch () {
    this.ensureLogin()
  },
  methods: {
    ensureLogin () {
      if (!hasValidToken()) {
        clearLoginSession()
        uni.reLaunch({ url: '/pages/login/index' })
        return
      }
      const target = getLastWebRoute()
      const pages = getCurrentPages()
      if (!pages.length || pages[0].route === 'pages/login/index') {
        if (target) {
          const url = buildAuthedWebUrl(target)
          uni.reLaunch({ url: `/pages/webview/index?url=${encodeURIComponent(url)}` })
        } else {
          uni.switchTab({ url: '/pages/home/index' })
        }
      }
    }
  }
}
</script>

<style>
@import url('https://at.alicdn.com/t/c/font_1885651_r9fzj0y3su.css');

page {
  background: #f6f8fb;
  color: #0f172a;
  font-family: "PingFang SC", "Helvetica Neue", Arial, sans-serif;
}

.app-header {
  background-image: linear-gradient(135deg, #2e87ff 0%, #4ca1ff 40%, #7ecbff 100%);
  color: #fff;
  padding: 48rpx 32rpx 24rpx;
  border-bottom-left-radius: 32rpx;
  border-bottom-right-radius: 32rpx;
  box-shadow: 0 20rpx 32rpx rgba(31, 70, 129, 0.22);
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #0f172a;
  margin: 28rpx 0 16rpx;
}

.subtitle {
  color: #475569;
  font-size: 24rpx;
}
</style>
