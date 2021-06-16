import { ActionContext, ActionTree } from "vuex";
import { Mutations, MutationTypes, ColorMutation, AddColor, RemoveColor, SetColors } from "./mutations";
import { State, Palette } from "./index";
import { RootState } from "/@/store";

export enum ActionTypes {
  add = "PALETTES__ADD",
  set = "PALETTES__SET",
  remove = "PALETTES__REMOVE",
  clear = "PALETTES__CLEAR",
  addColor = "PALETTES__ADD_COLOR",
  setColors = "PALETTES__SET_COLOR",
  removeColor = "PALETTES__REMOVE_COLOR",
  clearColors = "PALETTES__CLEAR_COLORS",
}

// !!! AUGUMENTED ACTION CONTEXT !!!
type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, RootState>, "commit">;

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
  [ActionTypes.clearColors](
    { commit }: AugmentedActionContext,
    payload: ColorMutation
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
  [ActionTypes.clearColors]({ commit }, payload) {
    commit(MutationTypes.CLEAR_COLORS, payload);
  },
};
