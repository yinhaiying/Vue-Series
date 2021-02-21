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

注意：所有的 DOM Diff 不是说两个虚拟 DOM 比较，最后得到一个比较后的差异虚拟 DOM。
而是根据虚拟 DOM 的差异，直接通过虚拟 DOM 身上的 el(这是一个真实 DOM)，直接根据他们的
差异进行设置。比如，新的虚拟 DOM 没有子元素，那么直接操作 el(即原来的标签)删除子元素即可。
也就是说**比较的结果最终都需要通过 el 来进行操作**

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

最复杂的就是老的和旧的都有 children，这时候就需要考虑各种情况。如果直接暴力去比较，那么效率就很低下，需要设计一些算法。其实就是两个数组的比较，由于我们对数组的操作通常是在数组后面添加(push)，在数组前面添加，反转数组等，因此，我们优先考虑这些特殊情况。实现思路如下：

1. 给旧的 children 定义一个头指针和一个尾指针
2. 给新的 children 定义一个头指针和一个尾指针
3. 从后往前比较，如果是添加元素，那么他们前面的 vnode 应该是相同的，只需要将最后一个 vnode 插入即可。
   ![](https://ftp.bmp.ovh/imgs/2021/02/15ea776e78269f52.png)
4. 如果前面不相同，那么从后往前比较，如果是往前添加了结点，那么从后往前结点应该是相同的。只需要操作最前面添加的结点即可。
5. 如果前面比较不相同，后面比较也不相同，那么考虑旧的头指针和新的尾指针是否相同，看是否是出现了翻转。如果相同，那么将旧的头指针移动到最后一个结点后面，然后指针往后移动要给为止，新的尾指针往前移动一个位置。
6. 如果前面比较不相同，后面比较也不相同，旧的头指针和新的尾指针也不相同，那么考虑将新的头指针和旧的尾指针进行比较。看是否出现了翻转。如果相同，将旧的尾指针插入到旧的头指针前面，将尾指针往前移动一个位置，将头指针往后移动一个位置。
   这就是为什么我们不能使用 index 作为 key？

```js
<li key = "0">js</li>                  <li key = "0">html</li>
<li key = "1">css</li>  交换了一下顺序  <li key = "1">css</li>
<li key = "2">html</li>                <li key = "2">js</li>
```

我们可以看下，如果用户翻转了一下，比较时会发现 key 值都不相同了。那么会全都重新创建，而不是通过移动来实现优化。

7. 暴力比较。如果无论是头头比较，头尾比较，尾头比较还是尾尾比较。都没有相同的，那么就只剩下暴力比较了。暴力比较的规则就是：将新结点的值与旧的所有结点比较，如果没有相同的直接插入到旧节点的第一个的前面，如果有相同的就复用，将旧结点移动到原来的第一个的前面,同时它的位置需要保留置为 null 即可。最后将老的没有遍历到的删除即可。

## Computed

Vue 的计算属性 computed，只要一取 computed 中的某个值，他就会执行，因此，它的内部也使用了 Object.defineProperty，内部有一个变量 dirty 控制这个 computed 中的函数是否要执行。同时，computed 是依赖于它内部使用的值，也就是说它也是一个 watcher。内部属性会收集这个 watcher。

1. 给 computed 每个属性加上 Object.defineProperty。将 get 的属性绑定到 vm 身上，其中 get 方法就是我们在 watch 中定义的方法。

```js
const sharedPropertyDefinition = {};
function defineComputed(target, key, userDef) {
  if (typeof userDef === "function") {
    sharedPropertyDefinition.get = userDef;
  } else {
    sharedPropertyDefinition.get = userDef.get;
    sharedPropertyDefinition.set = userDef.set;
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
```

但是，这种方式实现是没有缓存的。每次通过 vm.info 调用一次就执行一次。我们都知道 Vue 中 computed 相比于 watch 的一个重要的区别就是 computed 是有缓存的。解决办法就是定义一个高阶函数，使用一个 dirty 参数来判断是否需要执行用户定义的 computed 方法。

```js
const sharedPropertyDefinition = {};
function defineComputed(target, key, userDef) {
  if (typeof userDef === "function") {
    sharedPropertyDefinition.get = createdComputedGetter(key);
  } else {
    sharedPropertyDefinition.get = createdComputedGetter(key);
    sharedPropertyDefinition.set = userDef.set;
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
```

如上所示，我们不再直接就取用户定义的 computed 方法，而是在外面封装一层，定义成 createdComputedGetter，这个方法的实现如下：

```js
function createdComputedGetter(key) {
  return function() {
    // 此方法才是我们执行的方法。每次取值会调用
    // 这里的this是vm
    const watcher = this._computedWatchers[key]; // 拿到对应属性的watcher。
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate(); // 对当前watcher求职
      }
      return watcher.value;
    }
  };
}
```

我们可以看到，这个方法就是返回一个方法，这是每次都会执行的，但是用户定义的方法是否执行，需要通过 dirty 参数来控制，也就是说我们只需要在 watcher 中定义一个 dirty 属性来控制它的执行就行。在取值时第一次 dirty 为 true，取值后变为 fasle，只要依赖没更新就一直不会执行，而是调用原来的值，也就是缓存的值。只有在 set 的时候，也就是它的依赖更新时将 dirty 变为 true。这样的话就实现了缓存。

```js
  update() {
    if(this.lazy){  // lazy为true，说明是计算属性，计算属性更新，只需要把dirty变成true即可。
      this.dirty = true;  // 页面重新渲染的时候，就能够重新获取值了。
    }else{
      // 这里每次调用，都会触发get方法，实现一次更新，我们不希望如此频繁的更新。
      queueWatcher(this); // 暂存
      // this.get();
    }
  }
```

## compontents

在 vue 的开发过程中，组件化是非常重要的拆分，一方面，每个组件都有一个独立的 watcher，这样的话数据更新时，只更新组件，而不会大批量的更新，从而提升性能。因此，我们需要重点了解 Vue 创建组件的方法。Vue.component()。
组件的渲染流程：

1. 调用 Vue.component
2. 内部用的是 Vue.extend。功能就是生成一个字类继承父类
3. 创建子类实例时，会调用父类的\_init 方法。也就是整个 Vue 的初始化方法。再去\$mount 即可。
4. 组件的初始话就是 new 这个组件的构造函数。比如 new Vue()就是调用 Vue 的构造函数来初始化。
   组件的创建，实际上就是创建一个 Vue 的子类，这个子类通过 Vue.extend 会继承父类身上的属性和方法。
   然后通过\$mount 挂载即可。
5. 创建组件的虚拟结点，需要区分是原生标签还是自定义的组件

```js
export function initExtend(Vue) {
  // 核心就是创建一个字类去继承父类
  Vue.extend = function(extendOptions) {
    const Super = this;
    const Sub = function VueComponent(options) {
      // 父类的初始化。 这里的this是Super
      this._init(options);
    };
    // 子类继承父类原型上的方法
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    // 子类拥有跟父类同样的属性。因为它可能也作为另外的子组件的父类
    Sub.options = mergeOptions(Super.options, extendOptions);

    return Sub;
  };
}
```

### 子组件的查找顺序

我们可以通过 Vue.component 定义子组件，也可以直接通过 components 选项定义组件，那么如果两种方法定义了同一个组件，因该如何查找了。Vue 规定了组件的查找顺序是先查找自身的，自身没有的再去查找原型链上的。

```js
    Vue.component("aa",{
      template:"<div>hello</div>"
    })
    Vue.component("cc",{
      template:"<div>hello</div>"
    })
     const vm = new Vue({
       el:"#app",
       data(){
         return {
           name:"hai",
           age:24
         }
       },
       components:{
         "aa":{
           template:"<div>world</div>"
         }
       },
     }
```

如上面代码所示：同时定义了 aa 组件，使用时优先使用 options 中的 compoennts。这就是我们合并组件的策略。

```js
strats.components = function(parentVal, childVal) {
  const res = Object.create(parentVal);
  // 如果儿子有值，那么就先从儿子身上找。
  if (childVal) {
    for (let key in childVal) {
      res[key] = childVal[key];
    }
  }
  return res;
};
```

### 创建组件的虚拟结点

目前的话，我们的组件渲染时会被直接当成原生标签渲染。这需要我们在创建虚拟 DOM 时做处理。

```js
//创建虚拟dom
function createElement(vm, tag, data = {}, ...children) {
  // 这里的tag可能是组件，<aa></aa>，如果是组件在生成虚拟DOM时，需要把组件的构造函数传入
  // 区分是原生标签还是自定义组件
  if (isReservedTag(tag)) {
    return vNode(tag, data, data.key, children);
  } else {
    // 通过vm找到构造函数
    let Ctor = vm.$options.components[tag];
    // 创建组件的虚拟结点
    return createComponentVnode();
  }
}
```

createComponentVnode 用于生成组件的虚拟 DOM。

```js
function createComponentVnode(vm, tag, data, key, children, Ctor) {
  const baseCtor = vm.$options._base;
  if (typeof Ctor === "object") {
    // 如果是一个对象，也就是用户写在选项中，那么先通过extend生成构造函数。
    Ctor = base.extend(Ctor);
  }
  //给组件增加生命周期，放到属性身上。
  data.hook = {
    init() {},
  };
  return vNode(
    `vue-component-${Ctor.cid}-${tag}`,
    data,
    key,
    undefined,
    undefined,
    { Ctor, children }
  );
}
```

组件的虚拟 DOM 与原生的相比，需要处理两个地方：

1. 组件名称
2. 组件的属性中多了一个 hook 的属性，并且包含了组件的初始化方法
3. 组件的虚拟 DOM 需要传入构造函数，插槽等信息。
