// 数组原型上的方法
let oldArrayProtoMethods = Array.prototype;


// 继承这些方法

export let arrayMethods = Object.create(oldArrayProtoMethods);

let methods = [
  "push", "pop", "unshift", "shift", "reverse", "sort", "splice"
]
methods.forEach(method => {
  arrayMethods[method] = function (...args) {
    // 首先实现原来的方法的功能，也就是调用原来的方法
    const result = oldArrayProtoMethods[method].apply(this, args);
    console.log("数组方法被调用了")
    let inserted;
    switch (method) {
      // 数组的新增方法，可能新增对象类型，这个对象类型必须被拦截
      case "push":
      case "shift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2)
    }
    if (inserted) {
      this.__ob__.observeArray(inserted);
    }
    this.__ob__.dep.notify();   // 通知数组更新
    return result;
  }
})
