<template>
  <a-layout-header :class="['header-menu', theme]" :style="headerStyle">
    <!-- <logo /> -->
    <s-menu :menu="menus" :theme="theme" @select="onSelect" @updateMenuTitle="onUpdateMenuTitle" mode="horizontal"
      :style="menuStyle">
    </s-menu>
  </a-layout-header>
</template>

<script>
import ALayoutHeader from 'ant-design-vue/lib/layout' // 修正路径
import Logo from '../tools/Logo'
import SMenu from './index'
import { mixin, mixinDevice } from '@/utils/mixin.js'

export default {
  name: "HorizontalMenu",
  components: { ALayoutHeader, Logo, SMenu },
  mixins: [mixin, mixinDevice],
  props: {
    theme: {
      type: String,
      required: false,
      default: 'dark'
    },
    menus: {
      type: Array,
      required: true
    }
  },
  computed: {
    headerStyle() {
      return {
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        height: '64px',
        lineHeight: '64px'
      }
    },
    menuStyle() {
      return {
        flex: 1,
        lineHeight: '64px',
        background: 'transparent'
      }
    }
  },
  methods: {
    onSelect(obj) {
      this.$emit('menuSelect', obj)
    },
    onUpdateMenuTitle(obj) {
      this.$emit('updateMenuTitle', obj)
    }
  }
}
</script>

<style lang="less" scoped>
// 样式保持不变
.header-menu {
  &.dark {
    background: #001529;

    .ant-menu {
      background: transparent;

      &>.ant-menu-item {
        margin: 0 16px;

        &>a {
          color: rgba(255, 255, 255, 0.65);

          &:hover {
            color: #fff;
          }
        }

        &.ant-menu-item-selected {
          &>a {
            color: #fff;
            // border-bottom: 2px solid @primary-color;
          }
        }
      }
    }
  }

  &.light {
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    .ant-menu {
      background: transparent;

      &>.ant-menu-item {
        margin: 0 16px;

        &>a {
          color: rgba(0, 0, 0, 0.65);

          &:hover {
            color: @primary-color;
          }
        }

        &.ant-menu-item-selected {
          &>a {
            color: @primary-color;
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
      }

      &.ant-menu-item-selected {

        &>a,
        &>a:hover {
          color: @primary-color;
        }
      }
    }
  }
}
</style>