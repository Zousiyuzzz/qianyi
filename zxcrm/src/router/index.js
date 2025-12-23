import Vue from 'vue'
import Router from 'vue-router'
import { constantRouterMap } from '@/config/router.config'

Vue.use(Router)

const router = new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

// 全局路由守卫，确保每次页面进入时都刷新菜单状态
router.beforeEach((to, from, next) => {
  // 在路由跳转完成后刷新菜单状态
  next()
})

router.afterEach((to, from) => {
  // 路由跳转完成后，通过全局事件通知刷新菜单状态
  if (window.Vue && window.Vue.$root) {
    window.Vue.$root.$emit('refreshMenuState')
  }
})

// 监听浏览器前进后退事件
window.addEventListener('popstate', () => {
  if (window.Vue && window.Vue.$root) {
    window.Vue.$root.$emit('refreshMenuState')
  }
})

export default router