<template>
  <div id="app">
    <!-- {{$store.state.name}} -->
    <!-- {{JSON.stringify(this.$store)}} -->
    我的年龄是：{{ age }}<br />
    我的年龄是：{{ myAge }}<br />
    ><br /><br />
  </div>
</template>

<script>
import { mapState, mapGetters } from "@/vuex";
export default {
  mounted() {
    console.log("$store:", this.$store);
  },
  computed: {
    ...mapState(["age"]),
    ...mapGetters(["myAge"]),
  },
};
</script>

