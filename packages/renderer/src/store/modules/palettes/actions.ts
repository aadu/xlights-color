import type { ActionContext, ActionTree } from 'vuex';
import type { Mutations, ColorMutation, AddColor, RemoveColor, SetColors, UpdateColor, UpdateName } from './mutations';
import { MutationTypes } from './mutations';
import type { State, Palette } from './index';
import type { RootState } from '/@/store';

export enum ActionTypes {
  add = 'PALETTES__ADD',
  set = 'PALETTES__SET',
  remove = 'PALETTES__REMOVE',
  clear = 'PALETTES__CLEAR',
  addColor = 'PALETTES__ADD_COLOR',
  setColors = 'PALETTES__SET_COLOR',
  removeColor = 'PALETTES__REMOVE_COLOR',
  clearColors = 'PALETTES__CLEAR_COLORS',
  updateColor = 'PALETTES__UPDATE_COLOR',
  updateName = 'PALETTES__UPDATE_NAME'
}

// !!! AUGUMENTED ACTION CONTEXT !!!
type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, RootState>, 'commit'>;

export interface Actions {
  [ActionTypes.set](
    { commit }: AugmentedActionContext,
    payload: Array<Palette>
  ): void;
  [ActionTypes.add](
    { commit }: AugmentedActionContext,
    payload: Palette
  ): void;
  [ActionTypes.remove](
    { commit }: AugmentedActionContext,
    payload: string
  ): void;
  [ActionTypes.clear](
    { commit }: AugmentedActionContext
  ): void;
  [ActionTypes.setColors](
    { commit }: AugmentedActionContext,
    payload: SetColors
  ): void;
  [ActionTypes.addColor](
    { commit }: AugmentedActionContext,
    payload: AddColor
  ): void;
  [ActionTypes.removeColor](
    { commit }: AugmentedActionContext,
    payload: RemoveColor
  ): void;
  [ActionTypes.updateColor](
    { commit }: AugmentedActionContext,
    payload: UpdateColor
  ): void;
  [ActionTypes.clearColors](
    { commit }: AugmentedActionContext,
    payload: ColorMutation
  ): void;
  [ActionTypes.updateName](
    { commit }: AugmentedActionContext,
    payload: UpdateName
  ): void;
}

export const actions: ActionTree<State, RootState> & Actions = {
  [ActionTypes.set]({ commit }, payload) {
    commit(MutationTypes.SET, payload);
  },
  [ActionTypes.add]({ commit }, payload) {
    commit(MutationTypes.ADD, payload);
  },
  [ActionTypes.remove]({ commit }, payload) {
    commit(MutationTypes.REMOVE, payload);
  },
  [ActionTypes.clear]({ commit }) {
    commit(MutationTypes.CLEAR, undefined);
  },
  [ActionTypes.setColors]({ commit }, payload) {
    commit(MutationTypes.SET_COLORS, payload);
  },
  [ActionTypes.addColor]({ commit }, payload) {
    commit(MutationTypes.ADD_COLOR, payload);
  },
  [ActionTypes.removeColor]({ commit }, payload) {
    commit(MutationTypes.REMOVE_COLOR, payload);
  },
  [ActionTypes.updateColor]({ commit }, payload) {
    commit(MutationTypes.UPDATE_COLOR, payload);
  },
  [ActionTypes.clearColors]({ commit }, payload) {
    commit(MutationTypes.CLEAR_COLORS, payload);
  },
  [ActionTypes.updateName]({ commit }, payload) {
    commit(MutationTypes.UPDATE_NAME, payload);
  },
};
