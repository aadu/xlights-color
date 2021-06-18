import type { ActionContext, ActionTree } from 'vuex';
import type { Mutations} from './mutations';
import { MutationTypes } from './mutations';
import type { State } from './index';
import type { RootState } from '/@/store';

export enum ActionTypes {
  setCurrent = 'WORKSPACES__SET_VALUE',
}

// !!! AUGUMENTED ACTION CONTEXT !!!
type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, RootState>, 'commit'>;

export interface Actions {
  [ActionTypes.setCurrent](
    { commit }: AugmentedActionContext,
    payload: string
  ): void;
}

export const actions: ActionTree<State, RootState> & Actions = {
  [ActionTypes.setCurrent]({ commit }, payload) {
    commit(MutationTypes.SET_CURRENT, payload);
  },
};
