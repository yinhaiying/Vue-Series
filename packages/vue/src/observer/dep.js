

/*
Dep：用来收集组件中的数据和watch之间的对应关系，很多个属性对应一个watch。一个组件
也可以有多个watcher。比如，默认会有一个watcher，如果用户使用vm.$watch("name")又会产生一个watcher。



*/
let id = 0;
class Dep {
  constructor() {
    // 之所以定义成数组，是因为一个dep也可能对应多个watcher，一般来说一个组件初始化时
    // 每个dep只有一个watcher，但是如果用户使用了vm.$watch()，那么又会创建一个watcher
    // 因此，dep和watch都是多对多的关系。
    this.subs = [];
    this.id = id++;
  }
  depend() {
    // Dep.targer === watcher
    // 实现双向记忆，让watcher记住当前dep，同时让当前dep保存当前watcher。
    Dep.target.addDep(this);
    // this.subs.push(Dep.target)
  }
  notify() {
    this.subs.forEach((watcher) => watcher.update())
  }
  addSub(watcher) {
    //
    this.subs.push(watcher)
  }

}
Dep.target = null;
let stack = [];
export function pushTarget(watcher) {
  Dep.target = watcher;
  stack.push(watcher);   // 有渲染watcher和其他的watcher
}
export function popTarget() {
  stack.pop();
  Dep.target = stack[stack.length -1];
}

export default Dep
