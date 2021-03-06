import Vue from "vue";
import Vuex from "@/vuex/index.js";
// import Vuex from "vuex";
// import a from "./a.js";
// import b from "./b.js";
// import logger from "vuex/dist/logger"

Vue.use(Vuex);

// function presists() {
//   return function (store) {  // store是vuex提供的。
//     let data = localStorage.getItem("VUEX_STATE");
//     if (data) {
//       store.replaceState(JSON.parse(data))
//     }
//     store.subscribe((mutation, state) => {
//       // 每次mutations执行的时候都会触发
//       console.log("..........qqqqqqqqq")
//       localStorage.setItem("VUEX_STATE", JSON.stringify(state))
//     })
//   }
// }

const store = new Vuex.Store({
  plugins: [
    // logger(),
    // presists()
  ],
  state: {   // data
    age: 10
  },
  getters: {   // 计算属性
    myAge(state) {
      return state.age + 100;
    }
  },
  mutations: {   // method同步地更改
    setAge(state, payload) {
      state.age = state.age + payload;
    }
  },
  actions: {     // 异步修改完成后将信息提交给mutations
    changeAge({ commit }, payload) {
      setTimeout(() => {
        commit("setAge", payload)
      }, 1000)
    }
  },
  // modules: {
  //   a,
  //   b
  // }
});

export default store;
