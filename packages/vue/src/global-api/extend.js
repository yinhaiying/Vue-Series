/*
组件的渲染流程：
1. 调用Vue.component
2. 内部用的是Vue.extend。功能就是生成一个字类继承父类
3. 创建子类实例时，会调用父类的_init方法。也就是整个Vue的初始化方法。再去$mount即可。
4. 组件的初始话就是new 这个组件的构造函数。比如new Vue()就是调用Vue的构造函数来初始化
*/

import { mergeOptions } from "../utils";




export function initExtend(Vue) {
  let cid = 0;
  // 核心就是创建一个字类去继承父类
  Vue.extend = function (extendOptions) {
    const Super = this;
    const Sub = function VueComponent(options) {
      // 父类的初始化。 这里的this是Super
      this._init(options)
    };
    Sub.cid = cid++;
    // 子类继承父类原型上的方法
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    // 子类拥有跟父类同样的属性。因为它可能也作为另外的子组件的父类
    Sub.options = mergeOptions(Super.options, extendOptions)

    return Sub;
  }
}




