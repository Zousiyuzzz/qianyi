<template>
  <a-layout class="layout" :class="[device]">
    <!-- 调试信息 -->
    <!-- <div
      style="position: fixed; top: 0; left: 0; background: white; z-index: 9999; padding: 10px; border: 1px solid red;">
      <div>selectedParentMenu: {{ selectedParentMenu ? '存在' : 'null' }}</div>
      <div>selectedParentMenu.children: {{ selectedParentMenu && selectedParentMenu.children ? '存在' : 'null' }}</div>
      <div>children.length: {{ selectedParentMenu && selectedParentMenu.children ? selectedParentMenu.children.length :
        0 }}</div>
      <div>layoutMode: {{ layoutMode }}</div>
      <div>collapsed: {{ collapsed }}</div>
    </div> -->

    <!-- 左侧边栏 - 只在有子菜单时显示 -->

    <a-layout-sider v-if="shouldShowLeftMenu && device != 'mobile'" :class="['sider', navTheme]" :trigger="null"
      :collapsible="true" :collapsed="collapsed" :width="200"
      :style="{ position: 'fixed', height: 'calc(100vh - 59px)', zIndex: 10, top: '59px', left: 0 }">
      <!-- 左侧菜单 - 只显示当前选中菜单的子菜单 -->
      <div v-if="!collapsed" class="sub-menu-only">
        <current-sub-menu :parent-menu="selectedParentMenu" :theme="navTheme" @subMenuSelect="onSubMenuSelect"
          @clearSelection="clearParentMenu" />
      </div>

    </a-layout-sider>

    <!-- 移动端抽屉菜单 -->
    <a-drawer v-if="device === 'mobile'" :wrapClassName="'drawer-sider ' + navTheme" placement="left"
      @close="() => this.collapsed = false" :closable="false" :visible="collapsed" width="200px">
      <s-menu :menu="menus" :theme="navTheme" :collapsed="false" mode="inline" @select="onMenuSelect"
        @updateMenuTitle="handleUpdateMenuTitle" />
    </a-drawer>

    <!-- 固定Header -->
    <div class="fixed-header">
      <global-header :mode="layoutMode" :menus="menus" :theme="navTheme" :collapsed="collapsed" :device="device"
        @toggle="toggle" @updateMenuTitle="handleUpdateMenuTitle" @topMenuSelect="onTopMenuSelect" />
    </div>

    <a-layout :class="[layoutMode, `content-width-${contentWidth}`]" :style="{
      marginLeft: '0', // header 始终占满全宽
      transition: 'none', // 移除过渡动画，避免跳动
      marginTop: '59px' // 为固定Header留出空间
    }">
      <!-- layout content - 内容区域在有左侧菜单时右移 -->
      <a-layout-content :style="{
        height: '100%',
        paddingTop: '0',
        marginLeft: shouldShowLeftMenu && device != 'mobile' ? (collapsed ? '80px' : '200px') : '0',
        transition: 'margin-left 0.2s'
      }">
        <slot></slot>
      </a-layout-content>

      <!-- layout footer -->
      <a-layout-footer style="padding: 0px">
        <global-footer />
      </a-layout-footer>
    </a-layout>
    <!-- {{ menus }} -->
  </a-layout>
</template>

<script>
import SideMenu from '@/components/menu/SideMenu'
import GlobalHeader from '@/components/page/GlobalHeader'
import GlobalFooter from '@/components/page/GlobalFooter'
import SMenu from '@/components/menu/'
import CurrentSubMenu from '@/components/menu/CurrentSubMenu'
import { triggerWindowResizeEvent } from '@/utils/util'
import { mapActions, mapState } from 'vuex'
import { mixin, mixinDevice } from '@/utils/mixin.js'

