<template>
  <view class="page">
    <view class="app-header">
      <view class="title">执象云枢 CRM 投放系统</view>
      <view class="subtitle">移动端（uni-app，Vue2）—— 钉钉 & 阿里云风格</view>
      <view class="meta">H5地址：{{ baseUrl }}</view>
    </view>

    <view class="section">
      <view class="section-title">快捷入口</view>
      <view class="grid">
        <view class="grid-item" @click="openWeb('/dashboard/analysis')">
          <text class="iconfont icon-data"></text>
          <text class="name">分析报表</text>
        </view>
        <view class="grid-item" @click="openWeb('/customerManager/TabCustomermanageList')">
          <text class="iconfont icon-usergroup"></text>
          <text class="name">客户管理</text>
        </view>
        <view class="grid-item" @click="openWeb('/projectManager/TabProjectmanageList')">
          <text class="iconfont icon-workbench"></text>
          <text class="name">项目管理</text>
        </view>
        <view class="grid-item" @click="openWeb('/isystem/user')">
          <text class="iconfont icon-setting"></text>
          <text class="name">系统管理</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">功能全景</view>
      <view class="subtitle">所有功能通过内嵌 H5 打开，保持与现有 Web 版一致的流程与权限。</view>
      <module-card
        v-for="item in featured"
        :key="item.title"
        :title="item.title"
        :desc="item.desc"
        :gradient="item.gradient"
        :tag="item.tag"
        @click="openWeb(item.path)"
      />
    </view>

    <view class="section">
      <view class="section-title">原生接口示例</view>
      <view class="subtitle">封装 uni.request，提供登录、菜单、分页、审批/上传等与 Web 版一致的体验。</view>
      <module-card
        title="原生业务页"
        desc="查看 uni-app 版登录、菜单、长列表、表单与上传流程。"
        :gradient="THEME_GRADIENT"
        tag="示例"
        @click="openNativeDemo"
      />
    </view>
  </view>
</template>

<script>
import { MODULE_GROUPS, THEME_GRADIENT, buildWebUrl } from '../../common/config'
import ModuleCard from '../../components/ModuleCard.vue'
import { openWebView } from '../../common/navigation'

export default {
  components: { ModuleCard },
  data () {
    return {
      featured: [
        {
          title: '分析报表',
          desc: '移动端直达报表分析，实时追踪投放经营成效。',
          path: '/dashboard/analysis',
          gradient: THEME_GRADIENT,
          tag: '看板'
        },
        {
          title: '客户与回款',
          desc: '客户池海、回款与延期审批，表单与流程与 Web 完全一致。',
          path: '/customerManager/TabCustomermanageList',
          gradient: THEME_GRADIENT,
          tag: 'CRM'
        },
        {
          title: '资金与返利',
          desc: '账户、资金池、返利管理、报表等完整功能一键打开。',
          path: '/projectFundPool/TabProjectFundPoolList',
          gradient: THEME_GRADIENT,
          tag: '财务'
        }
      ]
    }
  },
  computed: {
    baseUrl () {
      return buildWebUrl('').replace(/\/#?$/, '')
    },
    moduleGroups () {
      return MODULE_GROUPS
    }
  },
  methods: {
    openWeb (path) {
      const url = buildWebUrl(path || '/')
      uni.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(url)}` })
    },
    openNativeDemo () {
      uni.navigateTo({ url: '/pages/native/index' })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
}
.title {
  font-size: 36rpx;
  font-weight: 700;
}
.meta {
  margin-top: 8rpx;
  font-size: 22rpx;
  opacity: 0.9;
}
.section {
  padding: 24rpx 28rpx;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  margin-top: 12rpx;
}
.grid-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 16rpx 10rpx;
  text-align: center;
  color: #0f172a;
  box-shadow: 0 12rpx 28rpx rgba(32, 82, 149, 0.12);
}
.iconfont {
  font-size: 42rpx;
  color: #2e87ff;
  display: block;
  margin-bottom: 8rpx;
}
.name {
  font-size: 24rpx;
}
</style>
