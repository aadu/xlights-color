<template>
  <div class="p-m-0 p-p-0 p-col p-nogutter" id="content-wrapper">
    <top-bar />
    <div id="content" class="p-m-2 p-p-2">
      <router-view />
    </div>
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
@import url(//fonts.googleapis.com/css?family=Roboto);

body {
  width: 100%;
  margin: 0px;
  padding: 0px;
  font-family: 'Roboto', sans-serif;
}
#content-wrapper {
  background-color: #b2beb53d;
}
</style>
