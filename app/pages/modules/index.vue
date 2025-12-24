<template>
  <scroll-view class="page" scroll-y>
    <view class="app-header">
      <view class="title">功能导航</view>
    </view>

    <view class="section" v-for="group in moduleGroups" :key="group.key">
      <view class="section-title">{{ group.title }}</view>
      <view class="module-grid">
        <view class="module-item" v-for="mod in group.modules" :key="mod.title" @click="openModule(mod)">
          <view class="module-icon">{{ getModuleIcon(mod) }}</view>
          <text class="module-name">{{ mod.title }}</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script>
import { MODULE_GROUPS } from '../../common/config'
import { openWebView } from '../../common/navigation'

export default {
  data() {
    return {
      moduleGroups: MODULE_GROUPS
    }
  },
  methods: {
    getModuleIcon(mod) {
      // 根据模块标题返回对应的图标
      const iconMap = {
        '分析报表': '📊',
        '汇总报表': '📈',
        '渠道报表': '📉',
        '销售报表': '💹',
        '利润菜单': '💰',
        '工作台': '🖥️',
        '客户池海': '👥',
        '客户回款': '💵',
        '回款延期': '⏰',
        '项目管理': '📋',
        '项目资金池': '🏦',
        '项目资金变动明细': '📝',
        '返点政策模板': '📄',
        '微信机器人配置': '🤖',
        '账户列表': '💳',
        '账户主体': '🏢',
        '共享钱包': '👛',
        '子端口': '🔌',
        '广告主ID复制': '📋',
        '账户绑定变动记录': '📜',
        '充退处理列表': '💸',
        '账户流水明细': '💱',
        '账户消耗明细': '📊',
        '客户到账': '✅',
        '客户退款': '↩️',
        '项目损失': '📉',
        '抬头管理': '📑',
        '数据洞察': '🔍',
        '素材列表': '🖼️',
        '素材裂变': '✨',
        '素材风控': '🛡️',
        '返点管理': '💎',
        '巨量引擎': '🚀',
        '磁力引擎': '🧲',
        '腾讯广告': '🐧',
        '成本导入': '📥',
        '利润报表': '💵',
        '渠道列表': '🌐',
        '平台应用管理': '⚙️',
        '代理商账户': '👔',
        '邮件发送记录': '📧',
        '更新日志': '📝',
        '消息管理': '💬',
        '消息模板': '📋',
        '我的消息': '🔔',
        '路由网关': '🌉',
        '定时任务': '⏲️',
        '日志管理': '📚',
        '数据日志': '📖',
        'Redis 监控': '🔴',
        'Tomcat 信息': '🐱',
        '服务器信息': '🖥️',
        'JVM 信息': '☕',
        '请求追踪': '🔍',
        '磁盘监控': '💾',
        'SQL 监控': '🗄️',
        '在线文档': '📘',
        '在线用户': '👤',
        'Online 表单开发': '📝',
        'Online 报表配置': '📊',
        '系统编码规则': '🔢',
        '系统校验规则': '✓',
        '多数据源管理': '🗃️',
        '用户管理': '👥',
        '角色管理': '🎭',
        '菜单管理': '📑',
        '部门管理': '🏢',
        '我的部门': '👨‍👩‍👧‍👦',
        '通讯录': '📇',
        '数据字典': '📚',
        '分类字典': '🗂️',
        '系统通告': '📢',
        '个人中心': '👤',
        '基本设置': '⚙️',
        '账户绑定': '🔗',
        '个性化设置': '🎨',
        '安全设置': '🔒',
        '新消息通知': '🔔'
      }
      return iconMap[mod.title] || '📦'
    },
    openModule(mod) {
      if (mod && mod.path) {
        openWebView(mod.path, mod.title)
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #fff;
}

.app-header {
  padding: 32rpx 28rpx;
  background: #fff;
  /* margin-bottom: 20rpx; */
}

.app-header .title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.section {
  padding: 24rpx 28rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 24rpx;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32rpx 20rpx;
}

.module-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.module-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(46, 135, 255, 0.1);
}

.module-name {
  font-size: 24rpx;
  color: #333;
  text-align: center;
  line-height: 1.4;
  word-break: break-all;
}
</style>
