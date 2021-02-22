export default {
  namespaced: true,
  state: {
    age: 34
  },
  getters: {},
  mutations: {
    changeAge(state, payload) {
      state.age += payload;
    }
  },
  actions: {}
}
