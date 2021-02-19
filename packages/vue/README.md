# 实现一个简易的 Vue 库

## 总结：

Vue 的渲染流程：

1. 先初始化数据 initState，包括 initProps,initMethod,initData,initComputed,initWatch 等。
2. 将模板进行编译 无论是通过 render 函数，还是通过 template 还是默认的，都需要编译成一个 render 函数。
3. 调用 render 函数生成虚拟 DOM，然后再渲染成真实的 DOM.展示到页面。

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

1. 对数组的每个对象进行劫持
2. 重写数组的 push,pop 等方法

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

### 渲染数据

Vue 渲染的操作：

1. 默认会查找 render 方法，
2. 如果 render 方法如果不存在，查找 template 属性
3. 如果 render 和 template 都不存在，找当前挂载的 el 的元素内容进行渲染
   **render**

```js
const vm = new Vue({
  el: "#app",
  data() {
    return {
      a: 1,
    };
  },
  render(h) {
    return h("div", { id: "oDiv" }, "hello");
  },
});
```

**template**

```js
const vm = new Vue({
  el: "#app",
  data() {
    return {
      a: 1,
    };
  },
  template: "<div id = 'div'>hello</div>",
});
```

事实上，无论用户用的是 template 还是默认的内容，最终都会转化成一个 render 方法，挂载到 vm.options 身上，统一处理这个 render 方法。

```js
  // 实现挂载操作
  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);
    if (!options.render) {
      //没有render,将template转化成render
      let template = options.template;
      if (!template && el) {
        template = el.outerHTML;
        const render = compileToFunctions(template);
        options.render = render;
        console.log("template:", template)
      }
      // 有template
    }
    // 有render
    // 最终渲染时，实际上用的都是render方法，要么是用户定义的，要么是我们转化的
  }
}
```

## 数据更新

### 正常数据更新

到上面为止，我们只是实现了页面从初始化到渲染完成整个流程。但是如果数据发生变化，虽然数据被劫持了，实际上已经发生了变化，但是它不会被更新到页面中。

```js
setTimeout(() => {
  vm.name = ",world";
}, 2000);
```

如上所示，我们通过 vm.name 修改 data 中的属性 name，由于 data 对象被劫持了，因此 name 已修改，它就被修改了，但是我们的页面的渲染需要重新渲染，也就是我们还是需要走 render，update 这个流程。

```js
setTimeout(() => {
  vm.name = ",world";
  vm._update(vm.render());
}, 2000);
```

通过调用 vm.\_update 和 vm.\_render 方法我们就能够实现数据的更新。但是我们不可能让用户每次修改完数据之后，再手动去调用 update 和 render 方法，因此，我们需要设置当数据变化时，能够自动 render 和 update。
vue 的更新策列是以组件为单位的，给每个组件都增加了一个 watcher,属性变化后会重新调用这个 watcher(渲染 watcher)。
挂载的时候，以前是直接通过 vm.\_update(vm.\_render())直接渲染，现在改成在 watcher 中实现。
挂载时，定义的是一个全局的 watcher。这个 watcher 会在当前组件的所有属性中使用。

```js
export function mountComponent(vm, el) {
  let updateComponent = () => {
    vm._update(vm._render());
  };
  // 将原来的更新放到updateComponent中，传给watcher
  let watcher = new Watcher(vm, updateComponent, () => {}, true);
}
```

watcher 类：

```js
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
    this.id = id++; // watcher唯一标识
    if (typeof exprOrFn === "function") {
      this.getter = exprOrFn;
    }
    this.get(); // 创建watcher实例时，默认会执行
  }
  get() {
    this.getter();
  }
}
```

如上所示，是 watcher 类中接收 updateComponent，然后渲染。接下来我们需要做的是依赖收集。

1. 在通过 defineProperty 的时候，给每个属性增加一个 dep
2. 把这个渲染 watcher 放到 Dep.target 身上。
3. 开始渲染，页面取值会调用到 get 方法，需要让这个属性的 dep 存储当前的 watcher
4. 页面中所需要的属性都会将这个 watcher 存到自己的 dep 中
5. 等属性更新了，就会重新调用渲染逻辑，通知自己存储的 watcher 来更新。

```js
function defineReactive(data, key, value) {
  // 在拦截属性的时候，给每个属性都加一个dep
  // 当页面取值时，说明这个值用来渲染了。将这个watcher和这个属性对应起来
  let dep = new Dep();
  observe(value);
  Object.defineProperty(data, key, {
    get() {
      // 依赖收集,每次把这个watcher存储起来
      if (Dep.target) {
        dep.depend();
      }
      return value;
    },
    set(newValue) {
      observe(newValue);
      if (newValue === value) return;
      value = newValue;
      // 依赖更新
      dep.notify();
    },
  });
}
```

### 如果是数组更新

