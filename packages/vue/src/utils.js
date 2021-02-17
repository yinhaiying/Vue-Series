
/*
属性的代理
*/
export function proxy(vm, data, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[data][key];
    },
    set(newValue) {
      vm[data][key] = newValue;
    }
  })
}


// 通过defineProperty设置不可枚举的属性值
export function defineProperty(target, key, value) {
  Object.defineProperty(target, key, {
    enumerable: false,   // 不能被枚举
    configurable: false, //不可被修改的
    value: value
  });
}

