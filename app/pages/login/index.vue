<template>
  <view class="login-page">
    <view class="hero">
      <view class="title">执象云枢 CRM 投放系统</view>
      <view class="subtitle">账号密码 / 手机号登录，登录后自动同步 Token 至 WebView。</view>
    </view>

    <view class="card">
      <view class="tabs">
        <view :class="['tab', activeTab === 'account' ? 'active' : '']" @tap="activeTab = 'account'">
          账号密码登录
        </view>
        <view :class="['tab', activeTab === 'phone' ? 'active' : '']" @tap="activeTab = 'phone'">
          手机号登录
        </view>
      </view>

      <view v-if="activeTab === 'account'" class="form">
        <view class="form-item">
          <text class="label">用户名</text>
          <input v-model.trim="account.username" class="input" placeholder="请输入账户名" confirm-type="next" />
        </view>
        <view class="form-item">
          <text class="label">密码</text>
          <input v-model.trim="account.password" class="input" placeholder="请输入密码" password />
        </view>
      </view>

      <view v-else class="form">
        <view class="form-item">
          <text class="label">手机号</text>
          <input
            v-model.trim="phone.mobile"
            class="input"
            placeholder="请输入手机号"
            confirm-type="next"
            type="number"
          />
        </view>
        <view class="form-item row">
          <view class="flex-1">
            <text class="label">验证码</text>
            <input v-model.trim="phone.captcha" class="input" placeholder="请输入验证码" type="number" />
          </view>
          <button class="captcha-btn" :disabled="smsCountdown > 0" @tap="getCaptcha">
            {{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
          </button>
        </view>
      </view>

      <button class="primary" :loading="submitting" @tap="handleSubmit">登录</button>
    </view>
  </view>
</template>

<script>
import { buildAuthedWebUrl } from '../../common/config'
import { login, phoneLogin, requestSmsCaptcha } from '../../common/api'
import { getLastWebRoute, hasValidToken, rememberWebRoute, setLoginSession } from '../../common/auth'

export default {
  data () {
    return {
      activeTab: 'account',
      submitting: false,
      account: {
        username: '',
        password: ''
      },
      phone: {
        mobile: '',
        captcha: ''
      },
      smsCountdown: 0,
      smsTimer: null
    }
  },
  onShow () {
    if (hasValidToken()) {
      this.redirectAfterLogin()
    }
  },
  onUnload () {
    this.clearSmsTimer()
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
    validatePhone () {
      if (!this.phone.mobile) {
        this.showError('请输入手机号')
        return false
      }
      if (!/^1\d{10}$/.test(this.phone.mobile)) {
        this.showError('手机号格式不正确')
        return false
      }
      if (!this.phone.captcha) {
        this.showError('请输入验证码')
        return false
      }
      return true
    },
    async handleSubmit () {
      if (this.submitting) return
      this.submitting = true
      try {
        let res
        if (this.activeTab === 'account') {
          if (!this.validateAccount()) return
          res = await login({
            username: this.account.username,
            password: this.account.password
          })
        } else {
          if (!this.validatePhone()) return
          res = await phoneLogin({
            mobile: this.phone.mobile,
            captcha: this.phone.captcha
          })
        }
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
    async getCaptcha () {
      if (this.smsCountdown > 0) return
      if (!this.phone.mobile) {
        this.showError('请输入手机号')
        return
      }
      if (!/^1\d{10}$/.test(this.phone.mobile)) {
        this.showError('手机号格式不正确')
        return
      }
      try {
        await requestSmsCaptcha({
          mobile: this.phone.mobile,
          smsmode: '0'
        })
        this.smsCountdown = 60
        this.smsTimer = setInterval(() => {
          if (this.smsCountdown <= 1) {
            this.clearSmsTimer()
            return
          }
          this.smsCountdown -= 1
        }, 1000)
        uni.showToast({ title: '验证码已发送', icon: 'success', duration: 1500 })
      } catch (e) {
        this.showError(e.message || '验证码发送失败')
      }
    },
    clearSmsTimer () {
      if (this.smsTimer) {
        clearInterval(this.smsTimer)
        this.smsTimer = null
      }
      this.smsCountdown = 0
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
  background: linear-gradient(180deg, #e8f1ff 0%, #f7f9fc 60%);
  padding: 48rpx 32rpx;
}
.hero {
  margin-bottom: 32rpx;
}
.title {
  font-size: 40rpx;
  font-weight: 700;
  color: #0f172a;
}
.subtitle {
  color: #475569;
  font-size: 26rpx;
  margin-top: 8rpx;
}
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 16rpx 28rpx rgba(46, 135, 255, 0.14);
}
.tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  background: #f5f7fb;
  border-radius: 14rpx;
  margin-bottom: 20rpx;
}
.tab {
  text-align: center;
  padding: 18rpx 0;
  font-weight: 600;
  color: #475569;
}
.tab.active {
  background: #fff;
  color: #2e87ff;
  border-radius: 14rpx;
  box-shadow: 0 10rpx 20rpx rgba(46, 135, 255, 0.12);
}
.form-item {
  margin-bottom: 18rpx;
}
.label {
  display: block;
  font-size: 26rpx;
  color: #334155;
  margin-bottom: 8rpx;
}
.input {
  width: 100%;
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 18rpx 16rpx;
  font-size: 28rpx;
}
.row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.flex-1 {
  flex: 1;
}
.captcha-btn {
  min-width: 180rpx;
  background: #f1f5f9;
  color: #0f172a;
  border-radius: 12rpx;
  font-size: 26rpx;
}
.primary {
  margin-top: 12rpx;
  width: 100%;
  background: #2e87ff;
  color: #fff;
  border-radius: 14rpx;
  padding: 22rpx 0;
  font-size: 30rpx;
  font-weight: 700;
  box-shadow: 0 12rpx 24rpx rgba(46, 135, 255, 0.35);
}
</style>