export default {
  name: 'GlobalLayout',
  components: {
    SideMenu,
    GlobalHeader,
    GlobalFooter,
    SMenu,
    CurrentSubMenu,
  },
  mixins: [mixin, mixinDevice],
  data() {
    return {
      collapsed: false,
      activeMenu: {},
      menus: [],
      selectedParentMenu: null // 当前选中的父菜单
    }
  },
  computed: {
    ...mapState({
      // 主路由
      mainRouters: state => state.permission.addRouters,
      // 后台菜单
      permissionMenuList: state => state.user.permissionList
    }),
    // 检查左侧菜单是否应该显示
    shouldShowLeftMenu() {
      const condition = this.layoutMode === 'sidemenu' &&
        this.selectedParentMenu &&
        this.selectedParentMenu.children &&
        this.selectedParentMenu.children.length > 0

      // 只在调试时输出关键信息
      if (!condition) {
        // // console.log('侧边菜单不显示原因:', {
        //   layoutMode: this.layoutMode,
        //   hasSelectedParentMenu: !!this.selectedParentMenu,
        //   hasChildren: this.selectedParentMenu && !!this.selectedParentMenu.children,
        //   childrenLength: this.selectedParentMenu && this.selectedParentMenu.children ? this.selectedParentMenu.children.length : 0
        // })
      }

      return condition
    }
  },
  watch: {
    sidebarOpened(val) {
      this.collapsed = !val
      // // console.log('sidebarOpened变化:', val, 'collapsed:', this.collapsed)
    },
    selectedParentMenu: {
      handler(newVal, oldVal) {
        // 菜单状态变化处理
      },
      deep: true,
      immediate: true
    },
    // 添加设备变化监听
    device: {
      handler(newDevice, oldDevice) {
        // // console.log('设备变化:', oldDevice, '->', newDevice)
        // 设备变化时，确保菜单状态正确
        this.$nextTick(() => {
          // 同步菜单状态
          this.syncMenuState()
          // 强制刷新菜单状态
          this.forceRefreshMenuState()
        })
      },
      immediate: true
    }
  },
  created() {
    this.menus = this.permissionMenuList
    this.collapsed = !this.sidebarOpened;

    // 根据设备类型初始化菜单状态
    if (this.device === 'mobile') {
      this.collapsed = !this.sidebarOpened
      // // console.log('移动端初始化 - collapsed:', this.collapsed, 'sidebarOpened:', this.sidebarOpened)
    } else {
      this.collapsed = !this.sidebarOpened
      // // console.log('PC端初始化 - collapsed:', this.collapsed, 'sidebarOpened:', this.sidebarOpened)
    }

    // 自动恢复左侧菜单
    this.restoreSelectedParentMenu()

    // 确保菜单数据变化时也刷新状态
    this.$watch('permissionMenuList', (newMenus) => {
      this.menus = newMenus
      this.refreshMenuStateByCurrentRoute()
    }, { immediate: true })
  },
  mounted() {
    // 监听路由变化，自动更新菜单状态
    this.$watch('$route', this.handleRouteChange, { immediate: true })

    // 监听浏览器前进后退事件
    window.addEventListener('popstate', this.handlePopState)

    // 监听全局菜单刷新事件
    this.$root.$on('refreshMenuState', this.forceRefreshMenuState)

    // 监听设备切换事件
    this.$root.$on('deviceChanged', this.handleDeviceChanged)

    // 延迟检查设备状态，确保初始化正确
    this.$nextTick(() => {
      setTimeout(() => {
        this.forceRefreshDeviceState()
        // 再次同步菜单状态
        this.syncMenuState()
      }, 100)
    })
  },
  beforeDestroy() {
    // 清理事件监听器
    window.removeEventListener('popstate', this.handlePopState)

    // 清理全局事件监听器
    this.$root.$off('refreshMenuState', this.forceRefreshMenuState)
    this.$root.$off('deviceChanged', this.handleDeviceChanged)
  },
  methods: {
    ...mapActions(['setSidebar']),
    restoreSelectedParentMenu() {
      // 首先尝试恢复保存的菜单状态
      this.restoreMenuState()

      // 如果没有保存的状态，根据当前路由查找
      if (!this.selectedParentMenu) {
        const currentPath = this.$route.path
        // 遍历所有一级菜单，查找包含当前路由的父菜单
        for (let menu of this.menus) {
          if (menu.children && menu.children.length > 0) {
            const found = this.findMenuByPathRecursive(menu.children, currentPath)
            if (found) {
              this.selectedParentMenu = menu
              break
            }
          }
        }
      }

      // 确保根据当前路由刷新菜单状态
      this.refreshMenuStateByCurrentRoute()
    },

    // 处理路由变化
    handleRouteChange(newRoute) {
      // 根据新路由直接更新选中的父菜单
      this.updateSelectedParentMenuByRoute(newRoute.path)
    },



    // 处理浏览器前进后退事件
    handlePopState() {
      // 浏览器前进后退时，直接刷新菜单状态
      this.refreshMenuStateByCurrentRoute()
    },

    // 根据当前路由刷新菜单状态
    refreshMenuStateByCurrentRoute() {
      const currentPath = this.$route.path
      this.updateSelectedParentMenuByRoute(currentPath)
    },

    // 强制刷新菜单状态（供外部调用）
    forceRefreshMenuState() {
      // // console.log('强制刷新菜单状态 - 当前设备:', this.device, 'collapsed:', this.collapsed, 'sidebarOpened:', this.sidebarOpened)
      this.refreshMenuStateByCurrentRoute()

      // 确保设备状态同步
      this.$nextTick(() => {
        if (this.device === 'mobile') {
          this.collapsed = !this.sidebarOpened
        } else {
          this.collapsed = !this.sidebarOpened
        }
      })
    },

    // 强制刷新设备状态
    forceRefreshDeviceState() {
      // 重新检查设备状态并更新
      if (this.device === 'mobile') {
        this.collapsed = !this.sidebarOpened
        // // console.log('强制刷新移动端状态 - collapsed:', this.collapsed)
      } else {
        this.collapsed = !this.sidebarOpened
        // // console.log('强制刷新PC端状态 - collapsed:', this.collapsed)
      }
      // 强制刷新菜单状态
      this.forceRefreshMenuState()
    },

    // 同步菜单状态
    syncMenuState() {
      // 确保collapsed状态与sidebarOpened同步
      if (this.collapsed !== !this.sidebarOpened) {
        this.collapsed = !this.sidebarOpened
        // // console.log('同步菜单状态 - collapsed:', this.collapsed, 'sidebarOpened:', this.sidebarOpened)
      }
    },

    // 处理设备切换事件
    handleDeviceChanged(deviceType) {
      // // console.log('GlobalLayout收到设备切换事件:', deviceType)
      // 延迟执行，确保store状态已更新
      this.$nextTick(() => {
        if (this.device === 'mobile') {
          this.collapsed = !this.sidebarOpened
          // // console.log('设备切换到移动端 - 更新collapsed:', this.collapsed)
        } else {
          this.collapsed = !this.sidebarOpened
          // // console.log('设备切换到PC端 - 更新collapsed:', this.collapsed)
        }
        // 强制刷新菜单状态
        this.forceRefreshMenuState()
      })
    },

    // 根据路由更新选中的父菜单
    updateSelectedParentMenuByRoute(path) {
      for (let menu of this.menus) {
        if (menu.children && menu.children.length > 0) {
          const found = this.findMenuByPathRecursive(menu.children, path)
          if (found) {
            this.selectedParentMenu = menu
            // 保存菜单状态到localStorage
            this.saveMenuState(menu)
            return
          }
        }
      }

      // 如果都没有找到，清除选中的父菜单
      this.selectedParentMenu = null
      this.clearMenuState()
    },

    // 保存菜单状态
    saveMenuState(menu) {
      try {
        localStorage.setItem('selectedParentMenu', JSON.stringify({
          path: menu.path,
          name: menu.name,
          meta: menu.meta
        }))
      } catch (e) {
        console.warn('保存菜单状态失败:', e)
      }
    },

    // 清除菜单状态
    clearMenuState() {
      try {
        localStorage.removeItem('selectedParentMenu')
      } catch (e) {
        console.warn('清除菜单状态失败:', e)
      }
    },

    // 恢复菜单状态
    restoreMenuState() {
      try {
        const savedState = localStorage.getItem('selectedParentMenu')
        if (savedState) {
          const menuData = JSON.parse(savedState)
          // 根据保存的数据查找对应的菜单
          const menu = this.findMenuByPath(menuData.path)
          if (menu && menu.children && menu.children.length > 0) {
            this.selectedParentMenu = menu
          } else {
            this.selectedParentMenu = null
            this.clearMenuState()
          }
        }
      } catch (e) {
        console.warn('恢复菜单状态失败:', e)
      }
    },
    toggle() {
      this.collapsed = !this.collapsed
      this.setSidebar(!this.collapsed)
      triggerWindowResizeEvent()

      // 根据设备类型处理菜单状态
      if (this.device === 'mobile') {
        //  // console.log('移动端菜单切换:', this.collapsed ? '打开' : '关闭')
        // 移动端时，确保抽屉菜单状态与sidebarOpened同步
        if (this.collapsed !== !this.sidebarOpened) {
          this.setSidebar(!this.collapsed)
        }
      } else {
        // // console.log('PC端菜单切换:', this.collapsed ? '收起' : '展开')
        // PC端时，确保侧边栏状态与collapsed同步
        if (this.collapsed !== !this.sidebarOpened) {
          this.setSidebar(!this.collapsed)
        }
      }
    },
    menuSelect() {
      if (!this.isDesktop()) {
        this.collapsed = false
        this.setSidebar(true) // 确保sidebar状态同步
        //  // console.log('移动端菜单选择后关闭抽屉')
      } else {
        // PC端时，确保菜单状态正确
        if (this.collapsed !== !this.sidebarOpened) {
          this.setSidebar(!this.collapsed)
        }
      }
    },
    // 处理菜单选择事件
    onMenuSelect(obj) {
      // 触发原有的菜单选择逻辑
      this.menuSelect()
    },
    // 处理子菜单选择
    onSubMenuSelect(subMenu) {
      // 不要清除父菜单选择，保持左侧子菜单显示
      // this.selectedParentMenu = null
    },
    // 处理顶部菜单选择
    onTopMenuSelect(selectedMenu) {
      if (selectedMenu) {
        this.selectedParentMenu = selectedMenu
        // 保存菜单状态
        this.saveMenuState(selectedMenu)
      } else {
        this.selectedParentMenu = null
        // 清除菜单状态
        this.clearMenuState()
      }
    },
    // 清除父菜单选择
    clearParentMenu() {
      this.selectedParentMenu = null
    },
    // 根据路径查找菜单
    findMenuByPath(path) {
      const result = this.findMenuRecursive(this.menus, path)
      return result
    },
    // 递归查找菜单
    findMenuRecursive(menus, path) {
      for (let menu of menus) {
        if (menu.path === path) {
          return menu
        }
        if (menu.children && menu.children.length > 0) {
          const found = this.findMenuRecursive(menu.children, path)
          if (found) return found
        }
      }
      return null
    },

    // 递归查找菜单（用于路径匹配）
    findMenuByPathRecursive(menus, path) {
      for (let menu of menus) {
        if (menu.path === path) {
          return menu
        }
        if (menu.children && menu.children.length > 0) {
          const found = this.findMenuByPathRecursive(menu.children, path)
          if (found) return found
        }
      }
      return null
    },

    // 查找第一个可用的菜单（没有子菜单的菜单）
    findFirstAvailableMenu(menus) {
      for (let menu of menus) {
        if (!menu.children || menu.children.length === 0) {
          return menu
        }
        if (menu.children && menu.children.length > 0) {
          const found = this.findFirstAvailableMenu(menu.children)
          if (found) return found
        }
      }
      return null
    },
    //update-begin-author:taoyan date:20190430 for:动态路由title显示配置的菜单title而不是其对应路由的title
    myMenuSelect(value) {
      //此处触发动态路由被点击事件
      this.findMenuBykey(this.menus, value.key)
      this.$emit("dynamicRouterShow", value.key, this.activeMenu.meta.title)
    },
    findMenuBykey(menus, key) {
      for (let i of menus) {
        if (i.path == key) {
          this.activeMenu = { ...i }
        } else if (i.children && i.children.length > 0) {
          this.findMenuBykey(i.children, key)
        }
      }
    },
    //update-end-author:taoyan date:20190430 for:动态路由title显示配置的菜单title而不是其对应路由的title

    // update-begin-author:sunjianlei date:20210409 for: 修复动态功能测试菜单、带参数菜单标题错误、展开错误的问题
    handleUpdateMenuTitle(value) {
      this.findMenuBykey(this.menus, value.path)
      this.activeMenu.meta.title = value.meta.title
      this.$emit('dynamicRouterShow', value.path, this.activeMenu.meta.title)
    },
    // update-end-author:sunjianlei date:20210409 for: 修复动态功能测试菜单、带参数菜单标题错误、展开错误的问题

  }
}

