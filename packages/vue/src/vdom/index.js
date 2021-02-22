import { isReservedTag } from "../utils"



export function renderMixin(Vue) {
  // 创建元素 _c:create
  Vue.prototype._c = function (tag, data = {}, ...children) {

    if (!data.key) {
      data.key = Math.floor(Math.random() * 1000000);
    }
    let result = createElement(this, tag, data, data.key, children);

    return result;
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
    return vNode;
  }
}


// _c("div",{},child1,child2,child3)
//创建虚拟dom
function createElement(vm, tag, data = {}, key, children) {
  // 这里的tag可能是组件，<aa></aa>，如果是组件在生成虚拟DOM时，
  // 需要把组件的构造函数传入
  // _c('div',{id:"app",style:{"color":"red"}}, _v("hello"+_s(name)),_c('span',{id:"my"}, _v("world")),_c('aa',undefined))}
  if (isReservedTag(tag)) {
    return vNode(tag, data, data.key, children, undefined)
  } else {
    // 通过vm找到构造函数
    let Ctor = vm.$options.components[tag];
    // 创建组件的虚拟结点
    return createComponentVnode(vm, tag, data, key, children, Ctor)
  }
}

// 创建虚拟文本
function createTextVNode(text) {
  let textVnode = vNode(undefined, undefined, undefined, undefined, text, undefined);
  return textVnode
}

// 常见组件的虚拟结点  children就是组件的插槽
function createComponentVnode(vm, tag, data, key, children, Ctor) {
  const baseCtor = vm.$options._base;
  if (typeof Ctor === "object") {
    // 如果是一个对象，也就是用户写在选项中，那么先通过extend生成构造函数。
    Ctor = baseCtor.extend(Ctor)
  }
  //给组件增加生命周期，放到属性身上。
  data.hook = {
    init(vnode) {
      let child = vnode.componentInstance = new Ctor({});
      child.$mount(); // 挂载逻辑，组件的$mount方法是不传递参数的
    }
  };
  let component = vNode(`vue-component-${Ctor.cid}-${tag}`, data, key, undefined, undefined, { Ctor, children });
  return component
}


// 用来产生虚拟DOM
function vNode(tag, data, key, children, text, componentOptions) {
  return {
    tag,
    data,
    key,
    children,
    text,
    componentOptions   // 组件的选项。用来保存当前组件的构造函数和插槽
  }
}
