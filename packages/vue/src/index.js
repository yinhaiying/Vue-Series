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
let template = `<ul id = "my" class = "hello">
    <li key = "A" style = "background:red">A</li>  
    <li key = "B" style = "background:green">B</li> 
    <li key = "C" style = "background:yellow">C</li>
    </ul>`
let render1 = compileToFunctions(template)
let vnode1 = render1.call(vm1);
setTimeout(() => {
  document.body.appendChild(createElm(vnode1));
  let template2 = `<ul>
    <li key = "E" style = "background:pink">E</li>
    <li key = "A" style = "background:red">A</li>
    <li key = "B" style ="background:green">B</li>
    <li key = "C" style = "background:yellow">C</li>
  </ul>`
  let render2 = compileToFunctions(template2)
  let vnode2 = render2.call(vm2);
  setTimeout(() => {
    patch(vnode1, vnode2);
  },1000)
}, 0)



export default Vue;
