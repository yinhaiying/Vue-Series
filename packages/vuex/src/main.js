import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
import store from "./store/index"
new Vue({
  render: h => h(App),
  store, // 每个子组件，都会拥有一个属性$store相当于将store挂载到vm.$store = store；
}).$mount('#app')
