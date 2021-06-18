import type { GetterTree } from 'vuex';
import type { State, Palette } from './index';
import type { RootState } from '/@/store';

export type Getters<S = State> = {
  palettes(state: S): Array<Palette>;
};

export const getters: GetterTree<State, RootState> & Getters = {
  palettes: (state) => {
    return state.list;
  },
};
