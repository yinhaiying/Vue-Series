/*
vue 的更新策列是以组件为单位的，给每个组件都增加了一个 watcher,
属性变化后会重新调用这个 watcher(渲染 watcher)。因此，每个watcher需要一个唯一的标识


*/

import { popTarget, pushTarget } from "./dep";


let id = 0;
class Watcher {
  // vm实例
  // expoOrFn  vm._update(vm._render()) 渲染更新的执行函数
  // cb更新后的回调
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm;
    this.exprOrFn = exprOrFn;
    this.cb = cb;
    this.options = options;
    this.id = id++;  // watcher唯一标识
    if (typeof exprOrFn === "function") {
      this.getter = exprOrFn;
    }
    this.get();   // 创建watcher实例时，默认会执行
  }
  get() {
    pushTarget(this);
    this.getter();
    popTarget()
  }
  update() {
    this.get();
  }
}


export default Watcher;
