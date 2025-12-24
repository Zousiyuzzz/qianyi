<template>
  <view class="profile-page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar-wrapper">
        <image 
          v-if="userInfo.avatar" 
          :src="userInfo.avatar" 
          class="avatar"
          mode="aspectFill"
        />
        <view v-else class="avatar-placeholder">
          <text class="avatar-text">{{ avatarText }}</text>
        </view>
      </view>
      <view class="user-info">
        <view class="username">{{ userInfo.realname || userInfo.username || '未设置' }}</view>
        <view class="user-desc">{{ userInfo.username || '用户' }}</view>
      </view>
    </view>

    <!-- 个人信息列表 -->
    <view class="info-section">
      <view class="info-item">
        <text class="info-label">账号</text>
        <text class="info-value">{{ userInfo.username || '未设置' }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">姓名</text>
        <text class="info-value">{{ userInfo.realname || '未设置' }}</text>
      </view>
      <view v-if="userInfo.email" class="info-item">
        <text class="info-label">邮箱</text>
        <text class="info-value">{{ userInfo.email }}</text>
      </view>
      <view v-if="userInfo.phone" class="info-item">
        <text class="info-label">手机号</text>
        <text class="info-value">{{ userInfo.phone }}</text>
      </view>
      <view v-if="userInfo.orgCode" class="info-item">
        <text class="info-label">部门</text>
        <text class="info-value">{{ userInfo.orgCode }}</text>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-section">
      <button class="logout-button" :loading="loggingOut" @tap="handleLogout">
        退出登录
      </button>
    </view>
  </view>
</template>

<script>
import { getUserInfo, logout } from '../../common/api/user'
import { USER_INFO, clearLoginSession } from '../../common/auth'

export default {
  data() {
    return {
      userInfo: {},
      loggingOut: false
    }
  },
  computed: {
    avatarText() {
      const name = this.userInfo.realname || this.userInfo.username || '用'
      return name.length > 1 ? name.substring(name.length - 2) : name
    }
  },
  onShow() {
    this.loadUserInfo()
  },
  methods: {
    async loadUserInfo() {
      try {
        // 先从本地存储读取
        const localUserInfo = uni.getStorageSync(USER_INFO)
        if (localUserInfo) {
          this.userInfo = localUserInfo
        }

        // 再从服务器获取最新信息
        const res = await getUserInfo()
        if (res && (res.code === '200' || res.success)) {
          const userInfo = res.result || res.data || {}
          this.userInfo = userInfo
          // 更新本地存储
          uni.setStorageSync(USER_INFO, userInfo)
        }
      } catch (e) {
        console.error('获取用户信息失败:', e)
        // 如果获取失败，使用本地存储的信息
        const localUserInfo = uni.getStorageSync(USER_INFO)
        if (localUserInfo) {
          this.userInfo = localUserInfo
        }
      }
    },
    async handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: async (res) => {
          if (res.confirm) {
            this.loggingOut = true
            try {
              await logout()
              clearLoginSession()
              uni.reLaunch({
                url: '/pages/login/index'
              })
            } catch (e) {
              console.error('退出登录失败:', e)
              // 即使接口失败，也清除本地数据并跳转
              clearLoginSession()
              uni.reLaunch({
                url: '/pages/login/index'
              })
            } finally {
              this.loggingOut = false
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.user-card {
  background: linear-gradient(135deg, #2e87ff 0%, #1e6fd9 100%);
  padding: 80rpx 40rpx 60rpx;
  display: flex;
  align-items: center;
  color: #fff;
}

.avatar-wrapper {
  margin-right: 32rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.avatar-placeholder {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.avatar-text {
  font-size: 40rpx;
  color: #fff;
  font-weight: 600;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 40rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.user-desc {
  font-size: 28rpx;
  opacity: 0.9;
}

.info-section {
  background: #fff;
  margin: 24rpx 24rpx 0;
  border-radius: 24rpx;
  overflow: hidden;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.logout-section {
  margin: 60rpx 24rpx 0;
}

.logout-button {
  width: 100%;
  height: 96rpx;
  background: #fff;
  color: #ff4d4f;
  border-radius: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: 2rpx solid #ff4d4f;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-button::after {
  border: none;
}
</style>

