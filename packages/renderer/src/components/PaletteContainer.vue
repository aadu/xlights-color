<template>
  <main id="palettes-wrapper">
    <palette-card
      v-for="(palette, i) in palettes"
      :key="i"
      :palette="palette"
      :index="i"
    />
  </main>
</template>

<script lang="ts">
import {defineComponent, computed, reactive, watchEffect, watch} from 'vue';
import useStore from '/@/store';
import { parsePalette, Color } from '/@/store/modules/palettes/color';
import {useElectron} from '/@/use/electron';
import PaletteCard from './Palette.vue';
import { ActionTypes as Palettes } from '/@/store/modules/palettes/index';
import GradientPicker from './GradientPicker.vue';



export default defineComponent({
  name: 'Palettes',
  components: { PaletteCard, GradientPicker },
  setup () {
    const store = useStore();
    const electron = useElectron();

    async function addPalette(filename: string, dirname: string) {
        const content = (await electron.readFile(`${dirname}/${filename}`, {encoding: 'utf-8'}));
        const colors = parsePalette(content);
        const palette = {filename, dirname, colors};
        store.dispatch(Palettes.add, palette);

    }

    async function readDirectory(path: string | undefined) {
      if (!path) return [];
      const files = await electron.readdir(path);
      for (const file of files.filter((f: string) => f.match(/\.xpalette$/))) {
        await addPalette(file, path);
      }
    }

    const currentWorkspace = computed(() => (store.state.workspaces.current));
    const palettes = computed(() => (store.state.palettes.list));

    watchEffect(async () => {
        await readDirectory(currentWorkspace.value);
      });

    const gradient = reactive([]);
    watchEffect(() => {
      console.log('gradient changed', gradient)
    })
    return { palettes, currentWorkspace, gradient };

  },
});
</script>
