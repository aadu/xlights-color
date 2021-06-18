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
      <span
        class="p-mr-2"
        v-text="currentWorkspace"
      />
      <p-btn
        class="p-mr-2"
        @click="setDirectory"
      >
        Set Directory
      </p-btn>
    </template>
  </toolbar>
</template>

<script lang="ts">
import {defineComponent, computed} from 'vue';
import Toolbar from 'primevue/toolbar';
import useStore from '/@/store';
import { ActionTypes as Workspaces } from '/@/store/modules/workspaces/index';
import {useElectron} from '/@/use/electron';



export default defineComponent({
  name: 'TopBar',
  components: { Toolbar },
  setup () {
    const store = useStore();

    async function setDirectory() {
      const electron = useElectron();
      const result = await electron.dialog.showOpenDialog({
        title: 'Select xLights Color Palette Directory',
        properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
      });
      if (!result.canceled && result.filePaths.length) {
        const path = result.filePaths[0];
        store.dispatch(Workspaces.setCurrent, path);
      }
    }
    const currentWorkspace = computed(() => store.state.workspaces.current);
    return { setDirectory, currentWorkspace };
  },
});
</script>
<style scoped>
#topbar {
  border-radius: 0px;
  height: 64px;
}
</style>
