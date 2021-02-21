import { mergeOptions } from "../utils";


export function initGlobalApi(Vue) {
  Vue.options = {};
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    // console.log("this.options:", this.options)
  }
}
