import type { GetterTree } from 'vuex';
import type { State } from './index';
import type { RootState } from '/@/store';

export type Getters<S = State> = {
  currentWorkspace(state: S): string | undefined;
};

export const getters: GetterTree<State, RootState> & Getters = {
  currentWorkspace: (state) => {
    return state.current;
  },
};
