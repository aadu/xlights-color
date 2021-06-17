<template>
  <Card class="p-mb-2 p-py-0 p-mx-2">
    <template #title>
        {{ name }}
    </template>
    <template #content>
      <draggable
        v-model="colors"
        @start="start"
        @end="drag=false"
        class="p-grid palette-container p-d-flex"
        tag="transition-group"
        :group="{ name: 'palette', pull: pullFunction }"
        :component-data="{ tag: 'ul', name: 'flip-list', type: 'transition' }"
        :animation="0"
        ghostClass="ghost"
        item-key="value">
        <template #item="{element}">
          <div class="p-col p-m-0 p-p-0">
              <color-card :color="element" />
          </div>
        </template>
      </draggable>
    </template>
    <template #footer>
      {{ palette.dirname }}/{{ palette.filename }}
    </template>
  </Card>
</template>

<script lang="ts">
import {defineComponent, computed, reactive, ref, watchEffect} from 'vue';
import {Palette, Color} from '/@/store/modules/palettes/index'
import ColorCard from './Color.vue'
import Card from 'primevue/card';
import draggable from 'vuedraggable'
import useStore from "/@/store";
import { ActionTypes as Palettes } from "/@/store/modules/palettes/index";
// see https://github.com/SortableJS/vue.draggable.next/blob/master/example/components/clone-on-control.vue

export default defineComponent({
  name: 'Palette',
  components: { Card, ColorCard, draggable },
  props: {
    palette: {
      type: Object,
      required: true
    }
  },
  setup ({ palette }) {
    const store = useStore();
    const name = computed(() => palette.filename.split('.')[0])
    const drag = ref(false)
    const controlOnStart = ref(true)

    interface StartEvent {
      originalEvent: DragEvent
    }

    function start({ originalEvent }: StartEvent) {
      drag.value = true;
      controlOnStart.value = originalEvent.ctrlKey;
    }

    function pullFunction() {
      return controlOnStart.value ? "clone" : true;
    }

    const colors = computed({
      get(){ return palette.colors},
      set(value: Array<Color>){
        store.dispatch(Palettes.setColors, {palette: palette.filename, colors: value});
      }
    })
    return { palette, name, drag, colors, start, pullFunction }
  }
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