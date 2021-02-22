<template>
  <div id="app">
    <!-- {{$store.state.name}} -->
    <!-- {{JSON.stringify(this.$store)}} -->
    我的姓名是：{{ $store.state.age }}<br />
    <button @click="$store.commit('setAge', 1)">mutation修改年龄</button
    ><br /><br />
    <button @click="$store.dispatch('changeName', '还应斯坦')">
      异步修改姓名</button
    ><br /><br />

    A模块的年龄是：{{ $store.state.a.age }}<br /><br />
    B模块的年龄是：{{ $store.state.b.age }}<br /><br />
    <button @click="$store.commit('a/changeAge', 3)">a模块修改年龄</button
    ><br /><br />
    <button @click="$store.commit('b/changeAge', 3)">b模块修改年龄</button
    ><br /><br />
  </div>
</template>

<script>
export default {
  mounted() {
    console.log("$store:", this.$store);
  },
};
</script>

