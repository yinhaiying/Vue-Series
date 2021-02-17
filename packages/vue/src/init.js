import { initState } from "./state.js"
import { compileToFunctions } from "./compiler/index"


export const initMixin = function (Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    // 将选项挂载到实例身上
    vm.$options = options;

    // 初始化state
    initState(vm);

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
    // 有render
    // 最终渲染时，实际上用的都是render方法，要么是用户定义的，要么是我们转化的
  }
}
