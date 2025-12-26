import { convertToRGBA } from './colorUtils'

/**
 * 导航栏滚动透明 Mixin
 * 用于 Options API，在页面中混入此 mixin 即可使用
 * 
 * 使用方法：
 * 1. 在页面中引入：import navbarTransparentMixin from '@/common/utils/navbarTransparentMixin'
 * 2. 在组件中添加：mixins: [navbarTransparentMixin]
 * 3. 在 data 中设置：autoTransparent: true（可选，默认 false）
 * 4. 在模板中给导航栏添加 :style="navbarStyle"
 * 5. 在模板中添加观察目标元素：<view class="_auto-transparent__observer-target" :style="observerTargetStyle" />
 */
export default {
  data() {
    return {
      // 是否启用自动透明
      autoTransparent: false,
      // 导航栏背景颜色
      navbarBackgroundColor: '#fff',
      // 透明度值
      navbarOpacity: 1
    }
  },
  computed: {
    // 导航栏样式
    navbarStyle() {
      if (!this.autoTransparent) {
        return {
          backgroundColor: this.navbarBackgroundColor
        }
      }
      const { r, g, b } = convertToRGBA(this.navbarBackgroundColor)
      return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, ${this.navbarOpacity})`
      }
    },
    // 观察目标元素样式
    observerTargetStyle() {
      // 获取系统信息
      const systemInfo = uni.getSystemInfoSync()
      const statusBarHeight = systemInfo.statusBarHeight || 0
      const navbarHeight = 88 // rpx 转 px，约 44px，但这里用 rpx 值
      // 注意：uniapp 中 rpx 会自动转换，这里需要根据实际情况调整
      // 如果使用 px，需要转换：88rpx ≈ 44px（在 750rpx 设计稿下）
      return {
        height: `${statusBarHeight + 44}px` // 状态栏高度 + 导航栏高度
      }
    }
  },
  mounted() {
    if (this.autoTransparent) {
      this.initTransparentObserver()
    }
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  },
  methods: {
    initTransparentObserver() {
      // 创建交叉观察器，设置 51 个观察阈值
      this.observer = uni.createIntersectionObserver(
        this,
        { thresholds: Array.from({ length: 51 }, (_, i) => i / 50) }
      )

      // 相对于视口顶部进行观察
      this.observer
        .relativeToViewport({ top: 0 })
        .observe('._auto-transparent__observer-target', (res) => {
          const { intersectionRatio } = res
          // 处理临界值
          this.navbarOpacity = intersectionRatio >= 0.95
            ? 0
            : intersectionRatio <= 0.05
            ? 1
            : 1 - intersectionRatio
        })
    }
  }
}

