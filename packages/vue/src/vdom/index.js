export function renderMixin(Vue) {
  Vue.prototype._render = function () {
    const vm = this;
    const render = vm.$options.render();
    const vNode = render.call(this);
    return vNode;
  }
}
