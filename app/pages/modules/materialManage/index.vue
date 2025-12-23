<template>
  <scroll-view class="page" scroll-y>
    <view class="banner gradient">
      <view class="title">素材管理与洞察</view>
      <view class="desc">移动端素材列表、裂变、风控及数据洞察，统一入口保持 PC 端路径一致。</view>
    </view>

    <view class="section">
      <view class="section-title">素材入口</view>
      <module-card
        v-for="item in materialModules"
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
import { openWebView } from '../../../common/navigation'

export default {
  components: { ModuleCard },
  data () {
    return {
      materialModules: [
        { title: '数据洞察', path: '/materialManage/dataCheck', desc: '数据洞察与趋势分析。', tag: 'H5' },
        { title: '素材列表', path: '/materialManage/index', desc: '素材库、标签与审核状态。', tag: 'H5' },
        { title: '素材裂变', path: '/materialManage/copy', desc: '裂变工具与批量生成。', tag: 'H5' },
        { title: '素材风控', path: '/materialManage/douyinViolationScoreRecord', desc: '违规扣分与风控看板。', tag: 'H5' }
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
