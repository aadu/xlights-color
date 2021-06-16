import { GetterTree } from "vuex";
import { State } from "./index";
import { RootState } from "/@/store";

export type Getters<S = State> = {
  currentWorkspace(state: S): string | undefined;
};

export const getters: GetterTree<State, RootState> & Getters = {
  currentWorkspace: (state) => {
    return state.current;
  },
};
