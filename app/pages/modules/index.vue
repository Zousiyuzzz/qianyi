<template>
  <scroll-view class="page" scroll-y>
    <view class="app-header">
      <view class="title">功能导航</view>
      <view class="subtitle">实时读取后台菜单，排除系统设置/在线开发/系统监控，其余一键 H5 打开。</view>
      <view class="meta">当前模式：{{ fallbackUsed ? '内置菜单（接口失败）' : '接口菜单（实时）' }}</view>
    </view>

    <view class="status" v-if="loading">
      <text class="iconfont icon-loading rotate"></text>
      <text class="status-text">正在同步功能列表，请稍候…</text>
    </view>
    <view class="status error" v-else-if="loadError">
      <text class="status-text">加载菜单失败：{{ loadError }}</text>
      <button class="primary" size="mini" @click="loadFromApi">重试</button>
      <view class="hint">已自动使用内置菜单，功能不缺失但不含实时权限。</view>
    </view>

    <view class="section" v-for="group in moduleGroups" :key="group.key">
      <view class="section-title">{{ group.title }}</view>
      <view class="subtitle">{{ groupDescription(group) }}</view>
      <module-card
        v-for="mod in group.modules"
        :key="mod.title"
        :title="mod.title"
        :desc="mod.desc || '点击进入 H5 页面'"
        :tag="moduleTag(mod)"
        @click="openModule(mod)"
      />
    </view>

    <view v-if="!moduleGroups.length && !loading" class="status empty">
      <text class="status-text">暂无可用菜单，请检查账号权限或稍后重试。</text>
      <button class="primary" size="mini" @click="loadFromApi">重新加载</button>
    </view>
  </scroll-view>
</template>

<script>
import { MODULE_GROUPS } from '../../common/config'
import ModuleCard from '../../components/ModuleCard.vue'
import { openWebView } from '../../common/navigation'
import { queryPermissionsByUser } from '../../common/api/system'

export default {
  components: { ModuleCard },
  data () {
    return {
      moduleGroups: [],
      loading: false,
      loadError: '',
      fallbackUsed: false
    }
  },
  onShow () {
    this.loadFromApi()
  },
  onPullDownRefresh () {
    this.loadFromApi().finally(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    async loadFromApi () {
      this.loading = true
      this.loadError = ''
      try {
        const res = await queryPermissionsByUser()
        const menus = res?.result?.menu || res?.result || []
        const groups = this.normalizeMenuGroups(menus)
        if (!groups.length) {
          throw new Error('后端未返回可用菜单')
        }
        this.moduleGroups = groups
        this.fallbackUsed = false
      } catch (e) {
        this.moduleGroups = MODULE_GROUPS
        this.fallbackUsed = true
        this.loadError = e?.message || '接口异常'
      } finally {
        this.loading = false
      }
    },
    normalizeMenuGroups (menus = []) {
      const excludedPaths = ['/isystem', '/online', '/dashboard3']
      const excludedTitles = ['系统管理', '在线开发', '系统监控', '系统设置', '在线开放']
      const ensurePath = (path) => {
        if (!path) return ''
        return path.startsWith('/') ? path : `/${path}`
      }

      const groupMap = new Map()
      const order = []

      const visit = (nodes = [], root) => {
        nodes.forEach(node => {
          if (!node) return
          const path = ensurePath(node.path)
          const title = node.meta?.title || node.title || node.name || path || '未命名'
          if (excludedPaths.includes(path) || excludedTitles.includes(title)) {
            return
          }
          const nextRoot = root || { path, title, meta: node.meta }
          const hasChildren = Array.isArray(node.children) && node.children.length
          if (hasChildren) {
            visit(node.children, nextRoot)
            return
          }

          const key = nextRoot.path || nextRoot.title
          if (!groupMap.has(key)) {
            groupMap.set(key, {
              key,
              title: nextRoot.title,
              description: nextRoot.meta?.title ? `${nextRoot.meta.title} 下的功能` : '后端菜单',
              modules: [],
              order: order.length
            })
            order.push(key)
          }

          const desc = node.meta?.componentName || node.meta?.title || '点击进入'
          const tag = node.meta?.hideMenu ? '隐藏' : 'H5'
          groupMap.get(key).modules.push({ title, path: path || nextRoot.path, desc, tag })
        })
      }

      visit(menus, null)

      return order
        .map(key => groupMap.get(key))
        .filter(group => group && group.modules && group.modules.length)
    },
    openModule (mod) {
      if (!mod || !mod.path) return
      openWebView(mod.path, mod.title || 'H5 功能')
    },
    moduleTag (mod) {
      return mod.tag || (this.fallbackUsed ? '内置' : 'H5')
    },
    groupDescription (group) {
      if (group.description) return group.description
      return `共 ${group.modules?.length || 0} 个功能`
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
}
.meta {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #6b7280;
}
.section {
  padding: 24rpx 28rpx 12rpx;
}
.status {
  padding: 24rpx 28rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #0f172a;
}
.status.error {
  color: #b42318;
  flex-direction: column;
  align-items: flex-start;
}
.status.empty {
  flex-direction: column;
  align-items: flex-start;
}
.status-text {
  font-size: 26rpx;
}
.hint {
  font-size: 22rpx;
  color: #6b7280;
  margin-top: 6rpx;
}
.primary {
  margin-top: 8rpx;
  background: linear-gradient(135deg, #2e87ff 0%, #4ca1ff 40%, #7ecbff 100%);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 0 20rpx;
  height: 64rpx;
  line-height: 64rpx;
  font-size: 26rpx;
}
.rotate {
  animation: spin 1.2s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0); }
  to { transform: rotate(360deg); }
}
</style>
