<template>
  <main id="palettes-wrapper">
    <DataView
      :value="palettes"
      layout="list"
      :paginator="true"
      :rows="10"
      :sort-order="sortOrder"
      :sort-field="sortField"
    >
      <template #header>
        <TopBar>
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              v-model="searchText"
              type="text"
              class="p-inputtext-sm"
              placeholder="Search"
            />
          </span>
          <p-btn
            icon="pi pi-times"
            class="p-button-sm p-button-text"
            :disabled="searchText===''"
            @click="searchText='';"
          />
          <Dropdown
            v-model="sortKey"
            :options="sortOptions"
            option-label="label"
            placeholder="Sort By"
            class="p-inputtext-sm"
            @change="onSortChange($event)"
          />
        </TopBar>
        <div class="p-grid p-nogutter">
          <div
            class="p-col-6"
            style="text-align: left"
          />
          <div
            class="p-col-6"
            style="text-align: right"
          />
        </div>
      </template>
      <template #list="slotProps">
        <palette-card
          :key="slotProps.data.id"
          :palette-id="slotProps.data.id"
          :index="slotProps.index"
          v-on="commands"
        />
      </template>
      <template #footer>
        <p-btn
          icon="pi pi-plus-circle"
          class="p-ml-2 p-my-2"
          label="Add Palette"
          @click="addNewPalette"
        />
      </template>
    </DataView>
    <Card v-if="debug">
      <template #content>
        <div
          v-for="(palette, i) in palettes"
          :key="i"
        >
          <h4>{{ palette.filename }}</h4>
          <code>{{ xPalette(palette.id) }}</code>
        </div>
      </template>
    </Card>
  </main>
</template>

<script lang="ts">
import {defineComponent, computed, reactive, watchEffect, ref} from 'vue';
import Card from 'primevue/card';
import useStore from '/@/store';
import chroma from 'chroma-js';
import DataView from 'primevue/dataview';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { parsePalette } from '/@/store/modules/palettes/palette';
import {useElectron} from '/@/use/electron';
import PaletteCard from './Palette.vue';
import { ActionTypes as Palettes, Color, Palette } from '/@/store/modules/palettes/index';
import GradientPicker from './GradientPicker.vue';
import TopBar from '/@/components/TopBar.vue';


export default defineComponent({
  name: 'Palettes',
  components: { PaletteCard, GradientPicker, DataView, Card, TopBar, Dropdown, InputText },
  setup () {
    const store = useStore();
    const electron = useElectron();
    const debug = ref(false);

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
    const searchText = ref('');
    const palettes = computed(() => {
      return searchText.value ? store.getters.palettes.filter(({filename}) => (filename.match(new RegExp(searchText.value)))) : store.getters.palettes;
    });

    async function exists(path) {
        let exists = false;
        try {
          await electron.stat(path);
          exists = true;
        } catch (error) {
          exists = false;
        }
        return exists;
    }

    async function makeBackup(paletteId: number) {
      const palette = store.getters.palette(paletteId);
      const path = `${palette.dirname}/${palette.filename}`;
        const backupPath = `${palette.dirname}/.backup/${new Date().getTime().toString()}-${palette.filename}`;
        const doesExist = await exists(path);
        if (doesExist) {
          await electron.mkdir(`${palette.dirname}/.backup`, {recursive: true});
          await electron.copyFile(path, backupPath);
        }
    }

    const commands = reactive({
      'save:palette': async (paletteId: number) => {
        const palette = store.getters.palette(paletteId);
        const xPalette = store.getters.xPalette(paletteId);
        const path = `${palette.dirname}/${palette.filename}`;
        await makeBackup(paletteId);
        await electron.writeFile(path, xPalette);
      },
      'delete:palette': async (paletteId: number) => {
        const palette = store.getters.palette(paletteId);
        const path = `${palette.dirname}/${palette.filename}`;
        const doesExist = await exists(path);
        if (doesExist) {
          await makeBackup(paletteId);
          await electron.rm(path);
        }
      },
    });

    watchEffect(async () => {
        await readDirectory(currentWorkspace.value);
      });

    async function addNewPalette() {
      const colors = [...Array(8).keys()].map(() => (new Color(chroma.random().hex())));
      const palette = new Palette(
        `Palette${palettes.value.length}.xpalette`,
        currentWorkspace.value,
        colors.map(c => c.id),
      );
      await store.dispatch(Palettes.extendColors, colors);
      await store.dispatch(Palettes.add, palette);
    }

    function xPalette(id: number) {
      return store.getters.xPalette(id);
    }

      const sortKey = ref({label: 'Name A-Z', value: 'filename'});
      const sortOrder = ref(1);
      const sortField = ref('filename');
      const sortOptions = ref([
          {label: 'Name A-Z', value: 'filename'},
          {label: 'Name Z-A', value: '!filename'},
      ]);
      const onSortChange = (event) => {
          const value = event.value.value;
          const sortValue = event.value;

          if (value.indexOf('!') === 0) {
              sortOrder.value = -1;
              sortField.value = value.substring(1, value.length);
              sortKey.value = sortValue;
          }
          else {
              sortOrder.value = 1;
              sortField.value = value;
              sortKey.value = sortValue;
          }
      };

    return { palettes, currentWorkspace, addNewPalette, xPalette, commands, sortOptions, onSortChange, sortKey, sortOrder, sortField, searchText, debug};

  },
});
</script>
