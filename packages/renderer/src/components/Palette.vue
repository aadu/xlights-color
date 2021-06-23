<template>
  <Card class="p-mb-2 p-py-0 p-mx-2 palette">
    <template #title>
      <div class="p-d-flex p-ai-center">
        <Inplace :closable="true" v-model:active="active">
          <template #display>
              <span class="p-card-title p-d-inline-block" v-text="name" style="min-width: 141px;" />
          </template>
          <template #content>
              <InputText v-model="title" autoFocus @keyup.enter="active=false;" />
          </template>
      </Inplace>
    </div>
    </template>
    <template #content>
      <draggable
        v-model="colors"
        class="p-grid palette-container p-d-flex p-m-0 p-p-0"
        tag="transition-group"
        :clone="clone"
        :group="{ name: 'palette', pull: pullFunction }"
        :component-data="{ tag: 'ul', name: 'flip-list', type: 'transition' }"
        :animation="0"
        ghost-class="ghost"
        item-key="id"
        @start="start"
        @end="drag=false"
      >
        <template #item="{element, index}">
          <div class="p-m-0 p-p-0">
            <color-card
              :id="element.id"
              :index="index"
              :paletteId="paletteId"
              :dragging="drag"
              :key="element.id"
              v-on="commands"
            />
          </div>
        </template>
      </draggable>
    </template>
  </Card>
</template>

<script lang="ts">
import {defineComponent, computed, reactive, ref, unref, watchEffect} from 'vue';
import chroma from 'chroma-js';
import Card from './Card.vue';
import Inplace from 'primevue/inplace';
import InputText from 'primevue/inputtext';
import draggable from 'vuedraggable';
import {Color, Palette} from '/@/store/modules/palettes/index';
import ColorCard from './Color.vue';
import useStore from '/@/store';
import cloneDeep from 'lodash.clonedeep'
import { ActionTypes as Palettes } from '/@/store/modules/palettes/index';
// see https://github.com/SortableJS/vue.draggable.next/blob/master/example/components/clone-on-control.vue


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export default defineComponent({
  name: 'Palette',
  components: { Card, ColorCard, draggable, Inplace, InputText },
  props: {
    paletteId: {
      type: Number,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    }
  },
  setup ({ paletteId}) {
    // data
    const drag = ref(false);
    const controlOnStart = ref(true);
    const active = ref(false);

    // computed
    const store = useStore();
    const palette = computed(() => {
      return store.getters.palette(paletteId);
    });
    const name = computed(() => palette.value.filename.split('.')[0]);
        const title = computed({
      get() {
        return name.value;
      },
      set(name: string) {
        store.dispatch(Palettes.updateName, {name: `${name}.xpalette`, id: paletteId});
      }
    });
    const colors = computed({
      get(){
         return palette.value.colors;
        },
      set(colors: Array<Color>){
        store.dispatch(Palettes.setColors, {paletteId, colors});
      },
    });

    const xPalette = computed(() => {
      return `${colors.value.map(color => color.toXPalette()).join(',')},`;
    });

    // methods
    interface StartEvent {
      originalEvent: DragEvent
    }

    function start({ originalEvent }: StartEvent) {
      drag.value = true;
      controlOnStart.value = originalEvent.ctrlKey;
    }

    function pullFunction() {
      return controlOnStart.value ? 'clone' : true;
    }

    function addColor() {
      const color = new Color(chroma.random().hex());
      store.dispatch(Palettes.addColor, {paletteId, color });
    }

    function clone({ id }: Color) {
      const color = store.state.palettes.colors[id];
      return new Color(color.value, cloneDeep(color.stops));
    }
    const commands = ref({
      'randomize:order': () => {
        shuffleArray(colors.value);
        store.dispatch(Palettes.setColors, {paletteId, colors: colors.value});
      },
      'reverse:order': () => {
        store.dispatch(Palettes.setColors, {paletteId, colors: colors.value.reverse()});
      },
      'randomize:colors': async () => {
        const colors = [...Array(palette.value.colors.length).keys()].map(() => (new Color(chroma.random().hex())));
        await store.dispatch(Palettes.extendColors, colors);
        await store.dispatch(Palettes.setColors, {paletteId, colors: []});
        await store.dispatch(Palettes.setColors, {paletteId, colors});
      },
      'new:palette': async () => {
        const colors = [...Array(8).keys()].map(() => (new Color(chroma.random().hex())))
        const palette = new Palette(
          `Palette${store.state.palettes.order.length}.xpalette`,
          store.state.workspaces.current,
          colors.map(c => c.id)
        );
        await store.dispatch(Palettes.extendColors, colors);
        await store.dispatch(Palettes.add, palette);
      },
      'clone:palette': () => {
        const colors = palette.value.colors.map(c => new Color(c.value, cloneDeep(c.stops)));
        const clone = new Palette(
          palette.value.filename.replace('.xpalette', '-copy.xpalette'),
          palette.value.dirname,
          colors.map(c => c.id)
        );
        store.dispatch(Palettes.extendColors, colors);
        store.dispatch(Palettes.add, clone);
      },
      'download:palette': () => {
        const blob = new Blob([xPalette.value], {type: 'text/plain'});
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = palette.value.filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
      },
      'delete:palette': () => {
        store.dispatch(Palettes.remove, paletteId);
      }
    });


    return {
      active,
      addColor,
      clone,
      colors,
      commands,
      drag,
      name,
      paletteId,
      pullFunction,
      start,
      title,
      xPalette,
   };
  },
});
</script>
<style>
.palette-container {
  padding-inline-start: 0px;
  margin: 0xp;
  width: 100%;
  /* margin-bottom: -22px; */
}
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.palette {
  width: 100%;
}
</style>
