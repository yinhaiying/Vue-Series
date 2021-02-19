import Watcher from "./observer/watcher";
import { patch } from "./vdom/patch"

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this;
    // console.log("_update:更新了几次")
    // 用新的创建的元素替换原有的$el
    // 区分一下是首次渲染还是更新。
    const prevVnode = vm._vnode;  // 第一次vnode不存在
    if(!prevVnode){
      vm.$el = patch(vm.$el, vnode);
    }else{
      vm.$el = patch(prevVnode, vnode);
    }
    vm._vnode = vnode; // 保存旧的vnode
    
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
