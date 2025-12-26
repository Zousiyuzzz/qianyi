// navbarMixin.js - 统一处理导航栏状态栏高度
export default {
  data() {
    return {
      statusBarHeight: 0, // 状态栏高度
      navbarHeight: 44 // 导航栏总高度（44为导航栏内容高度）
    }
  },
  onLoad() {
    // 获取系统信息，计算状态栏高度
    this.getSystemInfo()
  },
  methods: {
    // 获取系统信息，计算状态栏高度
    getSystemInfo() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
      // 计算总导航栏高度 = 状态栏高度 + 导航栏内容高度
      this.navbarHeight = this.statusBarHeight + 44
    }
  }
}