<template>
  <scroll-view class="page" scroll-y>
    <view class="banner gradient">
      <view class="title">客户与回款</view>
      <view class="desc">适配移动端的客户池海、回款登记与延期审批入口，保持原有权限与路由层级。</view>
    </view>

    <view class="section">
      <view class="section-title">客户与回款</view>
      <module-card
        v-for="item in modules"
        :key="item.title"
        :title="item.title"
        :desc="item.desc"
        :tag="item.tag"
        @click="openWeb(item.path)"
      />
    </view>
  </scroll-view>
</template>

<script>
import ModuleCard from '../../../components/ModuleCard.vue'
import { buildWebUrl } from '../../../common/config'

export default {
  components: { ModuleCard },
  data () {
    return {
      modules: [
        { title: '客户池海', path: '/customerManager/TabCustomermanageList', desc: '客户主数据、跟进与分配。', tag: 'H5' },
        { title: '客户回款', path: '/customerManager/BackmoneyList', desc: '回款登记、核销与审批流。', tag: 'H5' },
        { title: '回款延期', path: '/customerManager/delay', desc: '延期申请与审批记录。', tag: 'H5' }
      ]
    }
  },
  methods: {
    openWeb (path) {
      const url = buildWebUrl(path)
      uni.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(url)}` })
    }
  }
}
</script>

<style scoped>
@import url('../styles.module.css');
</style>
