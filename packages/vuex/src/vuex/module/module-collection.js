

import {forEachValue} from "../../utils"

class ModuleCollection{
  constructor(options){
      this.register([],options);
  }

  register(path,rootModule){
    let newModule = {
        _raw:rootModule,   // 原来的模块
        _children:{},      // 模块的子模块
        // state:rootModule.state  // 当前模块的状态
    }
    if(path.length === 0){
        this.root  = newModule;  // root就是整个store树
    }else{
        // []
        // [a]
        // [b]
        // [a,c]
        let parent = path.slice(0,-1).reduce((memo,current)=>{
            return memo._children[current];
        },this.root);
        console.log("parent:",parent)
        parent._children[path[path.length - 1]] = newModule;
    }
    if (rootModule.modules) {
        forEachValue(rootModule.modules,(module,moduleName) => {
            // [a]
          this.register(path.concat(moduleName),module);
        })
    }
  }
}


export default ModuleCollection;


/* 
  this.root = {
      _raw:"根模块",
      _children:{
        a:{
            _raw:"a模块",
            _children:{},
            state:"a的状态"
        },
        b:{
            _raw:"b模块",
            _children:{},
            state:"b的状态"
        },
      },
      state:"根模块自己的状态"
  }






*/