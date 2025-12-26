import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { convertToRGBA } from './colorUtils'

/**
 * 自动透明导航栏 composable
 * 使用 IntersectionObserver 监听占位元素，根据滚动位置动态调整导航栏透明度
 * @param {string} backgroundColor - 导航栏背景颜色
 * @returns {{r: number, g: number, b: number, a: import('vue').Ref<number>}} RGB 值和透明度
 */
export function useAutoTransparent(backgroundColor = '#fff') {
  // 将背景色转换为 RGB 值
  const { r, g, b } = convertToRGBA(backgroundColor)
  const a = ref(1) // 透明度通道，1 表示完全不透明，0 表示完全透明

  let observer = null

  onMounted(() => {
    const instance = getCurrentInstance()

    // 创建交叉观察器，设置 51 个观察阈值（0%, 2%, 4%...100%）
    observer = uni.createIntersectionObserver(
      instance?.proxy,
      { thresholds: Array.from({ length: 51 }, (_, i) => i / 50) }
    )

    // 相对于视口顶部进行观察
    observer
      .relativeToViewport({ top: 0 })
      .observe('._auto-transparent__observer-target', (res) => {
        const { intersectionRatio } = res
        // 处理临界值：真机环境下可能不会精确等于 0 或 1
        // >= 0.95 视为完全可见（透明）
        // <= 0.05 视为完全不可见（不透明）
        a.value = intersectionRatio >= 0.95
          ? 0
          : intersectionRatio <= 0.05
          ? 1
          : 1 - intersectionRatio
      })
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  return { r, g, b, a }
}

