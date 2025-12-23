<template>
  <div id="userLayout" :class="['user-layout-wrapper', device]">
    <div class="container">
      <div class="top">
        <div class="header">
          <img v-if="showTitle" src="~@/assets/logo.png" class="logo" alt="logo">
          <!-- <span class="title" v-if="showTitle">云枢管理平台</span> -->
          <img src="/zxys.png" style="height: 36px;position: relative;margin-left: 8px;margin-top: 4px;" alt="">
        </div>
        <div class="desc" v-if="showTitle">
          <!-- 云枢管理平台 -->
        </div>
      </div>

      <route-view></route-view>

      <div class="footer">
        <div class="links">
          <!--href="http://doc.jeecg.com"-->
          <a target="_blank">帮助</a>
          <!--href="https://github.com/zhangdaiscott/jeecg-boot"-->
          <a target="_blank">隐私</a>
          <!--href="https://github.com/zhangdaiscott/jeecg-boot/blob/master/LICENSE"-->
          <a target="_blank">条款</a>
        </div>
        <div class="copyright">
          Copyright &copy; 2025 <a href="http://www.zxmember.com/" target="_blank"></a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RouteView from "@/components/layouts/RouteView"
import { mixinDevice } from '@/utils/mixin.js'

export default {
  name: "UserLayout",
  components: { RouteView },
  mixins: [mixinDevice],
  data() {
    return {}
  },
  data() {
    return {
      showTitle: true // 控制标题显示
    }
  },
  mounted() {
    document.body.classList.add('userLayout')
    // 获取当前路由信息
    // // console.log('当前路由:', this.$route)
    // // console.log('当前路径:', this.$route.path)
    // // console.log('当前路由名称:', this.$route.name)
    // // console.log('路由参数:', this.$route.params)
    // // console.log('查询参数:', this.$route.query)
    // 初始化时检查路由
    this.checkRoute()
  },
  beforeDestroy() {
    document.body.classList.remove('userLayout')
  },
  watch: {
    '$route.path': {
      handler(newPath) {
        this.checkRoute()
      },
      immediate: true
    }
  },
  methods: {
    checkRoute() {
      // 如果路径等于 /projectManager/workbench 就隐藏标题
      this.showTitle = this.$route.path !== '/projectManager/workbench'
    }
  }
}
</script>

<style lang="less" scoped>
#userLayout.user-layout-wrapper {
  height: 100%;

  &.mobile {
    .container {
      .main {
        max-width: 368px;
        width: 98%;
        // margin: -130px 0 144px;
      }
    }
  }

  .container {
    width: 100%;
    min-height: 100%;
    background: #ffffff url(~@/assets/background.svg) no-repeat 50%;
    background-size: 100%;
    padding: 110px 0 144px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;

    a {
      text-decoration: none;
      color: #000000;
    }

    .top {
      text-align: center;

      .header {
        height: 44px;
        line-height: 44px;
        display: flex;
        align-items: center;
        margin-top: 100px;

        .badge {
          position: absolute;
          display: inline-block;
          line-height: 1;
          vertical-align: middle;
          margin-left: -12px;
          margin-top: -10px;
          opacity: 0.8;
        }

        .logo {
          height: 50px;
          vertical-align: top;
          // margin-right: 16px;
          border-style: none;
        }

        .title {
          color: #000000;
          font-family: "WDXL Lubrifont SC Local", sans-serif;
          font-weight: 400;
          font-style: normal;
          font-size: 2em;
          white-space: nowrap;
          position: relative;
          cursor: pointer;
          letter-spacing: 2px;
          font-weight: 500;
          letter-spacing: 1px;
        }
      }

      .desc {
        font-size: 14px;
        color: #000000;
        margin-top: 12px;
        margin-bottom: 40px;
      }
    }

    .main {
      min-width: 368px;
      margin: 0 auto;
    }

    .footer {
      position: absolute;
      width: 100%;
      bottom: 0;
      padding: 0 16px;
      margin: 48px 0 24px;
      text-align: center;

      .links {
        margin-bottom: 8px;
        font-size: 14px;

        a {
          color: #000000;
          transition: all 0.3s;

          &:not(:last-child) {
            margin-right: 40px;
          }
        }
      }

      .copyright {
        color: #000000;
        font-size: 14px;
      }
    }
  }
}
</style>