<template>
<Card class="p-m-0 p-p-0 palette-color" :style="style" @contextmenu="toggle">
  <template #content>
    {{ hex }}
    <svg v-if="index >= 8" class="overlay" width="150" height="83">
      <line x1="0" y1="100%" x2="100%" y2="0" style="stroke:rgb(255,0,0);stroke-width:2"/>
    </svg>
  </template>
</Card>
<OverlayPanel ref="op">
  <ColorPicker v-model="value" :inline="true" />
</OverlayPanel>
</template>

<script lang="ts">
import {defineComponent, ref, reactive, computed, watch} from 'vue';
import ColorPicker from 'primevue/colorpicker';
import OverlayPanel from 'primevue/overlaypanel';
import Card from 'primevue/card';
import chroma from "chroma-js";
import { Color } from '/@/store/modules/palettes/color';
import debounce from 'lodash.debounce'
import useStore from "/@/store";



export default defineComponent({
  name: 'Color',
  components: { Card, ColorPicker, OverlayPanel },
  props: {
    color: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: false,
      default: 0
    }
  },
  setup (props, { emit }) {
    const store = useStore();
    const color = computed(() => {
      const value = store.state.palettes.colors[props.color.id].value;
      return chroma(value);
    })
    const op = ref(null)
    const hex = computed(() => color.value.hex())
    const value = ref(hex.value)
    // const value = computed({
    //   get() {
    //     return color.value.hex()
    //   },
    //   set(value: string) {
    //     emit('update:color', new Color(value))
    //   }
    // })
    const style = computed(() => ({
      'background-color': color.value.hex(),
      'color': color.value.luminance() > .5 ? 'black' : 'white'
    }))
    const updateColor = debounce(function (value: string) {
      const color = new Color(value)
      color.id = props.color.id
      emit('update:color', color)
    }, 250)
    watch(value, (color) => {
      updateColor(color)
    })
    function toggle(event) {
      if (op.value) {
        op.value.toggle(event);
      }
    }
    return { style, hex, value, op, toggle }
  }
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
