import { InjectionKey } from "vue";
import {
  createStore,
  Store as VuexStore,
  useStore as baseUseStore,
} from "vuex";
import workspaces, {
  State as WorkspaceState,
  Store as WorkspaceStore,
} from "./modules/workspaces";
import palettes, {
  State as PaletteState,
  Store as PaletteStore,
} from "./modules/palettes";


export interface RootState {
  workspaces: WorkspaceState;
  palettes: PaletteState;
}

export type RootStore = WorkspaceStore<Pick<RootState, "workspaces">> & PaletteStore<Pick<RootState, "palettes">>;

// define injection key
export const key: InjectionKey<VuexStore<RootState>> = Symbol();
export const store = createStore<RootState>({
  modules: {
    workspaces,
    palettes
  },
});

export default function useStore(): RootStore {
  return baseUseStore(key);
}
