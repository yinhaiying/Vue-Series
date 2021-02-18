

/*
Dep：用来收集组件中的数据和watch之间的对应关系，很多个属性对应一个watch。一个组件
也可以有多个watcher。比如，默认会有一个watcher，如果用户使用vm.$watch("name")又会产生一个watcher。



*/
class Dep {
  constructor() {
    this.subs = [];
  }
  depend() {
    this.subs.push(Dep.target)
  }
  notify() {
    this.subs.forEach((watcher) => watcher.update())
  }

}
Dep.target = null;
export function pushTarget(watcher) {
  Dep.target = watcher;
}
export function popTarget() {
  Dep.target = null;
}

export default Dep
