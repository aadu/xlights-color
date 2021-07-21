<template>
  <Dialog
    v-model:visible="dialog"
    header="New Palette"
    :style="{width: '900px'}"
    :dismissable-mask="true"
    :modal="true"
  >
    <div class="p-grid p-fluid">
      <div class="p-col-8">
        <div class="p-inputgroup">
          <span class="p-inputgroup-addon">
            <i class="pi pi-file-o" />
          </span>
          <InputText
            v-model="name"
            type="text"
            placeholder="Palette Name"
          />
        </div>
      </div>
      <div class="p-col">
        Number of non-default colors
        <InputNumber
          v-model="numColors"
          mode="decimal"
          show-buttons
          button-layout="horizontal"
          :min="0"
          :max="8"
          :step="1"
          decrement-button-class="p-button-secondary"
          increment-button-class="p-button-secondary"
          increment-button-icon="pi pi-plus"
          decrement-button-icon="pi pi-minus"
        />
      </div>
      <div class="p-col-12">
        <h4>Type</h4>
        <SelectButton
          v-model="mode"
          :options="options"
        />
        <Divider type="dashed" />
      </div>
      <div class="p-col-12">
        <Fieldset
          v-if="mode === 'Scale'"
          legend="Color Scale"
        >
          <div class="p-grid p-jc-between">
            <div class="p-col-4">
              <div class="p-grid p-jc-start">
                <ColorPicker v-model="color1" />
              </div>
            </div>
            <div class="p-col-4">
              <div class="p-grid p-jc-end">
                <ColorPicker v-model="color2" />
              </div>
            </div>
          </div>
        </Fieldset>
        <Fieldset
          v-if="mode === 'Brewer'"
          legend="Brewer"
        >
          <Dropdown
            v-model="brewerValue"
            :options="brewerOptions"
            option-label="name"
            placeholder="Select Scale"
            style="width: 300px;"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value">
                <div class="p-d-flex">
                  <div class="p-mr-2">
                    {{ slotProps.value.name }}
                  </div>
                  <div
                    v-for="(color, i) in getBrewerColors(slotProps.value.name)"
                    :key="i"
                    class="select-color-box"
                    :style="style(color)"
                  />
                </div>
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #option="slotProps">
              <div class="p-d-flex">
                <div
                  class="p-mr-2"
                  style="width: 80px;"
                >
                  {{ slotProps.option.name }}
                </div>
                <div
                  v-for="(color, i) in getBrewerColors(slotProps.option.name)"
                  :key="i"
                  class="select-color-box"
                  :style="style(color)"
                />
              </div>
            </template>
          </Dropdown>
        </Fieldset>
      </div>
      <div class="p-col-12">
        <div class="p-grid p-jc-between">
          <div
            v-for="(color, i) in colors"
            :key="i"
            class="p-col"
          >
            <div
              class="color-box"
              :style="style(color)"
            >
              <span class="color-box-color-name">{{ color }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="p-col-2 p-offset-10">
        <p-btn
          label="Submit"
          @click="submit"
        />
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts">
import {defineComponent, computed, ref, unref, watch} from 'vue';
import SelectButton from 'primevue/selectbutton';
import useStore from '/@/store';
import { ActionTypes as Workspaces } from '/@/store/modules/workspaces/index';
import Dialog from 'primevue/dialog';
import Fieldset from 'primevue/fieldset';
import { Sketch } from '@ckpack/vue-color';
import InputText from 'primevue/inputtext';
import chroma from 'chroma-js';
import Divider from 'primevue/divider';
import InputNumber from 'primevue/inputnumber';
import brewer from './brewer';
import Dropdown from 'primevue/dropdown';


export default defineComponent({
  name: 'NewPalette',
  components: { ColorPicker: Sketch, Dialog, Fieldset, InputText, SelectButton, Divider, InputNumber, Dropdown},
  emits: ['new:palette'],
  setup (props, { emit }) {
    const store = useStore();
    const dialog = ref(false);
    const color1 = ref('FFFFFF');
    const color2 = ref('000000');
    const name = ref('');
    const mode = ref('Scale');
    const options = ref(['Random', 'Scale', 'Brewer', 'Default']);
    const numColors = ref(6);

    const scale = computed(() => {
      const c1 = typeof unref(color1) === 'string' ? unref(color1) : unref(color1).hex;
      const c2 = typeof unref(color2) === 'string' ? unref(color2) : unref(color2).hex;
      return chroma.scale([c1, c2]).mode('lch').colors(unref(numColors));
    });

    function style(color) {
      return {'background': color};
    }

    function openDialog() {
      dialog.value = true;
    }

    const defaultColors = [
      '#FFFFFF',
      '#000000',
      '#FF0000',
      '#00FF00',
      '#0000FF',
      '#FFFF00',
      '#00FFFF',
      '#FF00FF',
    ];
    const brewerOptions = ref(
      Object.keys(brewer).map(name => {
        return {name};
      }),
    );

    const brewerValue = ref();

    function getBrewerColors(name: string) {
      const index = Math.max(3, unref(numColors));
      const colors = brewer[name][index];
      return colors;
    }
    const colors = computed(() => {
      let scaleColors = [];
      if (unref(mode) === 'Scale') {
        scaleColors = unref(scale);
      } else if (unref(mode) === 'Random') {
        scaleColors = [...Array(unref(numColors)).keys()].map(() => (chroma.random().hex()));
      } else if (unref(mode) === 'Brewer') {
        const bColor = unref(brewerValue) ? unref(brewerValue).name : 'PuOr';
        scaleColors = getBrewerColors(bColor);
      }
      return [...scaleColors, ...[...defaultColors].slice(0, 8 - scaleColors.length)];
    });
    const prevNumColors = ref(unref(numColors));

    watch(() => {
      if (mode.value === 'Default') {
        prevNumColors.value = numColors.value;
        numColors.value = 0;
      } else {
        if (unref(prevNumColors)) {
          numColors.value = prevNumColors.value;
          prevNumColors.value = null;
        }
      }
    });

    function submit() {
      emit('new:palette', {
        filename: unref(name),
        colors: unref(colors),
      });
      dialog.value = false;
      name.value = '';
    }

    return { openDialog, submit, dialog, color1, color2, scale, style, name, mode, options, colors, numColors, brewerValue, brewerOptions, getBrewerColors};
  },
});
</script>
<style>
.color-box {
  width: 80px;
  height: 80px;
  position: relative;
}
.color-box-color-name {
  padding-top: 30px;
  text-align: center;
  display: block;
  width: 100%;
}
.select-color-box {
  width: 22px;
  height: 22px;
  position: relative;
}
</style>
