<template>
  <Card class="p-mb-2 p-py-0 p-mx-2">
    <template #title>
      <div class="p-d-flex p-ai-center">
        <Inplace :closable="true" v-model:active="active">
          <template #display>
              <span class="p-card-title">{{ name }}</span>
          </template>
          <template #content>
              <InputText v-model="title" autoFocus @keyup.enter="active=false;" />
          </template>
      </Inplace>
      <p-btn type="button" @click="toggleMenu" icon="pi pi-ellipsis-h" class="p-ml-3 p-button-secondary p-button-text p-button-only" />
      <Menu ref="menu" :model="panelOptions" :popup="true"></Menu>
    </div>
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
    <template #footer2>
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
import Menu from 'primevue/menu';
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
  components: { Card, ColorCard, draggable, Inplace, InputText, Menu },
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
    const menu = ref(null);
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

    const panelOptions = ref([
        {
            label: 'Save',
            icon: 'pi pi-save',
            command: () => {

            }
        },
        {
            label: 'Random Order',
            icon: 'pi pi-refresh',
            command: () => {
              shuffleArray(palette.colors)
              store.dispatch(Palettes.setColors, {palette: palette.filename, colors: palette.colors});
            }
        },
        {
            label: 'Reverse Order',
            icon: 'pi pi-sort-alpha-up-alt',
            command: () => {
              store.dispatch(Palettes.setColors, {palette: palette.filename, colors: palette.colors.reverse()});

            }
        },
              {
            label: 'Clone',
            icon: 'pi pi-clone',
            command: () => {
              const clone = {
                filename: palette.filename.replace('.xpalette', '-copy.xpalette'),
                dirname: palette.dirname,
                colors: []
              }
              palette.colors.forEach((c) => {
                clone.colors.push(new Color(c.value, cloneDeep(c.stops)))
              });
              store.dispatch(Palettes.add, clone);
            }
        },
        {   label: 'Download',
            icon: 'pi pi-download',
            command: () => {
              const blob = new Blob([xPalette.value], {type: 'text/plain'});
              const elem = window.document.createElement('a');
              elem.href = window.URL.createObjectURL(blob);
              elem.download = palette.filename;
              document.body.appendChild(elem);
              elem.click();
              document.body.removeChild(elem);
          }
        },
          {
            label: 'Delete',
            icon: 'pi pi-times',
            command: () => {
              store.dispatch(Palettes.remove, palette.filename);
            }
        }

    ]);
    function toggleMenu(event) {
      if (menu.value) {
        menu.value.toggle(event);
      }
    }

    return { palette, name, drag, colors, start, pullFunction, updateColor, clone, xPalette, title, active, panelOptions, menu, toggleMenu };
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
