import Vue from "vue";
import Vuex from "@/vuex/index.js";
// import Vuex from "vuex";
import a from "./a.js";
import b from "./b.js";


Vue.use(Vuex);

const store = new Vuex.Store({
    state:{   // data
      name:"hai"
    },
    getters:{   // 计算属性
        myName(state){
            return  state.name + "yingsitan"; 
        }
    },
    mutations:{   // method同步地更改
      setName(state,payload){
        state.name += payload;
      }
    },
    actions:{     // 异步修改完成后将信息提交给mutations
      changeName({commit},payload){
          setTimeout(() => {
            commit("setName",payload)
          },1000)
        //   console.log(dispatch)
      }
    },
    modules:{
      a,
      b
    }
});

export default store;