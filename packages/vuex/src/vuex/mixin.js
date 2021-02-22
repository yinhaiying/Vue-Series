
export default function applyMixin(Vue){
  Vue.mixin({
      beforeCreate: vuexInit
  })
}


// vuexInit用于将store注入到所有子组件中，增加一个$store属性。
function vuexInit(){
    const options = this.$options;
    console.log("options:", this.$options)
    // 有store属性的表示是根实例
    if (options.store) {
        // 根实例增加$store属性。
        this.$store = options.store;
    } else if (options.parent && options.parent.$store) {
        // 存在父组件，说明不是另外的Vue根实例,同时它父亲身上有$store
        // 这样的话就所有的组件都拿到了$store属性。
        this.$store = options.parent.$store;
    }
}