</script>

<style lang="less">
body {
  &.colorWeak {
    filter: invert(80%);
  }
}

.layout {
  min-height: 100vh !important;
  overflow-x: hidden;

  &.mobile {
    .ant-layout-content {
      background: #F4F5F6;

      .content {
        margin: 24px 0 0;
      }
    }

    .ant-table-wrapper {
      .ant-table-content {
        overflow-y: auto;
      }
    }

    .sidemenu {
      .ant-header-fixedHeader {

        &.ant-header-side-opened,
        &.ant-header-side-closed {
          width: 100%
        }
      }
    }

    .topmenu {
      &.content-width-Fluid {
        .header-index-wide {
          margin-left: 0;
        }
      }
    }

    .header,
    .top-nav-header-index {
      .user-wrapper .action {
        padding: 0 12px;
      }
    }
  }

  &.ant-layout-has-sider {
    flex-direction: row;
  }

  .trigger {
    font-size: 22px;
    line-height: 42px;
    padding: 0 18px;
    cursor: pointer;
    transition: color 300ms, background 300ms;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  .topmenu {
    .ant-header-fixedHeader {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 9;
      width: 100%;
      transition: width .2s;

      &.ant-header-side-opened {
        width: 100%;
      }

      &.ant-header-side-closed {
        width: 100%;
      }
    }

    &.content-width-Fluid {
      .header-index-wide {
        max-width: unset;
        margin-left: 24px;
      }

      .page-header-index-wide {
        max-width: unset;
      }
    }
  }

  .sidemenu {
    .ant-header-fixedHeader {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 9;
      width: 100%;
      transition: width .2s;

      &.ant-header-side-opened {
        width: calc(100% - 200px)
      }

      &.ant-header-side-closed {
        width: calc(100% - 80px)
      }
    }
  }

  .header {
    height: 64px;
    padding: 0 12px 0 0;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
    position: relative;
  }

  .header,
  .top-nav-header-index {
    .user-wrapper {
      float: right;
      height: 100%;

      .action {
        cursor: pointer;
        padding: 0 14px;
        display: inline-block;
        transition: all .3s;
        height: 70%;
        line-height: 46px;

        &.action-full {
          height: 100%;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .avatar {
          margin: 20px 10px 20px 0;
          color: #1890ff;
          background: hsla(0, 0%, 100%, .85);
          vertical-align: middle;
        }

        .icon {
          font-size: 16px;
          padding: 4px;
        }

        .anticon {
          color: inherit;
        }
      }
    }

    &.dark {
      .user-wrapper {
        .action {
          color: black;

          &:hover {
            background: rgba(0, 0, 0, 0.05);
          }

          .anticon {
            color: inherit;
          }
        }
      }
    }
  }

  &.mobile {
    .top-nav-header-index {
      .header-index-wide {
        .header-index-left {
          .trigger {
            color: rgba(255, 255, 255, 0.85);
            padding: 0 12px;
          }

          .logo.top-nav-header {
            text-align: center;
            width: 56px;
            line-height: 58px;
          }
        }
      }

      .user-wrapper .action .avatar {
        margin: 20px 0;
      }

      &.light {
        .header-index-wide {
          .header-index-left {
            .trigger {
              color: rgba(0, 0, 0, 0.65);
            }
          }
        }
      }
    }
  }

  &.tablet {
    .top-nav-header-index {
      .header-index-wide {
        .header-index-left {
          .logo>a {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }

  .top-nav-header-index {
    box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
    position: relative;
    transition: background .3s, width .2s;

    .header-index-wide {
      width: 100%;
      margin: auto;
      padding: 0 20px 0 0;
      display: flex;
      height: 59px;

      .ant-menu.ant-menu-horizontal {
        border: none;
        height: 64px;
        line-height: 64px;
      }

      .header-index-left {
        flex: 1 1;
        display: flex;

        .logo.top-nav-header {
          width: 165px;
          height: 64px;
          position: relative;
          line-height: 64px;
          transition: all .3s;
          overflow: hidden;

          img {
            display: inline-block;
            vertical-align: middle;
            height: 32px;
          }

          h1 {
            color: #fff;
            display: inline-block;
            vertical-align: top;
            font-size: 16px;
            margin: 0 0 0 12px;
            font-weight: 400;
          }
        }
      }

      .header-index-right {
        float: right;
        height: 59px;
        overflow: hidden;

        .action:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      }
    }

    &.light {
      background-color: #fff;

      .header-index-wide {
        .header-index-left {
          .logo {
            h1 {
              color: #002140;
            }
          }
        }
      }
    }

    &.dark {
      .user-wrapper {
        .action {
          color: white;

          &:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        }
      }

      .header-index-wide .header-index-left .trigger:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  .layout-content {
    margin: 24px 24px 0px;
    height: 64px;
    padding: 0 12px 0 0;
  }
}

.topmenu {
  .page-header-index-wide {
    margin: 0 auto;
    width: 100%;
  }
}

// drawer-sider 自定义
.ant-drawer.drawer-sider {
  .sider {
    box-shadow: none;
  }

  &.dark {
    .ant-drawer-content {
      background-color: rgb(0, 21, 41);
    }
  }

  &.light {
    box-shadow: none;

    .ant-drawer-content {
      background-color: #fff;
    }
  }

  .ant-drawer-body {
    padding: 0
  }
}

// 菜单样式
.sider {
  box-shadow: 2px 116px 6px 0 rgba(0, 21, 41, .35);
  position: relative;
  z-index: 10;

  &.ant-fixed-sidemenu {
    position: fixed;
    height: 100%;
  }

  .logo {
    height: 64px;
    position: relative;
    line-height: 64px;
    padding-left: 24px;
    -webkit-transition: all .3s;
    transition: all .3s;
    background: #002140;
    overflow: hidden;

    img,
    h1 {
      display: inline-block;
      vertical-align: middle;
    }

    img {
      height: 32px;
    }

    h1 {
      color: #fff;
      font-size: 18px;
      margin: 0 0 0 8px;
      font-family: 'WDXL Lubrifont SC Local', "Chinese Quote", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      font-weight: 600;
    }
  }

  &.light {
    background-color: #fff;
    box-shadow: 2px 116px 8px 0 rgba(29, 35, 41, 0.05);

    .logo {
      background: #fff;
      box-shadow: 1px 1px 0 0 #e8e8e8;

      h1 {
        color: unset;
      }
    }

    .ant-menu-light {
      border-right-color: transparent;
    }
  }
}

// 外置的样式控制
.user-dropdown-menu-wrapper.ant-dropdown-menu {
  padding: 4px 0;

  .ant-dropdown-menu-item {
    width: 160px;
  }

  .ant-dropdown-menu-item>.anticon:first-child,
  .ant-dropdown-menu-item>a>.anticon:first-child,
  .ant-dropdown-menu-submenu-title>.anticon:first-child .ant-dropdown-menu-submenu-title>a>.anticon:first-child {
    min-width: 12px;
    margin-right: 8px;
  }
}

// 子菜单专用区域样式
.sub-menu-only {
  height: calc(100vh - 64px);
  overflow: auto;
}

// 固定Header样式
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
  height: 59px;
}

// 数据列表 样式
.table-alert {
  margin-bottom: 16px;
}

.table-page-search-wrapper {
  .ant-form-inline {
    .ant-form-item {
      display: flex;
      margin-bottom: 24px;
      margin-right: 0;

      .ant-form-item-control-wrapper {
        flex: 1 1;
        display: inline-block;
        vertical-align: middle;
      }

      >.ant-form-item-label {
        line-height: 32px;
        padding-right: 8px;
        width: auto;
      }

      .ant-form-item-control {
        height: 32px;
        line-height: 32px;
      }
    }
  }

  .table-page-search-submitButtons {
    display: block;
    margin-bottom: 24px;
    white-space: nowrap;
  }
}

.content {
  .table-operator {
    margin-bottom: 18px;

    button {
      margin-right: 8px;
    }
  }
}
</style>