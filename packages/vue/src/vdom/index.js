


export function renderMixin(Vue) {
  // 创建元素 _c:create
  Vue.prototype._c = function () {
    return createElement(...arguments)
  }
  // 创建文本元素 _v
  Vue.prototype._v = function (text) {
    return createTextVNode(text)
  }
  // _s:stringify
  Vue.prototype._s = function (val) {
    return val === null ? "" :
      typeof val === "object" ? JSON.stringify(val) : val;
  }
  Vue.prototype._render = function () {
    const vm = this;
    const render = vm.$options.render;
    const vNode = render.call(this);
    console.log("vNode:", vNode)
    return vNode;
  }
}


// _c("div",{},child1,child2,child3)
//创建虚拟dom
function createElement(tag, data = {}, ...children) {
  return vNode(tag, data, data.key, children)
}

// 创建虚拟文本
function createTextVNode(text) {
  return vNode(undefined, undefined, undefined, undefined, text)
}


// 用来产生虚拟DOM
function vNode(tag, data, key, children, text) {
  return {
    tag,
    data,
    key,
    children,
    text
  }
}
