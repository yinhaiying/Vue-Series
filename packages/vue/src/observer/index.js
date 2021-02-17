
import { arrayMethods } from "./array.js"
import { defineProperty } from "../utils.js"
class Observer {
  constructor(value) {

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
  // 如果value还是对象，那么继续observe
  observe(value);
  Object.defineProperty(data, key, {
    get() {
      console.log(`用户获取值${key}`)
      return value;
    },
    set(newValue) {
      console.log(`用户设置值${key}`)
      // 如果用户将值改为对象，继续监控。
      observe(newValue);
      if (newValue === value) return;
      value = newValue
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
