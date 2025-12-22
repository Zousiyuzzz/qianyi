<template>
  <scroll-view class="page" scroll-y>
    <view class="app-header">
      <view class="title">系统中心</view>
      <view class="subtitle">账号、安全、权限、异常页等系统能力与工具集合。</view>
    </view>

    <view class="section">
      <view class="section-title">账号与权限</view>
      <module-card
        title="登录 / 注册"
        desc="沿用 Web 登录、注册、改密等全套流程。"
        @click="openWeb('/user/login')"
      />
      <module-card
        title="系统管理"
        desc="角色、权限、菜单配置，保持一致的审核与授权体验。"
        @click="openWeb('/system')"
      />
      <module-card
        title="无权限引导"
        desc="提供 AI/工具页作为无权限的辅助入口。"
        @click="openWeb('/tools/nopermission/ai')"
      />
    </view>

    <view class="section">
      <view class="section-title">异常与帮助</view>
      <module-card
        title="异常页"
        desc="403/404/500 等页面，移动端保持一致的交互指引。"
        @click="openWeb('/exception/404')"
      />
    </view>
  </scroll-view>
</template>

<script>
import ModuleCard from '../../components/ModuleCard.vue'
import { openWebView } from '../../common/navigation'

export default {
  components: { ModuleCard },
  methods: {
    openWeb (path) {
      openWebView(path)
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
}
.section {
  padding: 24rpx 28rpx 12rpx;
}
</style>
