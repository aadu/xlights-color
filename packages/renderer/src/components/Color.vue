<template>
  <Card class="p-ma-0" :style="style" @contextmenu="toggle">
    <template #content>
      {{ hex }}
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