我们都知道，直接操作数组的索引和长度都不会导致数组更新。只有 push,pop,unshift,shift 等操作才会导致数组更新。因此，我们需要在进行 push,pop,unshift 等操作时进行更新。而更新都是调用 watcher 实现的。之前是每个属性通过一个 dep 记录 watcher，但是现在数组的元素没有被拦截，无法用来记录 watcher，因此只能用给整个数组定义一个 dep 来记录 watcher。

```js
class Observer {
  constructor(value) {
    // 这里定义一个dep用来记录watcher，它可能不仅仅是数组，还可能是对象。

    this.dep = new Dep(); // 给{}或者[]添加dep

    defineProperty(value, "__ob__", this);
    if (Array.isArray(value)) {
      value.__proto__ = arrayMethods;
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }
}
```

然后在使用数组时，也就是触发 get 的时候，将 watcher 保存到 dep 中。

```js
function defineReactive(data, key, value) {
  // 在拦截属性的时候，给每个属性都加一个dep
  // 当页面取值时，说明这个值用来渲染了。将这个watcher和这个属性对应起来
  let dep = new Dep();

  // childDep是元素的返回值，如果value还是对象，那么继续observe
  let childDep = observe(value);
  Object.defineProperty(data, key, {
    get() {
      if (Dep.target) {
        dep.depend();
        // 如果有dep，那就将dep
        if (childDep.dep) {
          // 看这里
          childDep.dep.depend(); // 数组存储了渲染watcher。
        }
      }
      return value;
    },
    set(newValue) {
      console.log(`用户设置值${key}`);
      observe(newValue);
      if (newValue === value) return;
      value = newValue;
      dep.notify();
    },
  });
}
```

然后在调用 push,pop 等方法时，Notify 即可。

```js
methods.forEach((method) => {
  arrayMethods[method] = function(...args) {
    const result = oldArrayProtoMethods[method].apply(this, args);
    console.log("数组方法被调用了");
    let inserted;
    switch (method) {
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
    this.__ob__.dep.notify(); // 通知数组更新
    return result;
  };
});
```

### 异步更新

我们到目前为止，实现了对象和数组的更新。但是，每次修改数据都会触发一下更新。如下所示：

```js
console.log("vm.arr:", vm.arr.push("4"));
console.log("vm.arr:", vm.arr.push("5"));
console.log("vm.arr:", vm.arr.push("6"));
console.log("vm.arr:", vm.arr.push("7"));
vm.name = 300;
```

我们修改了 5 次数据，触发了五次更新。这么频繁地更新，如果页面数据多，那么肯定会带来性能的问题。因此，
最好的解决办法是，将这些更新，放到一起作为一次更新，批处理。这就是 Vue 的非常重要的 nextTick。
批处理操作的实现：
如果 watcher 的 id 相同，表示操作的是同一个组件，这时候可以只更新一次,由于数据时被劫持的，因此只要修改就实际上已经改变了，也就是已经得到最新的值了，只是我们不希望每次改变都重新渲染。将所有的不同的 id 的 watcher 放入队列中。等待这一次所有的 watcher 都进入队列之后,这是一个同步操作，再在异步操作中批处理这些 watcher。也就是调用他们的 get 方法进行更新。

```js
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
    if (!pending) {
      // 如果还没有清空队列就不要再开定时器了——防抖
      setTimeout(() => {
        queue.forEach((watcher) => watcher.run());
        queue = [];
        has = {};
      }, 0);
      pending = true;
    }
  }
}
```

但是，直接使用 setTimeout 开定时器实现异步，存在一些问题，如果用户也使用其他定时器，异步操作，那么可能无法明确地区分异步的执行先后顺序，这会带来问题。这时候我们需要处理下异步的执行。将异步操作放入一个队列中，按照先后顺序执行(下一个异步操作需要拿到前一个的值)，而且我们需要使用其他的更好的异步方法来代替 setTimeout。

```js
const callbacks = [];
function flushCallbacks() {
  callbacks.forEach((cb) => cb());
  pending = false;
  callbacks = [];
}

let timerFunc;
if (Promsie) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks); // 异步里更新。
  };
} else if (MutationObserver) {
  // 微任务  可以监控DOM的变化 监控完毕之后是异步更新
  let observe = new MutationObserver(flushCallbacks);
  let textNode = document.createTextNode(1);
  observe.observe(textNode, { characterData: true });
  // 监控文本结点，当队列清空时，手动修改文本结点的值，触发变化，那么它会调用flushCallbacks
  timerFunc = () => {
    textNode.textContent = 2;
  };
} else if (setImmediate) {
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks);
  };
}

let pending = false; // 因为内部会调用nextTick，用户也会调用nextTick。但是异步只需要一次。
export function nextTick(cb) {
  callbacks.push(cb);
  if (!pending) {
    timerFunc(); // timerFunc就是一个异步方法
    pending = true;
  }
}
```

使用 timerFunc 做兼容，替代原来的 setTimeout，得到一个异步函数(始终是一个异步函数，这里是得到几种异步函数的兼容实现方法罢了)。

