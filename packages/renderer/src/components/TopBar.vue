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
      <span v-text="currentWorkspace" class="p-mr-2" />
      <p-btn class="p-mr-2" @click="setDirectory">Set Directory</p-btn>
    </template>
  </toolbar>
</template>

<script lang="ts">
import {defineComponent, computed, watchEffect} from 'vue';
import Toolbar from 'primevue/toolbar';
import useStore from "/@/store";
import { ActionTypes as Workspaces } from "/@/store/modules/workspaces/index";
import {useElectron} from '/@/use/electron';



export default defineComponent({
  name: 'TopBar',
  components: { Toolbar },
  setup () {
    const store = useStore();

    async function setDirectory() {
      const electron = useElectron();
      console.log('electron', electron)
      const result = await electron.dialog.showOpenDialog({
        title: 'Select xLights Color Palette Directory',
        properties: ['openDirectory', 'createDirectory', 'promptToCreate']
      })
      if (!result.canceled && result.filePaths.length) {
        const path = result.filePaths[0]
        store.dispatch(Workspaces.setCurrent, path);
      }
    }

    async function readDirectory(path: string | undefined) {
      if (!path) return []
      const files = await electron.readdir(path)
      const results: Record<string, string> = {}
      for (const file of files.filter((f: string) => f.match(/\.xpalette$/))) {
        results[file] = (await electron.readFile(`${path}/${file}`, {encoding: 'utf-8'}))
      }
      console.log('results', results)
      return results
    }

    const currentWorkspace = computed(() => store.state.workspaces.current);
    watchEffect(async () => {
        await readDirectory(currentWorkspace.value)
      });

    return { setDirectory, currentWorkspace }

  }
});
</script>
<style scoped>
#topbar {
  border-radius: 0px;
  height: 64px;
}
</style>
