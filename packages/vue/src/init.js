import { initState } from "./state.js"

export const initMixin = function (Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    // 将选项挂载到实例身上
    vm.$options = options;

    // 初始化state
    initState(vm)
  }
}
