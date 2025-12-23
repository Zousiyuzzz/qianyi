<template>
  <scroll-view class="page" scroll-y>
    <view class="banner gradient">
      <view class="title">财务报表与返利</view>
      <view class="desc">针对巨量、磁力、腾讯等返利及核算场景的移动端聚合入口，逐步替换 WebView 访问。</view>
    </view>

    <view class="section">
      <view class="section-title">媒体返利</view>
      <module-card
        v-for="item in rebateModules"
        :key="item.title"
        :title="item.title"
        :desc="item.desc"
        :tag="item.tag"
        @click="openWeb(item.path)"
      />
      <view class="tip">保持 Web 权限校验与路由层级，适配移动端卡片式入口。</view>
    </view>
  </scroll-view>
</template>

<script>
import ModuleCard from '../../../components/ModuleCard.vue'
import { openWebView } from '../../../common/navigation'

export default {
  components: { ModuleCard },
  data () {
    return {
      rebateModules: [
        { title: '返点管理', path: '/mediaRebate/index', desc: '媒体返点总览。', tag: 'H5' },
        { title: '巨量引擎 - 返点结算', path: '/mediaRebate/DY/fandian/index', desc: '巨量返点结算。', tag: 'H5' },
        { title: '巨量引擎 - 对账核算', path: '/mediaRebate/DY/duizhang/index', desc: '巨量对账与核算。', tag: 'H5' },
        { title: '巨量引擎 - 业绩明细', path: '/mediaRebate/DY/performanceDetail/index', desc: '业绩明细查询。', tag: 'H5' },
        { title: '巨量引擎 - 违规明细', path: '/mediaRebate/DY/violationDetail/index', desc: '违规明细追踪。', tag: 'H5' },
        { title: '巨量引擎 - 核算明细', path: '/mediaRebate/DY/calcDetail/index', desc: '核算明细查看。', tag: 'H5' },
        { title: '磁力引擎', path: '/CL/index', desc: '磁力引擎返点管理。', tag: 'H5' },
        { title: '腾讯广告', path: '/TX/index', desc: '腾讯广告返点管理。', tag: 'H5' }
      ]
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
@import url('../styles.module.css');
</style>
