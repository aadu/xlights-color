<template>
  <div class="p-m-0 p-p-0 p-col p-nogutter">
    <top-bar />
    <router-view />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import TopBar from '/@/components/TopBar.vue';

export default defineComponent({
  name: 'App',
  components: {
    TopBar,
  },
});
</script>

<style>
body {
  width: 100%;
  margin: 0px;
  padding: 0px;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
