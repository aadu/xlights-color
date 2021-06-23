<template>
  <Card
    class="p-m-0 p-p-0 palette-color"
    :style="style"
    @click.exact="toggle"
    @click.ctrl="toggle($event, true)"
    @contextmenu="onContextMenu"
  >
    <template #content>
      <span v-if="!isGradient" v-text="name" class="color-name" />
      <svg
        v-if="index >= 8"
        class="overlay"
        width="150"
        height="83"
      >
        <line
          x1="0"
          y1="100%"
          x2="100%"
          y2="0"
          style="stroke:rgb(255,0,0);stroke-width:2"
        />
      </svg>
    </template>
  </Card>
  <ContextMenu ref="cm" :model="contextItems" />
  <OverlayPanel ref="op" class="color-picker-container">
    <GradientPicker style="box-shadow: none;" v-if="gradient" v-model="stops" />
    <ColorPicker v-model="value" v-else style="box-shadow: none;"/>
  </OverlayPanel>
</template>

<script lang="ts">
import {defineComponent, ref, unref, toRaw, computed, watch} from 'vue';
import ContextMenu from 'primevue/contextmenu';
import GradientPicker from './GradientPicker.vue';
import { Sketch } from '@ckpack/vue-color';
import OverlayPanel from 'primevue/overlaypanel';
import Card from 'primevue/card';
import chroma from 'chroma-js';
import { Color } from '/@/store/modules/palettes/color';
import debounce from 'lodash.debounce';
import useStore from '/@/store';
import { ActionTypes as Palettes } from '/@/store/modules/palettes/index';



export default defineComponent({
  name: 'Color',
  components: { Card, OverlayPanel, ColorPicker: Sketch, GradientPicker, ContextMenu },
  props: {
    paletteId: {
      type: Number,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
    index: {
      type: Number,
      required: false,
      default: 0,
    },
    dragging: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup ({ paletteId, id, index, dragging: isDragging}, { emit }) {
    const dragging = ref(isDragging);
    const store = useStore();
    const color = computed(() => {
      return store.state.palettes.colors[id];
    });
    const stops = ref(color.value.stops.map(stop => [...stop]));
    const hex = computed(() => chroma(color.value.value).hex());
    const name = computed(() => chroma(hex.value).name());
    const op = ref(null);
    const value = ref(hex.value);
    const gradient = ref(false);
    const ignoreStops = ref(false);
    const cm = ref(null);

    const style = computed(() => {
      return {
        'background': color.value.toString(),
        'color': chroma(color.value.value).luminance() > .5 ? 'black' : 'white',
      }
    });
    // const dragging = computed(() => (props.dragging));
    const isGradient = computed(() => {
      return stops.value.length > 1;
    })

    const updateColor = debounce(function (value) {
      const color = new Color(value.hex, [[value.hex, 0.5]]);
      color.id = id;
      store.dispatch(Palettes.updateColor, {paletteId, color});
    }, 250);
    const updateStops = debounce(function (stops) {
      const color = new Color(stops[0][0], stops);
      color.id = id;
      store.dispatch(Palettes.updateColor, {paletteId, color});
    }, 250);

    watch(value, (value) => {
      ignoreStops.value = true;
      stops.value = [[value.hex, 0.5]];
      ignoreStops.value = false;
      updateColor(value);
    });
    watch(stops, (stops) => {
      if (!ignoreStops.value) {
        updateStops(stops);
      }
    });

    watch(dragging, (current, prev) => {
      if (current && !prev) {
        op.value.hide();
      }
    })
    gradient.value = isGradient.value;

    function toggle(event, ctrlClick = false) {
      // toggle if not control click
      if (ctrlClick) {
        gradient.value = !isGradient.value;
        if (op.value) {
          op.value.show(event);
        }
      } else if (op.value) {
        op.value.toggle(event);
      }
    };
    const contextItems = ref([
            {
               label:'File',
               icon:'pi pi-fw pi-file',
               items:[
                    {
                        label:'New',
                        icon:'pi pi-fw pi-plus',
                        items:[
                           {
                              label:'Bookmark',
                              icon:'pi pi-fw pi-bookmark'
                           },
                           {
                              label:'Video',
                              icon:'pi pi-fw pi-video'
                           },
                        ]
                    },
                    {
                        label:'Delete',
                        icon:'pi pi-fw pi-trash'
                    },
                    {
                       separator:true
                    },
                    {
                       label:'Export',
                       icon:'pi pi-fw pi-external-link'
                    }
                ]
            },
            {
               separator:true
            },
            {
               label:'Delete',
               icon:'pi pi-fw pi-trash',
                command: () => {
                  store.dispatch(Palettes.removeColor, {paletteId, index});
                }

            }
        ]);

    function onContextMenu(event){
      if (cm.value) {
        cm.value.show(event);
      }
    }
  return { style, hex, value, op, toggle, gradient, stops, isGradient, name, contextItems, onContextMenu, cm};
  },
});
</script>
<style scoped>
.palette-color {
  position: relative;
  width: 150px;
  height: 100%;
}
.overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  transition: .5s ease;
  color: white;
}
.color-name {
  text-align: center;
  display: block;
  width: 100%;
}
</style>
