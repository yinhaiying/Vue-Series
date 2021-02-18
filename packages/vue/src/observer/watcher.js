/*
vue 的更新策列是以组件为单位的，给每个组件都增加了一个 watcher,
属性变化后会重新调用这个 watcher(渲染 watcher)。因此，每个watcher需要一个唯一的标识


*/

import { nextTick } from "../utils";
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
    this.deps = [];  // watcher记录有多少个依赖项，比如name,age
    this.depsId = new Set();   // set用来存放id确保唯一性
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
    // 这里每次调用，都会触发get方法，实现一次更新，我们不希望如此频繁的更新。
    // 
    queueWatcher(this);  // 暂存
    // this.get();
  }
  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(id);
      this.depsId.add(id);
      // dep在把对应的watcher拿到，然后存进去
      dep.addSub(this);
    }
  }
  run(){
    this.get();
  }
}
let queue = [];
let has = {};
let pending = false;
function queueWatcher(watcher){
  // 如果是相同的watcher，那么只需要触发一次即可。
  const id = watcher.id;
  if(!has[id]){
    queue.push(watcher);
    has[id] = true;

    // 异步更新,等待所有同步代码执行完毕之后再次执行
    if(!pending){  // 如果还没有清空队列就不要再开定时器了
      nextTick(flushSchedulerQueue)
    }
  }
}

function flushSchedulerQueue(){
  console.log("flushSchedule")
  queue.forEach((watcher) => watcher.run());
  queue = [];
  has = {};
  pending = true;
}


export default Watcher;
