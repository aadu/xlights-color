import { MutationTree } from "vuex";
import { State } from "./index";

export enum MutationTypes {
  VALUE = "SET_VALUE",
}

export type Mutations<S = State> = {
  [MutationTypes.VALUE](state: S, payload: any): void;
};

export const mutations: MutationTree<State> & Mutations = {
  [MutationTypes.VALUE](state, payload) {
    state.value = payload;
  },
};
