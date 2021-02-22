import applyMixin from "./mixin";




export let Vue;
export class Store {}



export const install = (_Vue) => {
  // _Vue是Vue的构造函数。
  Vue = _Vue;
  applyMixin(Vue)

}