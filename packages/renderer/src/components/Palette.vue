<template>
  <Card class="p-mb-2 p-py-0 p-mx-2">
    <template #title>
      <Inplace :closable="true" v-model:active="active">
        <template #display>
            <span class="p-card-title">{{ name }}</span>
        </template>
        <template #content>
            <InputText v-model="title" autoFocus @keyup.enter="active=false;" />
        </template>
    </Inplace>
    </template>
    <template #content>
      <draggable
        v-model="colors"
        class="p-grid palette-container p-d-flex"
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
              :color="element"
              :index="index"
              :dragging="drag"
              @update:color="updateColor($event, index)"
            />
          </div>
        </template>
      </draggable>
    </template>
    <template #footer>
      {{ palette.dirname }}/{{ palette.filename }}
      <div>
        {{ xPalette }}
      </div>
    </template>
  </Card>
</template>

<script lang="ts">
import {defineComponent, computed, reactive, ref, unref, watchEffect} from 'vue';
import Card from 'primevue/card';
import Inplace from 'primevue/inplace';
import InputText from 'primevue/inputtext';
import draggable from 'vuedraggable';
import {Palette, Color} from '/@/store/modules/palettes/index';
import ColorCard from './Color.vue';
import useStore from '/@/store';
import { ActionTypes as Palettes } from '/@/store/modules/palettes/index';
// see https://github.com/SortableJS/vue.draggable.next/blob/master/example/components/clone-on-control.vue

export default defineComponent({
  name: 'Palette',
  components: { Card, ColorCard, draggable, Inplace, InputText },
  props: {
    palette: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    }
  },
  setup ({ palette, index }) {
    const store = useStore();
    const name = computed(() => palette.filename.split('.')[0]);
    const drag = ref(false);
    const controlOnStart = ref(true);
    const title = computed({
      get() {
        return palette.filename.split('.')[0];
      },
      set(name: string) {
        store.dispatch(Palettes.updateName, {name: `${name}.xpalette`, index});
      }
    });

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

    const colors = computed({
      get(){ return palette.colors;},
      set(value: Array<Color>){
        store.dispatch(Palettes.setColors, {palette: palette.filename, colors: value});
      },
    });
    function updateColor(color: Color, index: number) {
      store.dispatch(Palettes.updateColor, {palette: palette.filename, color, index });
    }
    function clone({ id, value, stops }: Color) {
      return new Color(value, stops);
    }
    const xPalette = computed(() => {
      return `${colors.value.map(c => c.toXPalette()).join(',')},`;
    })
    const active = ref(false);
    return { palette, name, drag, colors, start, pullFunction, updateColor, clone, xPalette, title, active };
  },
});
</script>
<style>
.palette-container {
  padding-inline-start: 0px;
  margin-bottom: -12px;
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
</style>
