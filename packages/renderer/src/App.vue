<template>
  <div
    id="content-wrapper"
    class="p-m-0 p-p-3">
      <router-view />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'App',
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
