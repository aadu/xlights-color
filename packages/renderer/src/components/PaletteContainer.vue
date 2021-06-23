<template>
  <main id="palettes-wrapper">
    <DataView :value="palettes" layout="list">
      <template #header>
          Palettes
      </template>
      <template #list="slotProps">
        <palette-card
          :key="slotProps.data.id"
          :paletteId="slotProps.data.id"
          :index="slotProps.index"
        />
      </template>
      <template #footer>
        <p-btn icon="pi pi-plus-circle" class="p-ml-2 p-my-2" label="Add Palette" @click="addNewPalette"></p-btn>
      </template>
    </DataView>
  </main>
</template>

<script lang="ts">
import {defineComponent, computed, reactive, watchEffect, watch} from 'vue';
import useStore from '/@/store';
import chroma from 'chroma-js';
import DataView from 'primevue/dataview';
import { parsePalette } from '/@/store/modules/palettes/palette';
import {useElectron} from '/@/use/electron';
import PaletteCard from './Palette.vue';
import { ActionTypes as Palettes, Color, Palette } from '/@/store/modules/palettes/index';
import GradientPicker from './GradientPicker.vue';



export default defineComponent({
  name: 'Palettes',
  components: { PaletteCard, GradientPicker, DataView },
  setup () {
    const store = useStore();
    const electron = useElectron();

    async function addPalette(filename: string, dirname: string) {
        const content = (await electron.readFile(`${dirname}/${filename}`, {encoding: 'utf-8'}));
        const colors = parsePalette(content);
        const palette = new Palette(filename, dirname, colors.map(c => c.id));
        await store.dispatch(Palettes.extendColors, colors);
        await store.dispatch(Palettes.add, palette);
    }

    async function readDirectory(path: string | undefined) {
      if (!path) return [];
      const files = await electron.readdir(path);
      for (const file of files.filter((f: string) => f.match(/\.xpalette$/))) {
        await addPalette(file, path);
      }
    }

    const currentWorkspace = computed(() => (store.state.workspaces.current));
    const palettes = computed(() => (store.getters.palettes));

    watchEffect(async () => {
        await readDirectory(currentWorkspace.value);
      });

    async function addNewPalette() {
      const colors = [...Array(8).keys()].map(() => (new Color(chroma.random().hex())))
      const palette = new Palette(
        `Palette${palettes.value.length}.xpalette`,
        currentWorkspace.value,
        colors.map(c => c.id)
      );
      await store.dispatch(Palettes.extendColors, colors);
      await store.dispatch(Palettes.add, palette);
    }

    return { palettes, currentWorkspace, addNewPalette };

  },
});
</script>
