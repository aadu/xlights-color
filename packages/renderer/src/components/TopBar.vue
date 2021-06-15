<template>
  <toolbar
    id="topbar"
    class="p-m-0 p-p-0"
  >
    <template #left>
      <div class="p-mx-2">
        xLights Color Palette Editor
      </div>
      <p-btn>Hey</p-btn>
    </template>
  </toolbar>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Toolbar from 'primevue/toolbar';


export default defineComponent({
  name: 'TopBar',
  components: { Toolbar },
});
</script>
<style scoped>
#topbar {
  border-radius: 0px;
  height: 64px;
}
</style>
