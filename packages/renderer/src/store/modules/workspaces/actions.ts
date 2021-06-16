import { ActionContext, ActionTree } from "vuex";
import { Mutations, MutationTypes } from "./mutations";
import { State } from "./index";
import { RootState } from "/@/store";

export enum ActionTypes {
  setCurrent = "WORKSPACES__SET_VALUE",
}

// !!! AUGUMENTED ACTION CONTEXT !!!
type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, RootState>, "commit">;

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
