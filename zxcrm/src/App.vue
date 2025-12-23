<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view />
    </div>
  </a-config-provider>
</template>
<script>
import enquireScreen from '@/utils/device'
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'

export default {
  data() {
    return {
      locale: zhCN,
    }
  },
  created() {
    let that = this
    enquireScreen(deviceType => {
      // console.log('设备检测变化:', deviceType)
      // tablet
      if (deviceType === 0) {
        that.$store.commit('TOGGLE_DEVICE', 'mobile')
        that.$store.dispatch('setSidebar', false)
        // console.log('切换到平板模式')
        that.handleDeviceChange('tablet')
      }
      // mobile
      else if (deviceType === 1) {
        that.$store.commit('TOGGLE_DEVICE', 'mobile')
        that.$store.dispatch('setSidebar', false)
        // console.log('切换到移动模式')
        that.handleDeviceChange('mobile')
      }
      else {
        that.$store.commit('TOGGLE_DEVICE', 'desktop')
        that.$store.dispatch('setSidebar', true)
        // console.log('切换到桌面模式')
        that.handleDeviceChange('desktop')
      }

    })

    // 添加全局方法，用于刷新菜单状态
    this.$forceRefreshMenuState = this.forceRefreshMenuState

    // 添加全局方法，用于处理设备切换
    this.$handleDeviceChange = this.handleDeviceChange
  },
  methods: {
    // 强制刷新菜单状态（全局方法）
    forceRefreshMenuState() {
      // 通过事件总线通知GlobalLayout组件刷新菜单状态
      this.$emit('refreshMenuState')
    },

    // 处理设备切换（全局方法）
    handleDeviceChange(deviceType) {
      // console.log('全局设备切换处理:', deviceType)
      // 通知所有组件设备已切换
      this.$root.$emit('deviceChanged', deviceType)

      // 延迟执行，确保store状态已更新
      this.$nextTick(() => {
        // 强制刷新菜单状态
        this.$root.$emit('refreshMenuState')
      })
    }
  }
}
</script>
<style>
#app {
  height: 100%;
}
</style>