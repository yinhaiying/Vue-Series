import applyMixin from "./mixin";
import {forEachValue} from "../utils.js"



export let Vue;
export class Store {
    constructor(options){
      const state = options.state;  // 数据变化要更新试图
      const computed ={}
      // 处理getters
      this.getters = {};
      forEachValue(options.getters,(fn,key) =>{
          // 将用户的getters定义在vue的computed身上
        computed[key] = () => {
            return fn(this.state);
        }
        Object.defineProperty(this.getters, key, {
            get: () => this._vm[key]
        })
      });
        this._vm = new Vue({
            data: { // 属性如果是通过$开头的默认不会将属性挂载到vm上
                $$state: state // vue中的所有state都会将数据进行劫持
            },
            computed
        });



    //   options.getters.
    }
    get state(){
        return this._vm._data.$$state
    }
}



export const install = (_Vue) => {
  // _Vue是Vue的构造函数。
  Vue = _Vue;
  applyMixin(Vue)
}