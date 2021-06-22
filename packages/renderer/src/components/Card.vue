<template>
<div class="p-d-flex p-ai-center p-m-0 p-p-0">
  <div class="card-title p-m-0 p-p-0">
    <slot name="title" />
  </div>
  <div class="card-content p-m-0 p-p-0">
    <slot name="content" />
  </div>
</div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';

export default defineComponent({
  name: 'Card',
  setup() {
    const count = ref(0);

    return {count};
  },
});
</script>
<style>
.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-right: 10px;
  min-width: 200px;
}
.card-content {
  width: 100%;
}
</style>
