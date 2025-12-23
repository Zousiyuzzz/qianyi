<template>
  <a-layout-header v-if="!headerBarFixed"
    :class="[fixedHeader && 'ant-header-fixedHeader', sidebarOpened ? 'ant-header-side-opened' : 'ant-header-side-closed']"
    :style="{ padding: '0' }">
    <!--v-if="mode === 'sidemenu'"-->
    <div class="header" :class="theme">
      <div class="top-menu">
        <a-layout-header :class="['header-menu', theme]" :style="headerStyle">
          <div :style="device === 'mobile' ? 'display: flex;' : 'display: flex;padding: 0 54px 0 14px;'">
            <a-icon style="height: 58px;margin-left: -20px;display: flex;align-items: center;justify-content: center;"
              v-if="device === 'mobile'" class="trigger" :type="collapsed ? 'menu-fold' : 'menu-unfold'"
              @click="toggle"></a-icon>
            <Logo style="height: 48px; width: 48px;" />
            <div class="brand-title">
              <img src="/zxgg.png" style="height: 36px;position: relative;margin-left: 8px;" alt="">
            </div>
          </div>
          <s-menu v-if="device != 'mobile'" :menu="menus" :theme="theme" @select="onSelect"
            @updateMenuTitle="handleUpdateMenuTitle" mode="horizontal" :style="menuStyle"></s-menu>
        </a-layout-header>
      </div>
      <user-menu :theme="theme" :device="device" />
    </div>


  </a-layout-header>
</template>

<script>
import UserMenu from '../tools/UserMenu'
import SMenu from '../menu/'
import { mixin } from '@/utils/mixin.js'
import SideMenu from '@/components/menu/SideMenu'
import Logo from '../tools/Logo.vue'

export default {
  name: 'GlobalHeader',
  components: {
    SideMenu,
    UserMenu,
    SMenu,
    Logo
  },
  mixins: [mixin],
  props: {
    mode: {
      type: String,
      default: 'topmenu'
    },
    menus: {
      type: Array,
      required: true
    },
    theme: {
      type: String,
      required: false,
      default: 'dark'
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    },
    device: {
      type: String,
      required: false,
      default: 'desktop'
    }
  },
  data() {
    return {
      headerBarFixed: false,
      topMenuStyle: {
        headerIndexLeft: {},
        headerIndexRight: {},
        topSmenuStyle: {}
      },
      chatStatus: ''
    }
  },
  computed: {
    headerStyle() {
      return {
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        height: '59px',
        lineHeight: '59px',
        whiteSpace: 'nowrap'
      }
    },
    menuStyle() {
      return {
        flex: 1,
        minWidth: '200px',
        lineHeight: '59px',
        background: 'transparent',
        whiteSpace: 'nowrap'
      }
    }
  },
  watch: {
    device() {
      if (this.mode === 'topmenu') {
        this.buildTopMenuStyle()
      }
    },
    mode(newVal) {
      if (newVal === 'topmenu') {
        this.buildTopMenuStyle()
      }
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
    if (this.mode === 'topmenu') {
      this.buildTopMenuStyle()
    }
  },
  methods: {
    handleScroll() {
      if (this.autoHideHeader) {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
        if (scrollTop > 100) {
          this.headerBarFixed = true
        } else {
          this.headerBarFixed = false
        }
      } else {
        this.headerBarFixed = false
      }
    },
    toggle() {
      this.$emit('toggle')
    },
    buildTopMenuStyle() {
      if (this.mode === 'topmenu') {
        if (this.device === 'mobile') {
          this.topMenuStyle.topSmenuStyle = {}
          this.topMenuStyle.headerIndexRight = {}
          this.topMenuStyle.headerIndexLeft = {}
        } else {
          let rightWidth = '400px'
          this.topMenuStyle.topSmenuStyle = { width: 'calc(100% - 400px)' }
          this.topMenuStyle.headerIndexRight = { 'min-width': rightWidth, 'white-space': 'nowrap' }
          this.topMenuStyle.headerIndexLeft = { width: 'calc(100% - 400px)' }
        }
      }
    },
    handleUpdateMenuTitle(value) {
      this.$emit('updateMenuTitle', value)
    },
    onSelect(obj) {
      // 查找选中的菜单
      const selectedMenu = this.findMenuByPath(obj.key)
      if (selectedMenu) {
        // 检查 children 是否为数组
        if (Array.isArray(selectedMenu.children) && selectedMenu.children.length > 0) {
          // 如果有子菜单，触发左侧子菜单显示
          this.$emit('topMenuSelect', selectedMenu)
        } else {
          // 如果没有子菜单，触发清除事件
          this.$emit('topMenuSelect', null)
        }
      }

      this.$emit('menuSelect', obj)
    },
    // 根据路径查找菜单
    findMenuByPath(path) {
      return this.findMenuRecursive(this.menus, path)
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
    }
  }
}
</script>

<style lang="less" scoped>
/* update_begin author:scott date:20190220 for: 缩小首页布局顶部的高度 */
@height: 62px;

.layout {
  .top-nav-header-index {
    .header-index-wide {
      margin-left: 10px;

      .ant-menu.ant-menu-horizontal {
        height: @height;
        line-height: @height;
      }
    }

    .trigger {
      line-height: 64px;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }
    }
  }

  .header {
    z-index: 2;
    color: black;
    height: @height;
    background-color: white;
    transition: background 300ms;
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;

    /* 隐藏滚动条但保持功能 */
    &::-webkit-scrollbar {
      height: 6px;
      width: 0;
    }

    &::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    &.dark {
      color: #000000;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
      background-color: white !important;
    }
  }

  .header,
  .top-nav-header-index {
    &.dark .trigger:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }
}

