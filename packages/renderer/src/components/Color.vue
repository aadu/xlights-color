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
import {defineComponent, ref, reactive, watchEffect} from 'vue';
import ColorPicker from 'primevue/colorpicker';
import OverlayPanel from 'primevue/overlaypanel';
import Card from 'primevue/card';
import chroma from "chroma-js";



export default defineComponent({
  name: 'Color',
  components: { Card, ColorPicker, OverlayPanel },
  props: {
    color: {
      type: Object,
      required: true
    }
  },
  setup (props) {
    const color = chroma(props.color.value)
    const op = ref(null)
    const hex = ref(color.hex())
    const value = ref(hex)
    const style = reactive({
      'background-color': color.hex(),
      'color': color.luminance() > .5 ? 'black' : 'white'
    })
    watchEffect(() => {
      console.log('value', value.value)
    })
    function toggle(event) {
      op.value.toggle(event);
    }
    return { style, hex, value, op, toggle }
  }
});
</script>
