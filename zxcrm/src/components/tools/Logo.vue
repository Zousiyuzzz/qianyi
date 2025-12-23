<template>
  <div class="logo">
    <router-link :to="routerLinkTo">

      <!-- update-begin- author:sunjianlei --- date:20190814 --- for: logo颜色根据主题颜色变化 -->
      <!-- <img v-if="navTheme === 'dark'" src="~@/assets/logo-white.png" alt="logo"> -->
      <img style="max-height: 100%;" src="~@/assets/logo.png" alt="logo">
      <!-- update-begin- author:sunjianlei --- date:20190814 --- for: logo颜色根据主题颜色变化 -->

      <!-- <h1
        style="height: 100%;font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;"
        v-if="showTitle">{{ title }}</h1> -->
    </router-link>
  </div>
</template>

<script>
import { mixin } from '@/utils/mixin.js'

export default {
  name: 'Logo',
  mixins: [mixin],
  props: {
    title: {
      type: String,
      default: '执象广告',
      required: false
    },
    showTitle: {
      type: Boolean,
      default: true,
      required: false
    },
    // 点击Logo跳转地址
    routerLinkTo: {
      type: Object,
      default: () => ({ name: 'dashboard' }),
    },
  }
}
</script>
<style lang="less" scoped>
/*缩小首页布 局顶部的高度*/
@height: 59px;

.sider {
  box-shadow: none !important;

  .logo {
    height: @height !important;
    line-height: @height !important;
    box-shadow: none !important;
    transition: background 300ms;

    a {
      color: black;

      &:hover {
        color: rgba(99, 87, 87, 0.8);
      }
    }
  }

  &.light .logo {
    // background-color: @primary-color;
    background-color: white;
    border-bottom: 1px solid #f0f0f0;
  }
}
</style>