
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
function flushCallbacks(){
  // callbacks.forEach(cb => cb());
  // callbacks = []
  while(callbacks.length >0){
    let cb = callbacks.shift();
    cb();
  }
  pending = false;
  
}

let timerFunc;
if(Promise){
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks)  // 异步里更新。
  }
}else if(MutationObserver){
  // 微任务  可以监控DOM的变化 监控完毕之后是异步更新
  let observe = new MutationObserver(flushCallbacks);
  let textNode = document.createTextNode(1);
  observe.observe(textNode,{characterData:true});
  // 监控文本结点，当队列清空时，手动修改文本结点的值，触发变化，那么它会调用flushCallbacks
  timerFunc = () => {
    textNode.textContent = 2;
  }
}else if(setImmediate){
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
}else{
    timerFunc = () => {
      setTimeout(flushCallbacks)
    }
}

let pending = false;  // 因为内部会调用nextTick，用户也会调用nextTick。但是异步只需要一次。
export function nextTick(cb){
  callbacks.push(cb);
  // console.log("nextTick:",callbacks.length)
  if(!pending){
    timerFunc(); // timerFunc就是一个异步方法
    pending = true;
  }
}