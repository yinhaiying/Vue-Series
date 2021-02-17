
class Observer {
  constructor(value) {
    //使用Object.defineProperty重新定义属性
    this.walk(value);
  }
  walk(data) {
    let keys = Object.keys(data);
    keys.forEach((key) => {
      defineReactive(data, key, data[key]);
    })
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
    return;
  }
  return new Observer(data)
}
