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
        console.log("_modules:",this._modules)
        // 根模块的状态中，要将子模块通过模块名 定义在根模块上
        // 2.安装模块
        installModule(this,state,[],this._modules.root);
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
const installModule =  (store,rootState,path,module) => {
  
    module.forEachMutation((mutation,key) => {
      store._mutations[key] = store._mutations[key] || [];

      // 多个模块都具有相同的mutation时，需要用数组处理
      store._mutations[key].push((payload) => {
          mutation.call(store,module.state,payload);
      })
    });
    module.forEachAction((action,key) => {
      store._actions[key] = store._actions[key] || [];
      store._actions[key].push((payload) => {
          action.call(store,store,payload);
      })
    });
    module.forEachGetter((getter,key) => {
        // 不同模块的相同getter是会被覆盖的。
      store._wrappedGetters[key] = function () {
          return getter(module,state);
      }
    });

    module.forEachChild((child,key) => {
        // 递归加载模块
      installModule(store, rootState, path.concat(key), child)
    })
}