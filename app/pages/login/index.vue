<template>
  <view class="login-page">
    <!-- Logo区域 -->
    <view class="logo-container">
      <view class="logo-text">游云迹</view>
    </view>

    <!-- 登录表单 -->
    <view class="form-container">
      <view class="input-wrapper">
        <input v-model.trim="account.username" class="input" placeholder="输入账号" placeholder-class="input-placeholder"
          confirm-type="next" />
      </view>
      <view class="input-wrapper">
        <input v-model.trim="account.password" class="input" placeholder="输入密码" placeholder-class="input-placeholder"
          password />
      </view>

      <button class="login-button" :loading="submitting" :disabled="submitting" @tap="handleSubmit">
        登录
      </button>

      <view class="agreement-wrapper">
        <checkbox-group @change="handleAgreementChange">
          <label class="agreement-label">
            <checkbox :checked="agreed" color="#2e87ff" />
            <text class="agreement-text">已阅读并同意服务协议</text>
          </label>
        </checkbox-group>
      </view>
    </view>

    <!-- 底部按钮区域 -->
    <view class="bottom-buttons">
      <!-- <view class="bottom-btn-item" @tap="handlePhoneLogin">
				<view class="bottom-btn-icon">📱</view>
				<text class="bottom-btn-text">手机号登录</text>
			</view>
			<view class="bottom-btn-item" @tap="handleOtherLogin">
				<view class="bottom-btn-icon">👤</view>
				<text class="bottom-btn-text">其他方式登录</text>
			</view>
			<view class="bottom-btn-item" @tap="handleRegister">
				<view class="bottom-btn-icon">➕</view>
				<text class="bottom-btn-text">注册</text>
			</view> -->
      <view class="bottom-btn-item" @tap="handleMore">
        <view class="bottom-btn-icon">⋯</view>
        <text class="bottom-btn-text">更多</text>
      </view>
    </view>
  </view>
</template>

<script>
import {
  buildAuthedWebUrl
} from '../../common/config'
import {
  login
} from '../../common/api'
import {
  getLastWebRoute,
  hasValidToken,
  rememberWebRoute,
  setLoginSession
} from '../../common/auth'

export default {
  data() {
    return {
      submitting: false,
      agreed: true,
      account: {
        username: 'admin',
        password: '123456'
      }
    }
  },
  onShow() {
    if (hasValidToken()) {
      this.redirectAfterLogin()
    }
  },
  methods: {
    handleAgreementChange(e) {
      this.agreed = e.detail.value.length > 0
    },
    showError(message) {
      uni.showToast({
        title: message || '请求失败',
        icon: 'none',
        duration: 2000
      })
    },
    validateAccount() {
      if (!this.account.username) {
        this.showError('请输入用户名')
        return false
      }
      if (!this.account.password) {
        this.showError('请输入密码')
        return false
      }
      if (!this.agreed) {
        this.showError('请先同意服务协议')
        return false
      }
      return true
    },
    async handleSubmit() {
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
          checkKey: new Date().getTime(),
          captcha: this.captcha || '', // 验证码，如果不需要可以为空
          remember_me: true // 记住登录状态
        })
        if (res && (res.code === '200' || res.success)) {
          const result = res.result || {}
          // 确保token、userInfo等字段正确传递
          const loginData = {
            token: result.token,
            userInfo: result.userInfo || {},
            tenantId: result.tenantId,
            tenantList: result.tenantList || []
          }
          // 先保存 token
          setLoginSession(loginData)
          // 验证 token 是否保存成功
          const savedToken = uni.getStorageSync('Access-Token')
          if (!savedToken) {
            console.error('[Login] Token save failed!')
            this.showError('登录失败：Token保存失败')
            return
          }
          console.log('[Login] Token saved successfully, length:', savedToken.length)
          // 延迟一下再跳转，确保存储完成
          setTimeout(() => {
            this.redirectAfterLogin()
          }, 100)
        } else {
          this.showError(res.message || '登录失败')
        }
      } catch (e) {
        this.showError(e.message || '请求失败，请稍后再试')
      } finally {
        this.submitting = false
      }
    },
    handlePhoneLogin() {
      // 暂时空着
    },
    handleOtherLogin() {
      // 暂时空着
    },
    handleRegister() {
      // 暂时空着
    },
    handleMore() {
      // 暂时空着
    },
    redirectAfterLogin() {
      // 登录后直接跳转到首页，不清除之前保存的路由（用于其他场景）
      uni.switchTab({
        url: '/pages/home/index'
      })
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #ffffff;
  padding: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  background: linear-gradient(180deg, rgba(168, 213, 255, 0.15) 0%, rgba(200, 179, 255, 0.1) 50%, transparent 100%);
  pointer-events: none;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 120rpx;
  padding-bottom: 80rpx;
  position: relative;
  z-index: 1;
}

.logo-text {
  font-size: 72rpx;
  font-weight: 700;
  background: linear-gradient(135deg, #5dade2 0%, #9b59b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 4rpx;
}

.form-container {
  flex: 1;
  padding: 0 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.input-wrapper {
  width: 100%;
  background: #ffffff;
  border-radius: 48rpx;
  margin-bottom: 32rpx;
  box-shadow: rgba(136, 165, 191, 0.25) 3px 1px 8px 0px, rgba(255, 255, 255, 0.6) -3px -1px 8px 0px;
  border: 1rpx solid #f0f0f0;
}

.input {
  width: 100%;
  height: 100rpx;
  padding: 0 32rpx;
  font-size: 32rpx;
  color: #333;
  background: transparent;
}

.input-placeholder {
  color: #999;
  font-size: 32rpx;
}

.login-button {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #2e87ff 0%, #1e6fd9 100%);
  color: #fff;
  border-radius: 24rpx;
  font-size: 36rpx;
  font-weight: 600;
  margin-top: 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(46, 135, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.login-button::after {
  border: none;
}

.agreement-wrapper {
  width: 100%;
  margin-top: 64rpx;
  display: flex;
  justify-content: center;
}

.agreement-label {
  display: flex;
  align-items: center;
  font-size: 24rpx;
}

.agreement-text {
  color: #666;
  margin-left: 12rpx;
  font-size: 24rpx;
}

.bottom-buttons {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 60rpx 40rpx 80rpx;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.bottom-btn-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.bottom-btn-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-bottom: 16rpx;
}

.bottom-btn-text {
  font-size: 22rpx;
  color: #666;
  font-weight: 500;
}
</style>