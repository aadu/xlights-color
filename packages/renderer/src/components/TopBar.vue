<template>
  <toolbar
    id="topbar"
    class="p-m-0 p-p-0"
  >
    <template #left>
      <div class="p-mx-2">
        xLights Color Palette Editor
      </div>
    </template>
    <template #right>
      <p-btn class="p-mr-2" @click="setDirectory">Set Directory</p-btn>
    </template>
  </toolbar>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Toolbar from 'primevue/toolbar';
import useStore from "/@/store";
import { ActionTypes as Workspaces } from "/@/store/modules/workspaces/index";
import {useElectron} from '/@/use/electron';

export default defineComponent({
  name: 'TopBar',
  components: { Toolbar },
  setup () {

    function setDirectory() {
      const store = useStore();
      const {dialog} = useElectron();
      const result = dialog.showOpenDialog({
        title: 'Select xLights Color Palette Directory',
        properties: ['openDirectory', 'createDirectory', 'promptToCreate']
      })
      console.log('result', result)
      if (result && result.length) {
        store.dispatch(Workspaces.setData, result[0]);
      }
    }
    return { setDirectory }

  }
});
</script>
<style scoped>
#topbar {
  border-radius: 0px;
  height: 64px;
}
</style>
