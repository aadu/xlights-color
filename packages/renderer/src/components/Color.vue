<template>
  <Card
    class="p-m-0 p-p-0 palette-color"
    :style="style"
    @click="toggle"
    @contextmenu="toggle($event, true)"
  >
    <template #content>
      {{ hex }}
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
  <OverlayPanel ref="op" class="color-picker-container">
    <GradientPicker style="box-shadow: none;" v-if="gradient" v-model="stops" />
    <ColPicker v-model="value" v-else style="box-shadow: none;"/>
  </OverlayPanel>
</template>

<script lang="ts">
import {defineComponent, ref, reactive, computed, watch} from 'vue';
import ColorPicker from 'primevue/colorpicker';
import GradientPicker from './GradientPicker.vue';
import { Sketch } from '@ckpack/vue-color';
import OverlayPanel from 'primevue/overlaypanel';
import Card from 'primevue/card';
import chroma from 'chroma-js';
import { Color } from '/@/store/modules/palettes/color';
import debounce from 'lodash.debounce';
import useStore from '/@/store';



export default defineComponent({
  name: 'Color',
  components: { Card, ColorPicker, OverlayPanel, ColPicker: Sketch, GradientPicker  },
  props: {
    color: {
      type: Object,
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
  setup (props, { emit }) {
    const store = useStore();
    const color = computed(() => {
      return store.state.palettes.colors[props.color.id];
    });

    // const color = computed(() => {
    //   const value = store.state.palettes.colors[props.color.id].value;
    //   return chroma(value);
    // });
    const stops = ref(color.value.stops);
    const hex = computed(() => chroma(color.value.value).hex());
    const op = ref(null);

    const value = ref(hex.value);
    const gradient = ref(false);

    // const value = computed({
    //   get() {
    //     return color.value.hex()
    //   },
    //   set(value: string) {
    //     emit('update:color', new Color(value))
    //   }
    // })
    const style = computed(() => ({
      'background': color.value.toString(),
      'color': chroma(color.value.value).luminance() > .5 ? 'black' : 'white',
    }));
    const updateColor = debounce(function (value) {
      const color = new Color(value.hex);
      color.id = props.color.id;
      emit('update:color', color);
    }, 250);
    const updateStops = debounce(function (stops) {
      const color = new Color('', stops);
      color.id = props.color.id;
      emit('update:color', color);
    }, 250);
    watch(value, (value) => {
      updateColor(value);
      stops.value = [[value.hex, 0.5]];
    });
    watch(stops, (stops) => {
      updateStops(stops)
    })

    function toggle(event, isGradient = false) {
      gradient.value = isGradient;
      if (op.value) {
        op.value.toggle(event);
      }
    }
    const dragging = computed(() => (props.dragging));

    watch(dragging, (current, prev) => {
      if (current && !prev) {
        op.value.hide();
      }
    })

  return { style, hex, value, op, toggle, gradient, stops };
  },
});
</script>
<style scoped>
.palette-color {
  position: relative;
  width: 150px;
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
</style>
