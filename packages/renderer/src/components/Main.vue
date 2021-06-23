<template>
  <main id="palettes-wrapper">
    <DataView :value="palettes" layout="list">
      <template #header>
          <TopBar />
      </template>
      <template #list="slotProps">
        <palette-card
          :key="slotProps.data.id"
          :paletteId="slotProps.data.id"
          :index="slotProps.index"
          v-on="commands"
        />
      </template>
      <template #footer>
        <p-btn icon="pi pi-plus-circle" class="p-ml-2 p-my-2" label="Add Palette" @click="addNewPalette"></p-btn>
      </template>
    </DataView>
    <Card>
      <template #content>
        <div v-for="(palette, i) in palettes" :key="i">
          <h4>{{ palette.filename }}</h4>
          <code>{{ xPalette(palette.id) }}</code>
        </div>
    </template>
    </Card>
  </main>
</template>

<script lang="ts">
import {defineComponent, computed, reactive, watchEffect, watch} from 'vue';
import Card from 'primevue/card';
import useStore from '/@/store';
import chroma from 'chroma-js';
import DataView from 'primevue/dataview';
import { parsePalette } from '/@/store/modules/palettes/palette';
import {useElectron} from '/@/use/electron';
import PaletteCard from './Palette.vue';
import { ActionTypes as Palettes, Color, Palette } from '/@/store/modules/palettes/index';
import GradientPicker from './GradientPicker.vue';
import TopBar from '/@/components/TopBar.vue';



export default defineComponent({
  name: 'Palettes',
  components: { PaletteCard, GradientPicker, DataView, Card, TopBar },
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


    async function exists(path) {
        let exists = false;
        try {
          await electron.stat(path);
          exists = true;
        } catch (error) {
          exists = false;
        }
        return exists
    }

    async function makeBackup(paletteId: number) {
      const palette = store.getters.palette(paletteId);
      const path = `${palette.dirname}/${palette.filename}`
        const backupPath = `${palette.dirname}/.backup/${new Date().getTime().toString()}-${palette.filename}`
        const doesExist = await exists(path);
        if (doesExist) {
          await electron.mkdir(`${palette.dirname}/.backup`, {recursive: true})
          await electron.copyFile(path, backupPath);
        }
    }

    const commands = reactive({
      'save:palette': async (paletteId: number) => {
        const palette = store.getters.palette(paletteId);
        const xPalette = store.getters.xPalette(paletteId);
        const path = `${palette.dirname}/${palette.filename}`
        await makeBackup(paletteId);
        await electron.writeFile(path, xPalette);
      },
      'delete:palette': async (paletteId: number) => {
        const palette = store.getters.palette(paletteId);
        const path = `${palette.dirname}/${palette.filename}`
        const doesExist = await exists(path);
        if (doesExist) {
          await makeBackup(paletteId);
          await electron.rm(path);
        }
      },
    })

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

    function xPalette(id: number) {
      return store.getters.xPalette(id);
    }

    return { palettes, currentWorkspace, addNewPalette, xPalette, commands };

  },
});
</script>
