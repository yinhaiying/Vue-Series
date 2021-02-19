import { nextTick, proxy } from "./utils.js";
import { observe } from "./observer/index.js";
import Watcher from "./observer/watcher.js";

export function initState(vm) {
  const opts = vm.$options;
  if (opts.props) {
    initProps(vm)
  }
  if (opts.methods) {
    initMethods(vm)
  }
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
  if (opts.watch) {
    initWatch(vm)
  }
}


function initProps(vm) { }
function initMethods(vm) { }
function initData(vm) {
  let data = vm.$options.data;
  vm._data = data = typeof data === "function" ? data.call(vm) : data;
  for (let key in data) {
    // vm.xxx 相当于去vm._data.xxx上去取值
    proxy(vm, "_data", key)
  }
  // 数据的劫持
  // 对象 Object.defineProperty
  // 数组 对象里面嵌套数组
  observe(data);
}
function initComputed(vm) {
  let computed = vm.$options.computed;
  // 1. 需要有watcher  2. 需要Object.defineProperty  3. dirty属性
  const watchers = vm._computedWatchers = {};// 用来稍后存放计算属性的watcher
  for(let key in computed){
    const userDef = computed[key];
    const getter = typeof userDef === "function"? userDef:userDef.get;
    defineComputed(vm,key,userDef);
    console.log("userDef:", userDef)
  }
  
 }

 const sharedPropertyDefinition = {};
 function defineComputed(target,key,userDef){
   if(typeof userDef === "function"){
     sharedPropertyDefinition.get = userDef;
   }else{
     sharedPropertyDefinition.get = userDef.get;
     sharedPropertyDefinition.set = userDef.set;
   }
   Object.defineProperty(target, key, sharedPropertyDefinition);
 }


function initWatch(vm) {
  let watch = vm.$options.watch;
  for(let key in watch){
    const handler = watch[key];  // 可能是数组，字符串，对象，函数。
    // 如果是数组，就循环调用
    if(Array.isArray(handler)){
      handler.forEach((handle) => {
        createWatcher(vm, key, handler)
      })
    }else{
      // 其他形式
      createWatcher(vm,key,handler)
    }
  }
 }

 function createWatcher(vm,exprOrFn,handler,options){
   // 当传入的是一个对象时，options可以用来接收配置参数
   // a:{ handler:function(){},deep:true
   if(typeof handler === "object" && handler !== null){
    options = handler;
    handler = handler.handler;  // 是一个函数
   }
   if(typeof handler === "string"){
     handler = vm[handler];
   }
   // 最终都是通过$watch进行调用
   return vm.$watch(exprOrFn,handler,options);
 }


export function stateMixin(Vue){
  Vue.prototype.$nextTick = function(cb){
    nextTick(cb);
  }
  Vue.prototype.$watch = function (exprOrFn,cb,options) {
    // 数据应该依赖这个watcher,数据变化后立即更新
    let watcher = new Watcher(this, exprOrFn, cb, {...options,user:true});
    if (options && options.immediate) {
      cb()  // 如果是immediate 立即执行
    }
  }
}

