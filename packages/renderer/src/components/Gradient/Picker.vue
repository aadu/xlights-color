<template>
  <div class="vue-gpickr">
    <color-picker
      v-model="currentColor"
      :preset-colors="null"
    />

    <div class="vue-gpickr-inner-container">
      <div class="vue-gpickr-preview-container">
        <div
          class="vue-gpickr-preview"
          :style="previewStyle"
        />
      </div>

      <div
        ref="stopsContainer"
        class="vue-gpickr-stops-container"
      >
        <div class="vue-gpickr-stops-preview-container">
          <div
            class="vue-gpickr-stops-preview"
            :style="stopsPreviewStyle"
            @click.stop.prevent="addStop($event)"
          />
        </div>
        <div
          v-for="(stop, index) in stops"
          :key="index"
          class="vue-gpickr-stop"
          :style="stopStyle(index)"
          :class="{ active: index == currentStopIdx }"
          @mousedown.stop="handleMouseDown(index, $event)"
          @touchstart.stop="handleTouchstart(index, $event)"
        />
      </div>

      <div class="vue-gpickr-controls-container">
        <div class="vue-gpickr-slider-container">
          <input
            v-model="angle"
            type="range"
            min="0"
            max="360"
            step="1"
          >
          <div class="label">
            Angle
          </div>
        </div>
        <div class="vue-gpickr-input-container">
          <input
            v-model="angle"
            type="text"
          >
          <div class="label">
            Deg&deg;
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Sketch  } from '@ckpack/vue-color';
import LinearGradient from './grad';
import {defineComponent, computed, reactive, watch, ref, unref, onBeforeUnmount } from 'vue';

const COLOR = 0;
const POSITION = 1;
const REMOVE_TRESHOLD = 50;

type Stop = [string, number]

const defaultStops: Stop[] = [
  ['#0359b5', 0],
  ['#f6ce01', 1],
];


