// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import storeData from './store'
import './assets/styles/master.sss'

Vue.use(Vuex)
const bus = new Vue()
Vue.prototype.$bus = bus

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store: new Vuex.Store(storeData),
  template: '<App/>',
  components: { App }
})
