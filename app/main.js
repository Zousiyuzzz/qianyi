import Vue from 'vue'
import App from './App'
import { H5_BASE_URL, DEFAULT_ROUTE, buildWebUrl } from './common/config'
import './common/http'

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
