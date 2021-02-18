
import { arrayMethods } from "./array.js"
import { defineProperty } from "../utils.js"
import Dep from "./dep.js";
class Observer {
  constructor(value) {

    this.dep = new Dep();  // 给{}或者[]添加dep

    // 判断一个对象是否被检测过，给这个对象新增__ob__属性，但是需要设置它不可枚举
    // 因为这个值是一个类的实例，实力身上有非常多的属性以及原型上的属性，不需要被拦截，
    // 否则会一直枚举它的属性，陷入死循环
    defineProperty(value, "__ob__", this)

    if (Array.isArray(value)) {
      value.__proto__ = arrayMethods;
      // 观测数组中的对象类型  arr = [{a:1}]
      this.observeArray(value);
    } else {
      //使用Object.defineProperty重新定义属性
      this.walk(value);
    }
  }
  // 拦截对象
  walk(data) {
    let keys = Object.keys(data);
    keys.forEach((key) => {
      defineReactive(data, key, data[key]);
    })
  }

  observeArray(value) {
    value.forEach((item) => {
      observe(item);
    });
  }
}

function defineReactive(data, key, value) {
  // 在拦截属性的时候，给每个属性都加一个dep
  // 当页面取值时，说明这个值用来渲染了。将这个watcher和这个属性对应起来
  let dep = new Dep();



  // 如果value还是对象，那么继续observe
  let childDep = observe(value);
  console.log("childDep:",childDep)
  Object.defineProperty(data, key, {
    get() {
      // 依赖收集
      console.log(`用户获取值${key}`);
      if (Dep.target) {
        // 每次把这个watcher
        dep.depend();
        if(childDep.dep){
          childDep.dep.depend();  // 数组存储了渲染watcher。
        }
      }

      return value;
    },
    set(newValue) {
      console.log(`用户设置值${key}`)
      // 如果用户将值改为对象，继续监控。
      observe(newValue);
      if (newValue === value) return;
      value = newValue;
      // 依赖更新
      dep.notify();
    }
  })
}

export function observe(data) {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  if (data.__ob__) {
    return data;
  }
  return new Observer(data)
}
