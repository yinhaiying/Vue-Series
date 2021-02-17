
export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {

  }
}

export function mountComponent(vm, el) {
  // 先调用render方法创建虚拟节点，再将虚拟结点渲染到页面上
  vm._update(vm._render())
}
