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
  onLaunch() {
    this.ensureLogin()
  },
  methods: {
    ensureLogin() {
      if (!hasValidToken()) {
        clearLoginSession()
        uni.reLaunch({ url: '/pages/login/index' })
        return
      }
      // 如果已经有token，检查当前页面
      const pages = getCurrentPages()
      // 如果当前在登录页，跳转到首页
      if (pages.length && pages[0].route === 'pages/login/index') {
        uni.switchTab({ url: '/pages/home/index' })
      }
      // 其他情况不处理，保持当前页面
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

/*
正整数a与b使得ab＋1整除a^2＋b^2，求证：（a^2＋b^2）/（ab＋1）是某个正整数的平方
*/
.app-header {
  background-image: linear-gradient(135deg, #2e87ff 0%, #4ca1ff 40%, #7ecbff 100%);
  color: #fff;
  padding: 48rpx 32rpx 24rpx;
  /* border-bottom-left-radius: 32rpx;
  border-bottom-right-radius: 32rpx; */
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
