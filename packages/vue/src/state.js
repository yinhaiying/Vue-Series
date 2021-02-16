import { observe } from "./observer/index.js";

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
    initComputed(vm)
  }
}


function initProps(vm) { }
function initMethods(vm) { }
function initData(vm) {
  let data = vm.$options.data;
  data = typeof data === "function" ? data.call(vm) : data;
  // 数据的劫持
  // 对象 Object.defineProperty
  // 数组 对象里面嵌套数组
  observe(data);
}
function initComputed(vm) { }
function initWatch(vm) { }

