import type { MutationTree } from 'vuex';
import type { State } from './index';

export enum MutationTypes {
  SET_CURRENT = 'SET_CURRENT',
}

export type Mutations<S = State> = {
  [MutationTypes.SET_CURRENT](state: S, payload: string): void;
};

export const mutations: MutationTree<State> & Mutations = {
  [MutationTypes.SET_CURRENT](state, payload) {
    state.current = payload;
  },
};
