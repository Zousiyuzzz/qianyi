<template>
  <scroll-view class="page" scroll-y>
    <view class="app-header">
      <view class="title">资金与返利</view>
      <view class="subtitle">账户、调拨、返利模板全链路移动化，保持 Web 版能力。</view>
    </view>

    <view class="section">
      <view class="section-title">资金流转</view>
      <module-card
        title="资金账户"
        desc="账户余额、冻结明细、自动归集等完整视图。"
        @click="openWeb('/accountids')"
      />
      <module-card
        title="充值与回款"
        desc="充值申请、回款登记、对账与审核流程。"
        @click="openWeb('/consume')"
      />
      <module-card
        title="资金调拨记录"
        desc="账户间划拨、审批流与凭证查阅。"
        @click="openWeb('/fundTransferRecord')"
      />
    </view>

    <view class="section">
      <view class="section-title">返利管理</view>
      <module-card
        title="返利管理"
        desc="媒体返利、模板返利及策略复用。"
        @click="openWeb('/rebateManage')"
      />
      <module-card
        title="返利模板"
        desc="模板化返利策略，支持移动端新增与编辑。"
        @click="openWeb('/templateRebate')"
      />
      <module-card
        title="资金池"
        desc="项目资金池余额监控与分配。"
        @click="openWeb('/projectFundPool')"
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
