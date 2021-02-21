import { initState } from "./state.js"
import { compileToFunctions } from "./compiler/index"
import { callHook, mountComponent } from "./lifecycle.js";
import { mergeOptions } from "./utils.js";


export const initMixin = function (Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    // 将选项挂载到实例身上
    // vm.$options = mergeOptions(Vue.options, options);
    // 有可能是子组件初始化，因此不一定是Vue.options。只是需要拿到对应的选项即可。
    vm.$options = mergeOptions(vm.constructor.options, options);
    callHook(vm, "beforeCreate")
    // 初始化state
    initState(vm);
    callHook(vm, "created")
    // 渲染模板
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  }

  // 实现挂载操作
  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);
    vm.$el = el;
    if (!options.render) {
      //没有render,将template转化成render
      let template = options.template;
      if (!template && el) {
        template = el.outerHTML;
        const render = compileToFunctions(template);
        options.render = render;
      }
      // 有template
    }
    // 有render方法之后，需要进行挂载
    mountComponent(vm, el);

  }
}
