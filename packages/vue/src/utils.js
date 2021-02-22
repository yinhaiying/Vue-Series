
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



let callbacks = [];
function flushCallbacks() {
  // callbacks.forEach(cb => cb());
  // callbacks = []
  while (callbacks.length > 0) {
    let cb = callbacks.shift();
    cb();
  }
  pending = false;

}

let timerFunc;
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks)  // 异步里更新。
  }
} else if (MutationObserver) {
  // 微任务  可以监控DOM的变化 监控完毕之后是异步更新
  let observe = new MutationObserver(flushCallbacks);
  let textNode = document.createTextNode(1);
  observe.observe(textNode, { characterData: true });
  // 监控文本结点，当队列清空时，手动修改文本结点的值，触发变化，那么它会调用flushCallbacks
  timerFunc = () => {
    textNode.textContent = 2;
  }
} else if (setImmediate) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks)
  }
}

let pending = false;  // 因为内部会调用nextTick，用户也会调用nextTick。但是异步只需要一次。
export function nextTick(cb) {
  callbacks.push(cb);
  // console.log("nextTick:",callbacks.length)
  if (!pending) {
    timerFunc(); // timerFunc就是一个异步方法
    pending = true;
  }
}


const strats = {};
// 合并data的方法
// strats.data = function (parentVal, childVal) {
//   // TODO: 合并data
//   return childVal
// }
// 合并computed的方法
strats.computed = function () {

}

strats.components = function (parentVal, childVal) {
  const res = Object.create(parentVal);
  // 如果儿子有值，那么就先从儿子身上找。
  if (childVal) {
    for (let key in childVal) {
      res[key] = childVal[key]
    }
  };
  return res;
}

function mergeHook(parentVal, childVal) {
  // 合并生命周期的方法
  if (childVal) {
    if (parentVal) {
      return parentVal.concat(childVal);   // 父亲和儿子需要进行拼接
    } else {
      return [childVal]  // 儿子需要转换成数组  [created]
    }
  } else {
    return parentVal;  // 不需要合并
  }
}




export const LIFECYCLE_HOOKS = [
  "beforeCreate", "created", "beforeMount", "mounted",
  "beforeUpdate", "updated", "beforeDestroy", "destroyed"
];
LIFECYCLE_HOOKS.forEach((hook) => {
  strats[hook] = mergeHook
})
export function mergeOptions(parent, child) {
  const options = {};
  // 父亲有的需要处理
  for (let key in parent) {
    mergeField(key)
  }
  // 父亲没有，儿子有的需要合并到父亲身上
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key)
    }
  }
  function mergeField(key) {
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      if (child[key]) {
        options[key] = child[key]
      } else {
        options[key] = parent[key]
      }

    }
  }
  return options;
}



// 是否是一个标签

function makeMap(str) {
  const mapping = {};
  const list = str.split(",");
  list.forEach((item) => {
    mapping[item] = true;
  });
  return (key) => {
    return mapping[key];
  }
}
export const isReservedTag = makeMap(
  'a,div,img,image,text,span,p,button,input,textarea,ul,li,ol,section,header,footer,main'
)
