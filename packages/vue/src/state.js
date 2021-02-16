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
function initData(vm) { }
function initComputed(vm) { }
function initWatch(vm) { }

