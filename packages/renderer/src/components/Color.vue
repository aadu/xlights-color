<template>
  <Card
    class="p-m-0 p-p-0 palette-color"
    :style="style"
    @click.exact="toggle"
    @click.ctrl="toggle($event, true)"
    @contextmenu="onContextMenu"
  >
    <template #content>
      <span
        v-if="!isGradient"
        class="color-name"
        v-text="name"
      />
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
      <svg
        v-if="highlight"
        class="overlay"
        width="150"
        height="83"
      >
        <rect
          width="150"
          height="83"
          fill-opacity="0.0"
          style="stroke:rgb(255,255,0);stroke-width:4"
        />
      </svg>
    </template>
  </Card>
  <ContextMenu
    ref="cm"
    :model="contextItems"
  />
  <OverlayPanel
    ref="op"
    class="color-picker-container"
  >
    <GradientPicker
      v-if="gradient"
      v-model="stops"
      style="box-shadow: none;"
    />
    <ColorPicker
      v-else
      v-model="value"
      style="box-shadow: none;"
    />
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
import { emitter } from '/@/bus';



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
      default: false,
    },
  },
  emits: ['highlight', 'randomize:colors', 'reverse:order', 'delete:palette', 'download:palette', 'clone:palette', 'randomize:order', 'new:palette', 'save:palette'],
  setup (props, { emit }) {
    const { paletteId, id, dragging: isDragging} = props;
    // data
    const dragging = ref(isDragging);
    const store = useStore();
    const color = computed(() => {
      return store.state.palettes.colors[id];
    });
    const stops = ref(color.value.stops.map(stop => [...stop]));
    const hex = computed(() => chroma(color.value.value).hex());
    const name = computed(() => chroma(hex.value).name());
    const value = ref(hex.value);
    const gradient = ref(false);
    const ignoreStops = ref(false);
    const op = ref(null);
    const cm = ref(null);
    const visible = computed(() => {
      if (cm.value) {
        return cm.value.visible;
      }
    });

    const style = computed(() => {
      return {
        'background': color.value.toString(),
        'color': chroma(color.value.value).luminance() > .5 ? 'black' : 'white',
      };
    });
    // const dragging = computed(() => (props.dragging));
    const isGradient = computed(() => {
      return stops.value.length > 1;
    });

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
    });
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
    }
    const contextItems = ref([
            {
              label: 'Color',
              icon: 'pi pi-fw pi-circle-on',
              items: [
            {
               label:'New',
               icon:'pi pi-fw pi-plus',
                command: () => {
                  const color = new Color(chroma.random().hex());
                  store.dispatch(Palettes.addColor, {paletteId, color, index: props.index + 1});
                },

            },
            {
               label:'Duplicate',
               icon:'pi pi-clone',
                command: () => {
                  const color = new Color(hex.value, stops.value);
                  store.dispatch(Palettes.addColor, {paletteId, color, index: props.index + 1});
                },
            },
            {
               label:'Randomize',
               icon:'pi pi-refresh',
                command: () => {
                  value.value = {hex: chroma.random().hex()};
                },
            },
              {
               label:'Brighten',
               icon:'pi pi-chevron-up',
                command: () => {
                  value.value = {hex: chroma(unref(hex)).brighten().hex()};
                },
            },
            {
               label:'Darken',
               icon:'pi pi-chevron-down',
                command: () => {
                  value.value = {hex: chroma(unref(hex)).darken().hex()};
                },
            },
            {
               separator:true,
            },
            {
               label:'Delete',
               icon:'pi pi-fw pi-trash',
                command: () => {
                  store.dispatch(Palettes.removeColor, {paletteId, id});
                },

            },
              ],
            },
                        {
               separator:true,
            },

                        {
               label:'Palette',
               icon:'pi pi-fw pi-th-large',
               items:[
                    {
                        label:'New',
                      icon:'pi pi-fw pi-plus',
                            command: () => {
                              emit('new:palette', paletteId);
                            },
                    },
                    {
                        label:'Clone',
                        icon:'pi pi-clone',
                        command: () => {
                          emit('clone:palette', paletteId);
                        },
                    },
                    {
                        label:'Randomize Order',
                        icon:'pi pi-refresh',
                        command: () => {
                          emit('randomize:order', paletteId);
                        },
                    },
                      {
                        label:'Randomize Colors',
                        icon:'pi-replay',
                        command: () => {
                          emit('randomize:colors', paletteId);
                        },
                    },
                    {
                        label:'Reverse Order',
                        icon:'pi pi-sort-alpha-up-alt',
                        command: () => {
                          emit('reverse:order', paletteId);
                        },
                    },
                       {
                       separator:true,
                    },
                      {
                        label:'Delete',
                        icon:'pi pi-fw pi-trash',
                        command: () => {
                          emit('delete:palette', paletteId);
                        },
                    },
                    {
                       label:'Export',
                       icon:'pi pi-fw pi-external-link',
                       command: () => {
                          emit('download:palette', paletteId);
                        },
                    },
                    {
                      label: 'Save',
                      icon: 'pi pi-fw pi-save',
                      command: () => {
                        emit('save:palette', paletteId);
                      },
                    },
                ],
            },
        ]);

    const highlight = ref(false);
    function onContextMenu(event){
      if (cm.value) {
        emitter.emit('contextmenu');
        cm.value.show(event);
        setTimeout(() => {
          highlight.value = true;
        }, 250);
      }
    }
    emitter.on('contextmenu', () => {
      if (cm.value && cm.value.visible) {
        cm.value.hide();
      }
    });
    watch(visible, (menu, old) => {
      if (!menu && menu !== old) {
        highlight.value = false;
      }
    });
    watch(highlight, (value, old) => {
      if (value !== old) {
        emit('highlight', value);
      }
    });
  return {
    cm,
    highlight,
    contextItems,
    gradient,
    hex,
    isGradient,
    name,
    onContextMenu,
    op,
    stops,
    style,
    toggle,
    value,
  };
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
