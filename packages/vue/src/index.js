import { initMixin } from "./init.js"
import { lifecycleMixin } from "./lifecycle.js";
import { stateMixin } from "./state.js";
import { renderMixin } from "./vdom/index.js";


function Vue(options) {
  this._init(options)
}


initMixin(Vue);
lifecycleMixin(Vue);   // 混合生命周期
renderMixin(Vue);    // 渲染虚拟DOM
stateMixin(Vue);     // nexttick



import { compileToFunctions } from "./compiler/index.js"
import { createElm, patch } from "./vdom/patch.js"
const vm1 = new Vue({
  data: { name: "111" }
});
const vm2 = new Vue({});
let template = `<div id = "my" class = "hello"> </div>`
let render1 = compileToFunctions(template)
let vnode1 = render1.call(vm1);
setTimeout(() => {
  document.body.appendChild(createElm(vnode1));
  let template2 = `<div id = "my2" aaa = "xxx" style = {color:red}><span>123456</span></div>`
  let render2 = compileToFunctions(template2)
  let vnode2 = render2.call(vm2);
  setTimeout(() => {
    patch(vnode1, vnode2)
  },1000)
  
}, 0)



export default Vue;
