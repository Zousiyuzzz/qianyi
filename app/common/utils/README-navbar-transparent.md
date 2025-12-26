# 导航栏滚动透明功能使用说明

参考 README.md 中的实现，提供了导航栏滚动时自动透明的功能。

## 功能说明

当页面滚动时，导航栏背景会从透明渐变到不透明，实现更流畅的视觉体验。

## 使用方法

### 方法一：使用 Mixin（推荐，适用于 Options API）

1. **在页面中引入 mixin**

```javascript
import navbarTransparentMixin from '../../common/utils/navbarTransparentMixin'

export default {
  mixins: [navbarTransparentMixin],
  data() {
    return {
      // 启用自动透明功能
      autoTransparent: true,
      // 可选：自定义导航栏背景颜色（默认 #fff）
      navbarBackgroundColor: '#fff'
    }
  }
}
```

2. **在模板中使用**

```vue
<template>
  <view class="page">
    <!-- 观察目标元素：放在导航栏之前，用于观察滚动位置 -->
    <view 
      class="_auto-transparent__observer-target" 
      :style="observerTargetStyle" 
    />
    
    <!-- 导航栏：添加 :style="navbarStyle" -->
    <view class="navbar" :style="navbarStyle">
      <view class="navbar-content">
        <view class="navbar-left"></view>
        <view class="navbar-title">页面标题</view>
        <view class="navbar-right"></view>
      </view>
    </view>
    
    <!-- 页面内容 -->
    <view class="content">
      <!-- ... -->
    </view>
  </view>
</template>
```

### 方法二：使用 Composition API（适用于 Vue 3）

1. **在 setup 中使用**

```javascript
import { useAutoTransparent } from '../../common/utils/useAutoTransparent'

export default {
  setup() {
    const backgroundColor = '#fff'
    const { r, g, b, a } = useAutoTransparent(backgroundColor)
    
    const navbarStyle = computed(() => ({
      backgroundColor: `rgba(${r}, ${g}, ${b}, ${a.value})`
    }))
    
    return {
      navbarStyle
    }
  }
}
```

2. **在模板中使用**

```vue
<template>
  <view class="page">
    <!-- 观察目标元素 -->
    <view 
      class="_auto-transparent__observer-target" 
      :style="{ height: '132rpx' }" 
    />
    
    <!-- 导航栏 -->
    <view class="navbar" :style="navbarStyle">
      <!-- ... -->
    </view>
  </view>
</template>
```

## 核心原理

1. **占位元素**：在页面顶部放置一个与导航栏等高的透明占位元素
2. **交叉观察**：使用 `IntersectionObserver` 监听占位元素与视口的交叉情况
3. **透明度计算**：根据交叉比例动态计算导航栏背景的透明度
4. **实时更新**：通过响应式数据驱动样式更新

## 技术细节

- **观察阈值**：设置 51 个阈值点（0%, 2%, 4%...100%），确保过渡平滑
- **临界值处理**：处理真机环境下交叉比例不精确的问题
  - `intersectionRatio >= 0.95` → 完全透明（a = 0）
  - `intersectionRatio <= 0.05` → 完全不透明（a = 1）
  - 其他情况 → 线性渐变（a = 1 - intersectionRatio）

## 注意事项

1. **观察目标元素**必须放在导航栏之前
2. **观察目标元素的高度**应该等于：状态栏高度 + 导航栏高度
3. 如果不需要滚动透明效果，设置 `autoTransparent: false` 或不使用 mixin
4. 导航栏使用 `position: sticky`，确保在滚动时固定在顶部

## 示例

完整示例请参考 `pages/home/index.vue`（如果已应用）

