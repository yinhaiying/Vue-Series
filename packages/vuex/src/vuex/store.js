import applyMixin from "./mixin";
import ModuleCollection from "./module/module-collection.js"




export let Vue;
export class Store {
    constructor(options) {
        const state = options.state;
        this._modules = new ModuleCollection(options);
        console.log("_modules:",this._modules)
    }
 


}



export const install = (_Vue) => {
    // _Vue是Vue的构造函数。
    Vue = _Vue;
    applyMixin(Vue)
}