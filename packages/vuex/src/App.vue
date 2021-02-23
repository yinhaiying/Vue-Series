<template>
  <div id="app">
    <!-- {{$store.state.name}} -->
    <!-- {{JSON.stringify(this.$store)}} -->
    我的年龄是：{{ age }}<br />
    我的年龄是：{{ myAge }}<br /><br />
    <button @click = "setAge(3)">同步修改</button>    <br /><br />
    <button @click = "changeAge(5)">异步修改</button>    <br />


  </div>
</template>

<script>
import { mapState, mapGetters,mapMutations,mapActions } from "@/vuex";
export default {
  mounted() {
    console.log("$store:", this.$store);
  },
  computed: {
    ...mapState(["age"]),
    ...mapGetters(["myAge"]),
  },
  methods:{
     ...mapMutations(["setAge"]),
     ...mapActions(["changeAge"])
  }
};
</script>

