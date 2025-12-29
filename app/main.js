import Vue from 'vue'
import App from './App'
import { H5_BASE_URL, DEFAULT_ROUTE, buildWebUrl } from './common/config'
import './common/http'
// main.js，注意要在use方法之后执行
import uView from 'uview-ui'
Vue.use(uView)
// 如此配置即可
uni.$u.config.unit = 'rpx'

Vue.config.productionTip = false

Vue.prototype.$config = {
  H5_BASE_URL,
  DEFAULT_ROUTE,
  buildWebUrl
}

App.mpType = 'app'

const app = new Vue({
  ...App
})

app.$mount()
