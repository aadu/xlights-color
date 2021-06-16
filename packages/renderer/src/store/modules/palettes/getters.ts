import { GetterTree } from "vuex";
import { State, Palette } from "./index";
import { RootState } from "/@/store";

export type Getters<S = State> = {
  palettes(state: S): Array<Palette>;
};

export const getters: GetterTree<State, RootState> & Getters = {
  palettes: (state) => {
    return state.list;
  },
};
