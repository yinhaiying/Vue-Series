<template>
  <div id="app">
   {{$store.state.name}}
   我的姓名是：{{$store.getters.myName}}<br>
   我的姓名是：{{$store.getters.myName}}<br>
   我的姓名是：{{$store.getters.myName}}<br>
   我的姓名是：{{$store.getters.myName}}<br>
   <button @click = "$store.state.name = 'hello'">修改</button>
   <!-- 我的姓名是：{{$store.getters.myName}}<br>
   <button @click = "$store.commit('setName','爱因斯坦')">修改姓名</button><br><br>
   <button @click = "$store.dispatch('changeName','还应斯坦')">异步修改姓名</button> -->
  </div>
</template>

<script>
export default {
  mounted(){
    console.log("$store:",this.$store)
  }
}
</script>

