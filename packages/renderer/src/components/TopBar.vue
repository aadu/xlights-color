<template>
  <toolbar
    id="topbar"
    class="p-m-0 p-p-0"
  >
    <template #left>
      <div class="p-mx-2">
        <slot />
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
      <p-btn
        icon="pi pi-question"
        class="p-button-sm p-button-text p-button-link p-mr-2"
        @click="openDialog"
      />
    </template>
  </toolbar>
  <Dialog
    v-model:visible="dialog"
    header="About XLights Color Palette Editor"
    :style="{width: '50vw'}"
    :dismissable-mask="true"
    :modal="true"
  >
    <Fieldset legend="Toggle Gradient/Solid Color">
      Control-click on a color
    </Fieldset>
    <Fieldset legend="Move Color to Another Pallete">
      Click and drag the color
    </Fieldset>
    <Fieldset legend="Copy Color to Another Pallete">
      Press control and then click and drag the color
    </Fieldset>
    <Fieldset legend="Save">
      Right-click on a color to access that Palette's context menu
    </Fieldset>
    <p style="font-size: 12px; margin-bottom: -8px;">
      &copy;2021, Aaron Duke
    </p>
    <p style="font-size: 12px;">
      dukuru@gmail.com
    </p>
  </Dialog>
</template>

<script lang="ts">
import {defineComponent, computed, ref} from 'vue';
import Toolbar from 'primevue/toolbar';
import useStore from '/@/store';
import { ActionTypes as Workspaces } from '/@/store/modules/workspaces/index';
import {useElectron} from '/@/use/electron';
import Dialog from 'primevue/dialog';
import Fieldset from 'primevue/fieldset';



export default defineComponent({
  name: 'TopBar',
  components: { Toolbar, Dialog, Fieldset},
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
    const dialog = ref(false);
    function openDialog() {
      dialog.value = true;

    }

    return { setDirectory, currentWorkspace, openDialog, dialog };
  },
});
</script>
<style scoped>
#topbar {
  border-radius: 0px;
  height: 64px;
}
</style>
