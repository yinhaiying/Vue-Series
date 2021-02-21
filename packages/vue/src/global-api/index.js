import { mergeOptions } from "../utils";
import { initExtend } from "./extend";


export function initGlobalApi(Vue) {
  Vue.options = {};
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    // console.log("this.options:", this.options)
  }
  Vue.options._base = Vue;// _base 最终的Vue的构造函数
  Vue.options.components = {};
  initExtend(Vue)
  Vue.component = function (id, definition) {
    definition.name = definition.name || id;  // 默认以name为准
    // 根据当前子类对象，生成了一个构造函数
    definition = Vue.extend(definition);
    Vue.options.components[id] = definition;
  }
}
