import type { InjectionKey } from 'vue';
import type {
  Store as VuexStore} from 'vuex';
import {
  createStore,
  useStore as baseUseStore,
} from 'vuex';
import type {
  State as WorkspaceState,
  Store as WorkspaceStore,
} from './modules/workspaces';
import workspaces from './modules/workspaces';
import type {
  State as PaletteState,
  Store as PaletteStore,
} from './modules/palettes';
import palettes from './modules/palettes';


export interface RootState {
  workspaces: WorkspaceState;
  palettes: PaletteState;
}

export type RootStore = WorkspaceStore<Pick<RootState, 'workspaces'>> & PaletteStore<Pick<RootState, 'palettes'>>;

// define injection key
export const key: InjectionKey<VuexStore<RootState>> = Symbol();
export const store = createStore<RootState>({
  modules: {
    workspaces,
    palettes,
  },
});

export default function useStore(): RootStore {
  return baseUseStore(key);
}
