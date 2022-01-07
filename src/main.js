import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
import store from "./store/store";
import Toasted from 'vue-toasted';
import Vuelidate from 'vuelidate'

Vue.use(Vuex)
Vue.use(Vuelidate)
Vue.use(Toasted, {
  theme: "outline",
  duration: 2000,
  position: "top-center",
})

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
