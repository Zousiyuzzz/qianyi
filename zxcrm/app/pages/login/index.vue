<template>
  <view class="login-page">
    <view class="hero">
      <view class="title">执象云枢 CRM 投放系统</view>
      <view class="subtitle">账号密码登录，登录后自动同步 Token 至 WebView。</view>
    </view>

    <view class="card">
      <view class="form">
        <view class="form-item">
          <view class="input-wrapper">
            <text class="input-icon">👤</text>
            <input 
              v-model.trim="account.username" 
              class="input" 
              placeholder="请输入帐户名" 
              placeholder-class="input-placeholder"
              confirm-type="next"
            />
          </view>
        </view>
        <view class="form-item">
          <view class="input-wrapper">
            <text class="input-icon">🔒</text>
            <input 
              v-model.trim="account.password" 
              class="input" 
              placeholder="请输入密码" 
              placeholder-class="input-placeholder"
              password
            />
          </view>
        </view>
      </view>

      <button class="login-button" :loading="submitting" :disabled="submitting" @tap="handleSubmit">确定</button>
    </view>
  </view>
</template>

<script>
import { buildAuthedWebUrl } from '../../common/config'
import { login } from '../../common/api/login'
import { getLastWebRoute, hasValidToken, rememberWebRoute, setLoginSession } from '../../common/auth'

export default {
  data () {
    return {
      submitting: false,
      account: {
        username: '',
        password: ''
      },
      checkKey: '', // 验证码时间戳
      captcha: '' // 验证码（如果后端需要，可以为空字符串）
    }
  },
  created () {
    // 初始化 checkKey
    this.checkKey = new Date().getTime()
  },
  onShow () {
    if (hasValidToken()) {
      this.redirectAfterLogin()
    }
  },
  methods: {
    showError (message) {
      uni.showToast({ title: message || '请求失败', icon: 'none', duration: 2000 })
    },
    validateAccount () {
      if (!this.account.username) {
        this.showError('请输入用户名')
        return false
      }
      if (!this.account.password) {
        this.showError('请输入密码')
        return false
      }
      return true
    },
    async handleSubmit () {
      if (this.submitting) return
      if (!this.validateAccount()) {
        this.submitting = false
        return
      }
      this.submitting = true
      try {
        const res = await login({
          username: this.account.username,
          password: this.account.password,
          captcha: this.captcha || '', // 验证码，如果不需要可以为空
          checkKey: this.checkKey, // 时间戳，用于验证码校验
          remember_me: true // 记住登录状态
        })
        if (res && (res.code === '200' || res.success)) {
          const result = res.result || {}
          setLoginSession(result)
          this.redirectAfterLogin()
        } else {
          this.showError(res.message || '登录失败')
        }
      } catch (e) {
        this.showError(e.message || '请求失败，请稍后再试')
      } finally {
        this.submitting = false
      }
    },
    redirectAfterLogin () {
      const lastRoute = getLastWebRoute()
      if (lastRoute) {
        rememberWebRoute(lastRoute)
        const url = buildAuthedWebUrl(lastRoute)
        uni.reLaunch({ url: `/pages/webview/index?url=${encodeURIComponent(url)}` })
      } else {
        uni.switchTab({ url: '/pages/home/index' })
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 50%, #69b1ff 100%);
  padding: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
  opacity: 0.3;
  pointer-events: none;
}

.hero {
  padding: 100rpx 40rpx 60rpx;
  text-align: center;
  position: relative;
  z-index: 1;
}

.title {
  font-size: 44rpx;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12rpx;
  letter-spacing: 0.5rpx;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 26rpx;
  line-height: 1.5;
}

.card {
  flex: 1;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 60rpx 40rpx 80rpx;
  margin-top: auto;
  position: relative;
  z-index: 10;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.form {
  margin-bottom: 48rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1rpx solid #d9d9d9;
  border-radius: 6rpx;
  padding: 0 24rpx;
  transition: all 0.3s;
}

.input-wrapper:focus-within {
  border-color: #1890ff;
  box-shadow: 0 0 0 2rpx rgba(24, 144, 255, 0.2);
}

.input-icon {
  font-size: 36rpx;
  color: rgba(0, 0, 0, 0.25);
  margin-right: 16rpx;
  flex-shrink: 0;
}

.input {
  flex: 1;
  height: 88rpx;
  background: transparent;
  border: none;
  padding: 0;
  font-size: 30rpx;
  color: rgba(0, 0, 0, 0.85);
  line-height: 88rpx;
  box-sizing: border-box;
}

.input-placeholder {
  color: rgba(0, 0, 0, 0.25);
  font-size: 30rpx;
}

.login-button {
  width: 100%;
  height: 88rpx;
  background: #1890ff;
  color: #ffffff;
  border: none;
  border-radius: 6rpx;
  font-size: 32rpx;
  font-weight: 500;
  line-height: 88rpx;
  text-align: center;
  transition: all 0.3s;
  margin-top: 24rpx;
}

.login-button:active:not([disabled]) {
  background: #40a9ff;
}

.login-button[disabled] {
  background: #d9d9d9;
  color: rgba(0, 0, 0, 0.25);
  opacity: 0.6;
}
</style>
