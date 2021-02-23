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

    this._subscribes = [];


    this._modules = new ModuleCollection(options);
    installModule(this, state, [], this._modules.root);
    resetStoreVM(this, state);

    // 处理plugins 插件内部依次执行
    options.plugins.forEach((plugin) => plugin(this));
  }
  get state() {
    return this._vm._data.$$state
  }

  subscribe(fn) {
    this._subscribes.push(fn)
  }
  replaceState(state) {
    this._vm._data.$$state = state;
  }
  commit = (type, payload) => {
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

// 获取最新的状态
function getState(store, path) {
  let result = path.reduce((newState, current) => {
    return newState[current]
  }, store.state);
  return result;
}

const installModule = (store, rootState, path, module) => {
  let namespaced = store._modules.getnamespaced(path);
  if (path.length > 0) {
    let parent = path.slice(0, -1).reduce((memo, current) => {
      return memo[current];
    }, rootState)
    // path[path.length-1]  是c  state.a.c = xxx;
    Vue.set(parent, path[path.length - 1], module.state);
  }

  module.forEachMutation((mutation, key) => {
    store._mutations[namespaced + key] = store._mutations[namespaced + key] || [];
    store._mutations[namespaced + key].push((payload) => {
      // mutation.call(store, module.state, payload);
      // 需要取到最新的状态
      mutation.call(store, getState(store, path), payload);
      console.log(".........111", getState(store, path), store.state)
      // mutation一发生变化就让subscribe中的函数执行。
      store._subscribes.forEach((fn) => {
        fn(mutation, store.state)   // 用最新的状态
      })
    })
  });
  module.forEachAction((action, key) => {
    store._actions[namespaced + key] = store._actions[namespaced + key] || [];
    store._actions[namespaced + key].push((payload) => {
      action.call(store, store, payload);
    })
  });
  module.forEachGetter((getter, key) => {
    store._wrappedGetters[namespaced + key] = function () {
      return getter(getState(store, path));
    }
  });

  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child)
  })
}

function resetStoreVM(store, state) {
  const computed = {};   // 定义计算属性
  store.getters = {};
  forEachValue(store._wrappedGetters, (fn, key) => {
    computed[key] = () => {
      return fn(store.state);
    };
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key]//通过计算属性中取值，从而有缓存
    })
  });
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })

}
