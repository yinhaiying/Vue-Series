import Watcher from "./observer/watcher";
import { patch } from "./vdom/patch"

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this;
    console.log("update:", vnode)

    // 用新的创建的元素替换原有的$el
    vm.$el = patch(vm.$el, vnode)
  }
}

export function mountComponent(vm, el) {
  // 先调用render方法创建虚拟节点，再将虚拟结点渲染到页面上

  let updateComponent = () => {
    vm._update(vm._render())
  }
  // watcher时用于渲染 true表示是一个渲染watcher，只是一个名字而已
  let watcher = new Watcher(vm, updateComponent, () => { }, true);

}
