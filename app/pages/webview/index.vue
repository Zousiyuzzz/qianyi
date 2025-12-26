<template>
  <view class="page" :style="{ paddingTop: navbarHeight + 'px' }">
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">{{ title }}</view>
        <view class="navbar-right"></view>
      </view>
    </view>
    <web-view :src="decodedUrl" @message="handleMessage"></web-view>
  </view>
</template>

<script>
import navbarMixin from '../mixins/navbarMixin'

export default {
  mixins: [navbarMixin],
  data() {
    return {
      url: '',
      title: 'H5 功能',
      canGoBack: false
    }
  },
  computed: {
    decodedUrl() {
      if (!this.url) return ''
      try {
        // 尝试解码，如果已经是解码后的URL，decodeURIComponent会抛出错误
        let decoded = decodeURIComponent(this.url)
        // 如果解码后还包含编码字符，说明被编码了多次，继续解码
        while (decoded.includes('%')) {
          const prev = decoded
          try {
            decoded = decodeURIComponent(decoded)
            // 如果解码后没有变化，说明已经解码完成
            if (decoded === prev) break
          } catch (e) {
            // 解码失败，说明已经解码完成
            break
          }
        }
        return decoded
      } catch (e) {
        // 解码失败，直接使用原始URL
        return this.url
      }
    }
  },
  onLoad(query) {
    this.url = query.url || ''
    this.title = query.title || 'H5 功能'

    // 如果URL为空，直接返回
    if (!this.url) {
      console.warn('webview URL为空，返回上一页')
      setTimeout(() => {
        this.handleBack()
      }, 100)
      return
    }

    // 检查解码后的URL是否有效
    if (!this.decodedUrl || !this.decodedUrl.startsWith('http')) {
      console.warn('webview URL无效:', this.decodedUrl)
      uni.showToast({
        title: '页面地址无效',
        icon: 'none'
      })
      setTimeout(() => {
        this.handleBack()
      }, 1500)
      return
    }

    // 检查是否可以返回
    const pages = getCurrentPages()
    this.canGoBack = pages.length > 1
  },
  onBackPress() {
    // 拦截返回按钮
    this.handleBack()
    return true
  },
  methods: {
    handleBack() {
      const pages = getCurrentPages()
      // 如果页面栈长度大于1，说明有上一页，直接返回
      if (pages.length > 1) {
        uni.navigateBack({
          delta: 1,
          fail: () => {
            // 如果返回失败，尝试跳转到功能页（tabbar页面）
            uni.switchTab({
              url: '/pages/modules/index'
            })
          }
        })
      } else {
        // 没有上一页，返回到功能页（tabbar页面）
        uni.switchTab({
          url: '/pages/modules/index'
        })
      }
    },
    handleMessage(e) {
      // 处理webview发送的消息
      console.log('webview message:', e)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../common/styles/ios-common.scss';
</style>
