<template>
  <scroll-view class="page" scroll-y>
    <view class="banner gradient">
      <view class="title">项目与资金池</view>
      <view class="desc">面向移动端的项目、资金池与机器人配置入口，与 Web 版保持同层级访问控制。</view>
    </view>

    <view class="section">
      <view class="section-title">项目管理</view>
      <module-card
        v-for="item in projectModules"
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
      projectModules: [
        { title: '项目管理', path: '/projectManager/TabProjectmanageList', desc: '项目立项、进展与协作。', tag: 'H5' },
        { title: '项目资金池', path: '/projectFundPool/TabProjectFundPoolList', desc: '资金池余额、分配与权限。', tag: 'H5' },
        { title: '资金变动明细', path: '/projectFundPool/TabProjectFundPoolChangeLogList', desc: '资金流水与审核轨迹。', tag: 'H5' },
        { title: '返点政策模板', path: '/customerManager/CustomerRetabeTemplate', desc: '政策模板维护与复用。', tag: 'H5' },
        { title: '微信机器人配置', path: '/projectManager/wechatConfig', desc: '通知机器人配置。', tag: 'H5' }
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
