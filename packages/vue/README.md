# 实现一个简易的 Vue 库

## 初始化 init

初始化需要做两件事：

1. 将 options 选项挂载到实例身上
2. 初始化实例身上的数据

### 源码中初始化的实现：

源码中是通过定义一个 initState 方法，这个方法用于初始化实例身上的数据。然后分别处理,props,methods,data,computed 和 watch。

```js
export function initState(vm: Component) {
  vm._watchers = [];
  const opts = vm.$options;
  if (opts.props) initProps(vm, opts.props);
  if (opts.methods) initMethods(vm, opts.methods);
  if (opts.data) {
    initData(vm);
  } else {
    observe((vm._data = {}), true /* asRootData */);
  }
  if (opts.computed) initComputed(vm, opts.computed);
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}
```

因此，我们仿照着这种这种实现方式：

```js
export function initState(vm) {
  const opts = vm.$options;
  if (opts.props) {
    initProps(vm);
  }
  if (opts.methods) {
    initMethods(vm);
  }
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
  if (opts.watch) {
    initComputed(vm);
  }
}
```

### initData

初始化 data 部分，主要是实现对 data 的拦截。

```js
function initData(vm) {
  let data = vm.$options.data;
  vm._data = data = typeof data === "function" ? data.call(vm) : data;
  // 数据的劫持
  // 对象 Object.defineProperty
  // 数组 对象里面嵌套数组
  observe(data);
}
```

所有的拦截都通过一个 Observer 类来处理

```js
class Observer {
  constructor(value) {
    //使用Object.defineProperty重新定义属性
    this.walk(value);
  }
  walk(data) {
    let keys = Object.keys(data);
    keys.forEach((key) => {
      defineReactive(data, key, data[key]);
    });
  }
}

function defineReactive(data, key, value) {
  // 如果value还是对象，那么继续observe
  observe(value);
  Object.defineProperty(data, key, {
    get() {
      console.log(`用户获取值${key}`);
      return value;
    },
    set(newValue) {
      console.log(`用户设置值${key}`);
      // 如果用户将值改为对象，继续监控。
      observe(newValue);
      if (newValue === value) return;
      value = newValue;
    },
  });
}

export function observe(data) {
  if (typeof data !== "object" || data === null) {
    return;
  }
  return new Observer(data);
}
```

#### 对数组的拦截

由于 Object.defineProperty 没办法实现对数组中新增元素的拦截。如下所示：

```js
const a = [1, 2, 3];
// 假设这个a我们已经实现了拦截，接下来我们给a添加数据
a.push(4);
// 新增的数据 4 没办法监听到。因为Object.defineProperty要监听的数据是必须在一开始就设置好的。
```

因此，为了解决这个问题，我们需要重写数组的 push,pop,unshift,shift,splice 等这些方法，让它们在操作时也能够监听到变化。

```js
class Observer {
  constructor(value) {
    // 判断一个对象是否被检测过，给这个对象新增__ob__属性，但是需要设置它不可枚举
    // 因为这个值是一个类的实例，实力身上有非常多的属性以及原型上的属性，不需要被拦截，
    // 否则会一直枚举它的属性，陷入死循环
    Object.defineProperty(value, "__ob__", {
      enumerable: false, // 不能被枚举
      configurable: false,
      value: this, // 这个this就是observer的实例，用于获取它身上的方法
    });

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
    });
  }
  // 拦截数组中的对象
  observeArray(value) {
    value.forEach((item) => {
      observe(item);
    });
  }
}
```

重写 push,pop 等数组方法

```js
// 数组原型上的方法
let oldArrayProtoMethods = Array.prototype;

// 继承这些方法

export let arrayMethods = Object.create(oldArrayProtoMethods);
let methods = ["push", "pop", "unshift", "shift", "reverse", "sort", "splice"];
methods.forEach((method) => {
  arrayMethods[method] = function(...args) {
    // 首先实现原来的方法的功能，也就是调用原来的方法
    const result = oldArrayProtoMethods[method].apply(this, args);
    let inserted;
    switch (method) {
      // 数组的新增方法，可能新增对象类型，这个对象类型必须被拦截
      case "push":
      case "shift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
    }
    if (inserted) {
      this.__ob__.observeArray(inserted);
    }
    return result;
  };
});
```
