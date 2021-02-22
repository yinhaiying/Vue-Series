# Vuex的实现细节

1. `Vuex.use(Vuex)`也就是说`Vuex`是一个对象，对象中有一个install方法。
2. `new Vuex.Store()`，Vuex中有一个Store类。
3. 混入到组件中，增添store属性。