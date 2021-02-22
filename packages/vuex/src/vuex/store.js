import { forEachValue } from "../utils";
import applyMixin from "./mixin";
import ModuleCollection from "./module/module-collection.js"




export let Vue;
export class Store {
  constructor(options) {
    const state = options.state;
    this._actions = {};
    this._mutations = {};
    this._wrappedGetters = {};
    // 1.模块收集
    this._modules = new ModuleCollection(options);
    console.log("_modules:", this._modules)
    // 根模块的状态中，要将子模块通过模块名 定义在根模块上
    // 2.安装模块
    installModule(this, state, [], this._modules.root);

    // 3.计算属性的实现
    resetStoreVM(this, state);
  }
  get state() {
    return this._vm._data.$$state
  }
  commit = (type, payload) => { // 保证this指向当前实例
    // 调用commit，其实就是去this.mutations中找
    this._mutations[type].forEach((mutation) => mutation.call(this, payload))
  }

  dispatch = (type, payload) => {
    this._actions[type].forEach((action) => action.call(this, payload))
  }

}



export const install = (_Vue) => {
  // _Vue是Vue的构造函数。
  Vue = _Vue;
  applyMixin(Vue)
}


// store 容器
// rootState:根模块
// path 所有路径
// module 格式化后的模块树
const installModule = (store, rootState, path, module) => {
  let namespaced = store._modules.getnamespaced(path);
  console.log("namespaced:", namespaced)
  // 将所有的子模块的状态安装到父模块
  if (path.length > 0) {
    // 入股哦这个对象本身不是响应式的，直接给obj
    // state.a.xxx
    let parent = path.slice(0, -1).reduce((memo, current) => {
      return memo[current];
    }, rootState)
    // path[path.length-1]  是c  state.a.c = xxx;
    Vue.set(parent, path[path.length - 1], module.state);
    console.log("state:", rootState);
  }

  module.forEachMutation((mutation, key) => {
    store._mutations[namespaced + key] = store._mutations[namespaced + key] || [];

    // 多个模块都具有相同的mutation时，需要用数组处理
    store._mutations[namespaced + key].push((payload) => {
      mutation.call(store, module.state, payload);
    })
  });
  module.forEachAction((action, key) => {
    store._actions[namespaced + key] = store._actions[namespaced + key] || [];
    store._actions[namespaced + key].push((payload) => {
      action.call(store, store, payload);
    })
  });
  module.forEachGetter((getter, key) => {
    // 不同模块的相同getter是会被覆盖的。
    store._wrappedGetters[namespaced + key] = function () {
      return getter(module, module.state);
    }
  });

  module.forEachChild((child, key) => {
    // 递归加载模块
    installModule(store, rootState, path.concat(key), child)
  })
}

function resetStoreVM(store, state) {
  const computed = {};   // 定义计算属性
  store.getters = {};
  forEachValue(store._wrappedGetters, (fn, key) => {
    computed[key] = () => {
      fn(store.state);
    };
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key]//通过计算属性中取值，从而有缓存
    })
  })
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })

}