export default defineComponent({
  components: {
    colorPicker: Sketch,
  },
  props: {
    modelValue: {
      type: LinearGradient,
      default: () => new LinearGradient(),
    },
  },
  emits: ['update:modelValue'],
  setup(props, {emit}) {
    const currentStopIdx = ref(0);
    const containerBoundingClientRectangle = ref({});
    const internalAngle = ref(0)
    const stops: Stop[] = reactive(defaultStops.slice().map(stop => [...stop]));
    const stopsContainer = ref(null);


    const emitInput = (angle, stops) => {
      const newValue = new LinearGradient(stops, angle);
      console.log('emitInput', newValue)
      emit('update:modelValue', newValue);
      // _angle.value = unref(angle);
    }
    // const stops = computed(() => {
    //   console.log('computedStops')
    //   return props.modelValue.stops.slice().map(stop => [...stop]);
    // });

    const angle = computed({
      get() {
        return internalAngle.value;
      },
      set(val) {
        let degrees = parseInt(val, 10) || 0;
        if (degrees < 0) {
          degrees = 0;
        }
        while (degrees > 360) {
          degrees = 360;
        }
        internalAngle.value = degrees;
      },
    });

    const orderedStops = computed(() => {
      return stops.slice().sort((a, b) => a[POSITION] - b[POSITION]);
    });


    function getGradientString(angle: number) {
      const stops = orderedStops.value.map(stop => `${stop[COLOR].toString()} ${stop[POSITION] * 100}%`).join(',');
      console.log('getGradientStringstops', stops)
      return `linear-gradient(${angle}deg, ${stops})`;
    }
    const previewStyle = computed(() => {
      return { background: getGradientString(unref(angle)) };
    });


    const stopsPreviewStyle = computed(() => {
      return { background: getGradientString(90) };
    });

    const currentColor = computed({
      get(): string {
        return stops[currentStopIdx.value][COLOR];
      },
      set(val) {
        stops[currentStopIdx.value][COLOR] = val.hex8;
      },
    });

    function setCurrentStopIdx(index: number) {
      currentStopIdx.value = index;
    }

    function stopStyle(index: number) {
      const stop = stops[index];
      return { left: `${stop[POSITION] * 100}%`, color: stop[COLOR].toString() };
    }

    function addStop(event) {
      const position = Math.round(event.offsetX * 100 / event.target.offsetWidth) / 100;
      const index = stops.length;
      stops.push([unref(currentColor), position]);
      setCurrentStopIdx(index);
      emitInput(angle, stops);
    }

    function handleChange (event) {
      if (!stopsContainer.value) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();

      if (stops.length > 2) { // Gradient must have at least 2 stops
        const y = (event.touches ? event.touches[0].clientY : event.clientY) || 0;
        const verticalDistance = Math.abs(y - containerBoundingClientRectangle.value.bottom);

        if (verticalDistance > REMOVE_TRESHOLD) {
          removeCurrentStop();
          return;
        }
      }

      const x = (event.touches ? event.touches[0].clientX : event.clientX) || 0;
      const left = x - containerBoundingClientRectangle.value.left;

      const containerWidth = containerBoundingClientRectangle.value.width;

      let position;
      if (left < 0) {
        position = 0;
      } else if (left > containerWidth) {
        position = 1;
      } else {
        position = Math.round(left * 100 / containerWidth) / 100;
      }

      const previousPosition = stops[currentStopIdx.value][POSITION];
      stops[currentStopIdx.value][POSITION] = position;
      if (previousPosition != position) {
        emitInput(angle, stops);
      }
    }

    function handleMouseDown (index) {
      setCurrentStopIdx(index);
      setContainerBoundingClientRectangle();
      window.addEventListener('mousemove', handleChange);
      window.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseUp () {
      unbindEventListeners();
    }

    function handleTouchstart(index) {
      setCurrentStopIdx(index);
      setContainerBoundingClientRectangle();
      window.addEventListener('touchmove', handleChange, { passive: false });
      window.addEventListener('touchend', handleTouchend);
      window.addEventListener('touchcancel', handleTouchend);
    }

    function handleTouchend () {
      unbindEventListeners();
    }

    function unbindEventListeners () {
      window.removeEventListener('mousemove', handleChange);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleChange, { passive: false });
      window.removeEventListener('touchend', handleTouchend);
      window.removeEventListener('touchcancel', handleTouchend);
    }

    function removeCurrentStop() {
      stops = stops.splice(currentStopIdx.value, 1);
      if (currentStopIdx.value > 0) {
        setCurrentStopIdx(currentStopIdx.value - 1);
      }
      unbindEventListeners();
      emitInput(angle, stops);
    }

    function setContainerBoundingClientRectangle() {
      containerBoundingClientRectangle.value = stopsContainer.value.getBoundingClientRect();
      console.log('containerBoundingClientRectangle', containerBoundingClientRectangle);
    }

    onBeforeUnmount(() => {
      unbindEventListeners();
    });

    return {
      addStop,
      angle,
      containerBoundingClientRectangle,
      currentColor,
      currentStopIdx,
      handleChange,
      handleMouseDown,
      handleMouseUp,
      handleTouchend,
      handleTouchstart,
      orderedStops,
      stopsContainer,
      previewStyle,
      removeCurrentStop,
      setContainerBoundingClientRectangle,
      stops,
      stopsPreviewStyle,
      stopStyle,
      unbindEventListeners,
    };
  }
});
</script>

