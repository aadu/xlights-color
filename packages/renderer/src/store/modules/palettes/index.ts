import type { Getters } from './getters';
import { getters } from './getters';
import type { Mutations } from './mutations';
import { mutations } from './mutations';
import type { Actions} from './actions';
import { actions, ActionTypes } from './actions';
import type {
  Store as VuexStore,
  Module,
  CommitOptions,
  DispatchOptions,
} from 'vuex';
import type { RootState } from '/@/store';
import type { Color } from './color';
export { Color } from './color';

export interface Palette {
  filename?: string;
  directory?: string;
  colors: Array<Color>;
}

export interface State {
  list: Array<Palette>;
  colors: Record<number, Color>;
}

const state: State = {
  list: [],
  colors: {},
};

const palettes: Module<State, RootState> = {
  state,
  mutations,
  actions,
  getters,
};

export { ActionTypes };
export default palettes;

export type Store<S = State> = Omit<
  VuexStore<S>,
  'commit' | 'getters' | 'dispatch'
> & {
  commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
    key: K,
    payload: P,
    options?: CommitOptions
  ): ReturnType<Mutations[K]>;
} & {
  getters: {
    [K in keyof Getters]: ReturnType<Getters[K]>;
  };
} & {
  dispatch<K extends keyof Actions>(
    key: K,
    payload: Parameters<Actions[K]>[1],
    options?: DispatchOptions
  ): ReturnType<Actions[K]>;
};
