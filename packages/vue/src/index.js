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
let template = `<div id = "my">123456</div>`
let render1 = compileToFunctions(template)
let vnode1 = render1.call(vm1);


setTimeout(() => {
  document.body.appendChild(createElm(vnode1));
  let template2 = `<div id = "my2"></div>`
  let render2 = compileToFunctions(template2)
  let vnode2 = render2.call(vm2);
  patch(vnode1, vnode2)
}, 1000)



export default Vue;