<style lang="scss" scoped>
::v-deep {
  .vc-sketch {
    box-shadow: none;
    padding: 10px;
    .vc-sketch-presets {
      display: none;
    }
    .vc-sketch-saturation-wrap {
      overflow: visible;
    }
    .vc-saturation-pointer {
      margin-top: -2px;
    }
    .vc-sketch-field {
      input {
        text-align: center;
        padding: 4px 0 3px;
      }
    }
  }
}
.vue-gpickr {
  position: relative;
  display: inline-flex;
  flex-direction: row;
  background: #FFF;
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, .15), 0 8px 16px rgba(0, 0, 0, .15);
  .vue-gpickr-inner-container {
    padding: 10px;
    padding-left: 0;
    user-select: none;
    .vue-gpickr-preview-container {
      width: 200px;
      height: 150px;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMElEQVQ4T2N89uzZfwY8QFJSEp80A+OoAcMiDP7//483HTx//hx/Ohg1gIFx6IcBALl+VXknOCvFAAAAAElFTkSuQmCC);
      background-size: 10px;
      position: relative;
      .vue-gpickr-preview {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }
    }
    .vue-gpickr-stops-container {
      position: relative;
      .vue-gpickr-stops-preview-container {
        width: 200px;
        height: 24px;
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMElEQVQ4T2N89uzZfwY8QFJSEp80A+OoAcMiDP7//483HTx//hx/Ohg1gIFx6IcBALl+VXknOCvFAAAAAElFTkSuQmCC);
        background-size: 10px;
        position: relative;
        margin-top: 4px;
        border-radius: 2px;
        .vue-gpickr-stops-preview {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          border-radius: 2px;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .15), inset 0 0 4px rgba(0, 0, 0, .25);
        }
      }
      .vue-gpickr-stop {
        position: absolute;
        bottom: 0;
        width: 12px;
        height: 12px;
        transform: translate(-6px, 6px);
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        &::before {
          content: '';
          width: 4px;
          height: 4px;
          box-shadow: 0 0 0 1.5px #fff, inset 0 0 1px 1px rgba(0,0,0,.3), 0 0 1px 2px rgba(0,0,0,.4);
          border-radius: 50%;
          background: currentColor;
        }
        &.active {
          z-index: 3;
          &::before {
            content: '';
            box-shadow: 0 0 0 2.5px #fff, inset 0 0 1px 1px rgba(0, 0, 0, 0.3), 0 0 1px 3px rgba(0,0,0,.4);
            width: 6px;
            height: 6px;
          }
        }
      }
    }
    .vue-gpickr-controls-container {
      margin-top: 8px;
      display: flex;
      font-size: 0;
      .vue-gpickr-slider-container {
        flex-grow: 1;
        input {
          box-sizing: border-box;
          width: 100%;
          height: 19px;
          margin: 0 2px;
          padding: 0;
          background-color: transparent;
          appearance: none;
          outline: none;
          &::-webkit-slider-thumb {
            -webkit-appearance: none;
            cursor: pointer;
            width: 5px;
            border-radius: 1px;
            height: 10px;
            border: 0;
            box-shadow: 0 0 2px rgba(0, 0, 0, .6), inset 0 0 0 0.5px rgba(0, 0, 0, 0.4);
            background: #fff;
            z-index: 2;
          }

          &::-moz-range-thumb {
            cursor: pointer;
            width: 5px;
            border-radius: 1px;
            height: 10px;
            border: 0;
            box-shadow: 0 0 2px rgba(0, 0, 0, .6), inset 0 0 0 0.5px rgba(0, 0, 0, 0.4);
            background: #fff;
          }

          &::-ms-thumb {
            cursor: pointer;
            width: 5px;
            border-radius: 1px;
            height: 10px;
            border: 0;
            box-shadow: 0 0 2px rgba(0, 0, 0, .6), inset 0 0 0 0.5px rgba(0, 0, 0, 0.4);
            background: #fff;
          }

          &::-webkit-slider-runnable-track {
            width: 100%;
            height: 10px;
            cursor: pointer;
            background: rgba(0, 0, 0, .05);
            border: 0;
            border-radius: 2px;
            box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
            z-index: 1;
          }

          &::-moz-range-track {
            width: 100%;
            height: 10px;
            cursor: pointer;
            background: rgba(0, 0, 0, .05);
            border: 0;
            border-radius: 2px;
            box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
          }

          &::-ms-track {
            width: 100%;
            height: 10px;
            cursor: pointer;
            background: transparent;
            border-color: transparent;
            border-width: 16px 0;
            color: transparent;
          }
          &::-ms-fill-lower {
            border: 0;
            background: rgba(0, 0, 0, .05);
            border-radius: 2px;
            box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
          }
          &::-ms-fill-upper {
            border: 0;
            background: rgba(0, 0, 0, .05);
            border-radius: 2px;
            box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
          }
        }
      }
      .vue-gpickr-input-container {
        width: 30px;
        margin-left: 8px;
        input {
          text-align: center;
          box-sizing: border-box;
          width: 100%;
          padding: 4px 0 3px;
          border: none;
          outline: none;
          box-shadow: inset 0 0 0 1px #ccc;
          font-size: 10px;
        }
      }
      .label {
        text-align: center;
        font-size: 11px;
        color: #222;
        padding-top: 3px;
        padding-bottom: 4px;
        text-transform: capitalize;
      }
    }
  }
}
@media (max-width: 430px) {
  .vue-gpickr {
    flex-direction: column;
    .vue-gpickr-inner-container {
      padding-left: 10px;
      padding-top: 0;
    }
  }
}
</style>
