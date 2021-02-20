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
    this.user = options.user;  // 用户定义的watcher
    this.lazy = options.lazy;  // 如果属性上有lazy属性，说明是一个计算属性。
    this.dirty = this.lazy;    // dirty代表取值时，是否要执行用户的方法
    this.id = id++;  // watcher唯一标识
    this.deps = [];  // watcher记录有多少个依赖项，比如name,age
    this.depsId = new Set();   // set用来存放id确保唯一性
    if (typeof exprOrFn === "function") {
      this.getter = exprOrFn;
    } else {
      // 这里的exprOrFn是字符串表达式 "info.name"。我们需要取到它对应的值
      // vm.info.name
      this.getter = function () {

        let path = exprOrFn.split(".");
        let obj = vm;
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]]
        }
        return obj;
      }
    }
    // 创建watcher实例时，默认会执行
    // 调用get方法就是进行一次取值操作
    this.value = this.lazy ? void 0 : this.get();
  }
  get() {
    pushTarget(this);
    let result = this.getter.call(this.vm);
    
    popTarget();
    return result;
  }
  update() {
    if(this.lazy){  // lazy为true，说明是计算属性，计算属性更新，只需要把dirty变成true即可。
      this.dirty = true;  // 页面重新渲染的时候，就能够重新获取值了。
    }else{
      // 这里每次调用，都会触发get方法，实现一次更新，我们不希望如此频繁的更新。
      queueWatcher(this); // 暂存
      // this.get();
    }
  }
  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      // dep在把对应的watcher拿到，然后存进去
      dep.addSub(this);
    }
  }
  run() {
    let newValue = this.get();
    let oldValue = this.value;
    this.value = newValue;
    if (this.user) {
      this.cb.call(this.vm, newValue, oldValue);
    }
  }
  evaluate(){
    this.value = this.get();
    this.dirty = false;
  }
  depend(){
    let i = this.deps.length;
    console.log("this.deps:",this.deps)
    // 通过watcher能够找到所有dep。然后让所有的dep都记住这个渲染watcher
    while(i--){
      this.deps[i].depend();   // 让dep去存储渲染watcher。
    }
  }
}
let queue = [];
let has = {};
let pending = false;
function queueWatcher(watcher) {
  // 如果是相同的watcher，那么只需要触发一次即可。
  const id = watcher.id;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;

    // 异步更新,等待所有同步代码执行完毕之后再次执行
    if (!pending) {  // 如果还没有清空队列就不要再开定时器了
      nextTick(flushSchedulerQueue)
    }
  }
}

function flushSchedulerQueue() {
  queue.forEach((watcher) => {
    // 只有是渲染watcher的时候，才调用。
    // 用户定义的watcher，是值修改时才调用。
    watcher.run();
    if (!watcher.user) {
      watcher.cb();
    }
  });
  queue = [];
  has = {};
  pending = true;
}


export default Watcher;