.ant-layout-header {
  height: @height;
  line-height: @height;
  padding: 0;
}

.header-menu {
  .ant-menu-horizontal>.ant-menu-submenu-selected {
    // border-bottom: 2px solid @primary-color;
    border: none !important;
    border-radius: 4px;
    color: @primary-color;
    background-color: #e6f7ff !important;
  }

  .ant-menu-horizontal>.ant-menu-submenu:hover {
    background-color: rgba(24, 144, 255, 0.06) !important;
    border-radius: 4px;
  }


  &.dark {
    background: #001529;

    .ant-menu {
      background: transparent;

      &>.ant-menu-item {
        margin: 0 16px;
        border-radius: 4px;
        transition: background-color 0.3s;

        &>a {
          color: rgba(255, 255, 255, 0.65);
          font-size: 14px;

          &:hover {
            color: #fff;
            font-size: 14px;
          }
        }

        &:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }

        &.ant-menu-item-selected {
          background-color: rgba(24, 144, 255, 0.15) !important;

          &>a {
            color: #fff;
            font-size: 14px;
            // border-bottom: 2px solid @primary-color;
          }
        }
      }
    }
  }

  &.light {
    background: #fff;

    .ant-menu {
      background: transparent;

      &>.ant-menu-item {
        margin: 0 16px;
        border-radius: 4px;
        transition: background-color 0.3s;

        &>a {
          color: rgba(0, 0, 0, 0.65);
          font-size: 14px;

          &:hover {
            color: @primary-color;
            font-size: 14px;
          }
        }

        &:hover {
          background-color: rgba(24, 144, 255, 0.06) !important;
        }

        &.ant-menu-item-selected {
          background-color: #e6f7ff !important;

          &>a {
            color: @primary-color;
            font-size: 14px;
            // border-bottom: 2px solid @primary-color;
          }
        }
      }
    }
  }

  .ant-menu.ant-menu-root {
    &>.ant-menu-item:first-child {
      background-color: transparent;

      &>a,
      &>a:hover {
        color: inherit;
        font-size: 14px;
      }

      &.ant-menu-item-selected {
        background-color: #e6f7ff !important;
        border-radius: 4px;

        &>a,
        &>a:hover {
          color: @primary-color;
          font-size: 14px;
        }
      }
    }
  }
}

/deep/ .ant-menu-item,
.ant-menu-submenu-title {
  padding: 0 17px;
}

/* 去除菜单边框 */
/deep/ .ant-menu-horizontal {
  border: none !important;
  line-height: 59px;
  overflow-y: hidden;
}

/deep/ .ant-menu-horizontal>.ant-menu-item,
/deep/ .ant-menu-horizontal>.ant-menu-submenu {
  border-bottom: none !important;
  overflow-y: hidden;
}

/deep/ .ant-menu-horizontal>.ant-menu-item:hover,
/deep/ .ant-menu-horizontal>.ant-menu-submenu:hover,
/deep/ .ant-menu-horizontal>.ant-menu-item-active,
/deep/ .ant-menu-horizontal>.ant-menu-submenu-active,
/deep/ .ant-menu-horizontal>.ant-menu-item-open,
/deep/ .ant-menu-horizontal>.ant-menu-submenu-open,
/deep/ .ant-menu-horizontal>.ant-menu-item-selected,
/deep/ .ant-menu-horizontal>.ant-menu-submenu-selected {
  border-bottom: none !important;
  overflow-y: hidden;
  background-color: #e6f7ff !important;
  border-radius: 4px;
  transition: background-color 0.3s;
}

/deep/ .ant-menu-horizontal>.ant-menu-item-selected>a,
/deep/ .ant-menu-horizontal>.ant-menu-submenu-selected>.ant-menu-submenu-title {
  color: #1890ff !important;
}

/deep/ .ant-menu-horizontal>.ant-menu-item:hover,
/deep/ .ant-menu-horizontal>.ant-menu-submenu:hover {
  background-color: rgba(24, 144, 255, 0.06) !important;
  border-radius: 4px;
  transition: background-color 0.3s;
}

/* 深色主题下的选中样式 */
/deep/ .header-menu.dark .ant-menu-horizontal>.ant-menu-item-selected,
/deep/ .header-menu.dark .ant-menu-horizontal>.ant-menu-submenu-selected {
  background-color: rgba(24, 144, 255, 0.15) !important;
}

/deep/ .header-menu.dark .ant-menu-horizontal>.ant-menu-item-selected>a,
/deep/ .header-menu.dark .ant-menu-horizontal>.ant-menu-submenu-selected>.ant-menu-submenu-title {
  color: #fff !important;
}

/* 隐藏菜单的纵向滚动条 */
/deep/ .ant-menu {
  overflow-y: hidden !important;
}

/deep/ .ant-menu-submenu {
  overflow-y: hidden !important;
}

/deep/ .ant-menu-submenu-popup {
  overflow-y: hidden !important;
}

/* 品牌标题样式 */
.brand-title {
  font-family: 'WDXL Lubrifont SC Local', 'ZCOOL KuaiLe', 'ZCOOL XiaoWei', 'ZCOOL ShangWei', 'ZCOOL JianYi', 'ZCOOL QingKe HuangYou', 'Source Han Sans SC', 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-size: 2em;
  white-space: nowrap;
  position: relative;
  cursor: pointer;
  letter-spacing: 2px;
  font-weight: 500;
  letter-spacing: 1px;
}

/* update_end author:scott date:20190220 for: 缩小首页布局顶部的高度 */
</style>