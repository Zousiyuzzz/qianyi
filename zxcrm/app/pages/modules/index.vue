<template>
  <scroll-view class="page" scroll-y>
    <view class="app-header">
      <view class="title">功能导航</view>
      <view class="subtitle">保持 Web 版所有模块，移动端通过 WebView 全量承载。</view>
    </view>

    <view class="section" v-for="group in moduleGroups" :key="group.key">
      <view class="section-title">{{ group.title }}</view>
      <view class="subtitle">{{ group.description }}</view>
      <module-card
        v-for="mod in group.modules"
        :key="mod.title"
        :title="mod.title"
        :desc="mod.desc"
        :tag="moduleTag(mod)"
        @click="openModule(mod)"
      />
    </view>
  </scroll-view>
</template>

<script>
import { MODULE_GROUPS } from '../../common/config'
import ModuleCard from '../../components/ModuleCard.vue'
import { openWebView } from '../../common/navigation'

export default {
  components: { ModuleCard },
  data () {
    return {
      moduleGroups: MODULE_GROUPS
    }
  },
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
