import applyMixin from "./mixin";




export let Vue;
export class Store {
    constructor(options){
        console.log("options:",options)
      const state = options.state;  // 数据变化要更新试图
      this._vm = new Vue({
          data:{  // 属性如果是通过$开头的默认不会将属性挂载到vm上
              $$state:state    // vue中的所有state都会将数据进行劫持
          }
      });
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