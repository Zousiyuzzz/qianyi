<template>
  <scroll-view class="page" scroll-y>
    <view class="banner gradient">
      <view class="title">资金管理</view>
      <view class="desc">将到账、退款、项目损失与抬头管理入口移动端化，表单逻辑沿用现有 Web 配置。</view>
    </view>

    <view class="section">
      <view class="section-title">资金与损益</view>
      <module-card
        v-for="item in moneyModules"
        :key="item.title"
        :title="item.title"
        :desc="item.desc"
        :tag="item.tag"
        @click="openWeb(item.path)"
      />
      <view class="tip">当前版本复用 H5 表单，后续可按需替换为原生组件。</view>
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
      moneyModules: [
        { title: '客户到账', path: '/moneyManager/Preparation', desc: '到账登记、核销与审批。', tag: 'H5' },
        { title: '客户退款', path: '/moneyManager/Refund', desc: '退款流程与凭证上传。', tag: 'H5' },
        { title: '项目损失', path: '/projectLossRecord/index', desc: '项目损益记录与核算。', tag: 'H5' },
        { title: '抬头管理', path: '/Manager/bankAccount', desc: '抬头、账户与开票信息维护。', tag: 'H5' }
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