## watch 的实现

在 vue 中 watch 是用来观察一个数据是否发生变化。它可以有非常多的写法,如下所示：

```js
watcher:{
  // 数组写法 handler是一个数组
  a:[
    function(newValue,oldValue){},
    function(newValue,oldValue){}
  ],
  // handler是一个函数
  b:function(){},
  // handler是一个对象
  c:{
    handler:function(){},
    deep:true
  }
}
```

因此，我们需要统一将其转化成 key:handler 这种形式，方便调用。

```js
function initWatch(vm) {
  let watch = vm.$options.watch;
  for (let key in watch) {
    const handler = watch[key]; // 可能是数组，字符串，对象，函数。
    // 如果是数组，就循环调用
    if (Array.isArray(handler)) {
      handler.forEach((handle) => {
        createWatcher(vm, key, handler);
      });
    } else {
      // 其他形式
      createWatcher(vm, key, handler);
    }
  }
}
```

最后我们需要将所有的都交给\$watch 来处理。

```js
function createWatcher(vm, exprOrFn, handler, options) {
  // options是用来标记用户的传参，当是对象类型时适用。
  // a:{ handler:function(){},deep:true
  if (typeof handler === "object" && handler !== null) {
    options = handler;
    handler = handler.handler; // 是一个函数
  }
  if (typeof handler === "string") {
    handler = vm[handler];
  }
  // 最终都是通过$watch进行调用
  return vm.$watch(exprOrFn, handler, options);
}
```

因此，最终的核心就是实现\$watch 方法。
\$watch 的实现，实际上也是创建一个 watcher(这就是前面说的为什么 dep 和 watch 都是多对多的关系)
核心实现还是在 watcher 上。

```js
Vue.prototype.$watch = function(exprOrFn, cb, options) {
  // 数据应该依赖这个watcher,数据变化后立即更新
  let watcher = new Watcher(this, exprOrFn, cb, { ...options, user: true });
  if (options && options.immediate) {
    cb(); // 如果是immediate 立即执行
  }
};
```

## DOM-DIFF

我们目前每次更新都是创建一个新的虚拟 DOM，然后把旧的 DOM 删除，再将虚拟 DOM 插入到父元素上。
如下所示：

```js
export function patch(oldVnode, vnode) {
  let el = createElm(vnode); // 创建一个新的元素
  let parentElm = oldVnode.parentNode; // 生成真实的DOM
  parentElm.insertBefore(el, oldVnode.nextSibling); // 将真实DOM插入到老的DOM后面
  parentElm.removeChild(oldVnode); // 删除老的DOM结点
  return el;
}
```

但是这样的操作，实际上非常消耗性能，因为如果 DOM 结点比较多，比如 100 个 DOM 结点，但是只是修改了其中一个，完全没必要全部操作这些结点。因此，最好的方法就是比较前后差异，然后选择性更新，这就是 DOM DIFF。

DOM DIFF 的规则

1. 如果标签不同，直接替换
2. 如果标签相同，但是是文本结点，直接替换掉之前的文本内容即可。
3. 如果标签相同，且不是文本结点，那么需要比较标签的属性和 children 了。

- 标签相同，复用标签，将两者的差异更新到原来的标签上即可。

注意：所有的DOM Diff不是说两个虚拟DOM比较，最后得到一个比较后的差异虚拟DOM。
而是根据虚拟DOM的差异，直接通过虚拟DOM身上的el(这是一个真实DOM)，直接根据他们的
差异进行设置。比如，新的虚拟DOM没有子元素，那么直接操作el(即原来的标签)删除子元素即可。
也就是说**比较的结果最终都需要通过el来进行操作**
### 属性比较

- 属性比对：
  - 老的有，新的没有，删除老的
  - 新的有，直接用新的
  - 特殊处理下 style,class 等

```js
function updateProperties(vnode, oldProps = {}) {
  console.log("update:", vnode);
  let newProps = vnode.data || {};
  let el = vnode.el;
  // 老的有，新的没有。 删除属性
  for (let key in oldProps) {
    if (!newProps[key]) {
      el.removeAttribute(key);
    }
  }

  let newStyle = newProps.style || {};
  let oldStyle = oldProps.style || {};
  // 老的样式中有，新的没有，删除老的样式
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = "";
    }
  }
  // 新的有，直接用新的
  for (let key in newProps) {
    if (key === "style") {
      for (let styleName in newProps[key]) {
        el.style[styleName] = newProps.style[styleName];
      }
    } else if (key === "class") {
      el.className = newProps["class"];
    } else {
      // console.log("el:", el)
      el.setAttribute(key, newProps[key]);
    }
  }
}
```

### 子元素比较

1. 老的有 children，新的没有 children。删除原来的 children 即可
2. 老的没有 children,新的有 children，保留新的 children 即可
3. 老的和旧的都有 children diff 算法
