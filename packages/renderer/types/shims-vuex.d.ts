// vuex.d.ts

import { ComponentCustomProperties } from 'vue';
import type { Store } from 'vuex';

declare module '@vue/runtime-core' {
  // Declare your own store states.
  interface State {
    count: number
  }

  interface ComponentCustomProperties {
    $store: Store<State>
  }
}
