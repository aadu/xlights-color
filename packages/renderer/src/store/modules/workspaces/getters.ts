import { GetterTree } from "vuex";
import { State } from "./index";
import { RootState } from "/@/store";

export type Getters<S = State> = {
  value(state: S): any;
};

export const getters: GetterTree<State, RootState> & Getters = {
  value: (state) => {
    return state.value;
  },
};
