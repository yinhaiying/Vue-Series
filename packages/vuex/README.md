# Vuex的实现细节

1. `Vuex.use(Vuex)`也就是说`Vuex`是一个对象，对象中有一个install方法。
2. `new Vuex.Store()`，Vuex中有一个Store类。
3. 混入到组件中，增添store属性。


## 将所有组件中都注入$store
我们在每个组件中使用store中的数据时，都是通过`this.$store.state.xxx`来进行调用的，也就是说`Vuex`在初始化时就给每个组件新增了`$store`属性,而给所有组件进行操作，了解过Vue的源码的知道就是使用了Vue.mixin。Vue.mixin会在每个组件调用时，将mixin中的选项合并到组件中。相当于公共操作。因此，我们只需要给组件的初始化过程中新增一个生命周期`beforeCreate`，这个生命周期实现将$store注入到子组件实例身上即可。
```js
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
```


## state数据的响应式变化
```js
export class Store {
    constructor(options){
      this.state = options.state;  // 数据变化要更新试图
    }
}
```
我们知道state是一个对象，这个对象定义了各种需要的状态。但是我们直接这样定义，状态不是响应式的。想要实现响应式的数据，必须通过`Object.defineProperty`进行劫持。那么我们是否必须自己定义`Object.defineProperty`了。事实上不需要，由于Vue本身就实现了数据劫持，因此我们可以通过将数据定义到Vue的实例身上，然后进行获取即可。
```js
export class Store {
    constructor(options){
        console.log("options:",options)
      const state = options.state;  // 数据变化要更新试图
       // vue中的所有state都会将数据进行劫持
      this._vm = new Vue({
          data:{  
              $$state:state   
          }
      });
    }
    get state(){
        // 再次通过vm._data获取定义的数据
        return this._vm._data.$$state
    }
}
```

### getters
getters是具有缓存的computed，实际上就是对getters中的值{key:fn}，通过Object.defineProperty进行拦截，观察key是否被获取，如果获取执行对应的函数即可。
```js
    this.getters = {};
    forEachValue(options.getters,(fn,key) =>{
        Object.defineProperty(this.getters, key, {
            get: () => fn(this.state)   // 取值时，执行对应的函数即可。
        })
    })
```
但是，上面的这种方法是没有缓存的，我们知道在Vue中使用了dirty属性来进行缓存。那么我们是否还需要自己定义一个`dirty`来进行缓存了，事实上跟`state`一样我们可以使用Vue的computed来帮助我们能实现。我们将所有的`getters`都赋值到`computed`上，取值时从实例中去取。如下所示：
```js
      const computed ={}
      // 处理getters
      this.getters = {};
      forEachValue(options.getters,(fn,key) =>{
          // 将用户的getters定义在vue的computed身上
        computed[key] = () => {
            return fn(this.state);
        }
        Object.defineProperty(this.getters, key, {
            get: () => this._vm[key]  // 取值时直接通过实例身上进行即可。
        })
      });
        this._vm = new Vue({
            data: { // 属性如果是通过$开头的默认不会将属性挂载到vm上
                $$state: state // vue中的所有state都会将数据进行劫持
            },
            computed
        });
```

### mutations
mutations的实现，实际上就是通过commit方法，调用用户在mutaions中定义的方法。
先收集所有的mutataions方法。
```js
this.mutations = {};
forEachValue(options.mutations,(fn,key) => {
    this.mutations[key] = (payload) => fn(this.state,payload)
})
```
然后通过commit来执行这个方法
```js
commit = (type,payload) => {   // 保证this指向当前实例
    // 调用commit，其实就是去this.mutations中找
    this.mutations[type](payload)
}
```