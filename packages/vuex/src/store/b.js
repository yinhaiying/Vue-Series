export default {
  namespaced: true,
  state: {
    age: 25
  },
  getters: {},
  mutations: {
    changeAge(state, payload) {
      state.age += payload;
    }
  },
  actions: {}
}
