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

export default Vue;
