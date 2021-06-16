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

export interface RootState {
  workspaces: WorkspaceState;
}

export type RootStore = WorkspaceStore<Pick<RootState, "workspaces">>;
  // & OtherStore<Pick<RootState, "other">> &

// define injection key
export const key: InjectionKey<VuexStore<RootState>> = Symbol();
export const store = createStore<RootState>({
  modules: {
    workspaces,
    // other
  },
});

export default function useStore(): RootStore {
  return baseUseStore(key);
}
