import { ActionContext, ActionTree } from "vuex";
import { Mutations, MutationTypes } from "./mutations";
import { State } from "./index";
import { RootState } from "/@/store";

export enum ActionTypes {
  setValue = "GENERIC__SET_VALUE",
}

// !!! AUGUMENTED ACTION CONTEXT !!!
type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, RootState>, "commit">;

export interface Actions {
  [ActionTypes.setValue](
    { commit }: AugmentedActionContext,
    payload: any
  ): void;
}

export const actions: ActionTree<State, RootState> & Actions = {
  [ActionTypes.setValue]({ commit }, payload) {
    commit(MutationTypes.VALUE, payload);
  },
};
