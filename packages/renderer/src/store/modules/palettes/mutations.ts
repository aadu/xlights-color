import { MutationTree } from "vuex";
import { State, Palette, Color } from "./index";


export enum MutationTypes {
  ADD = "ADD",
  SET = "SET",
  REMOVE = "REMOVE",
  CLEAR = "CLEAR",
  ADD_COLOR = "ADD_COLOR",
  REMOVE_COLOR = "REMOVE_COLOR",
  SET_COLORS = "SET_COLORS",
  CLEAR_COLORS = "CLEAR_COLORS"
}

export interface ColorMutation {
  palette: string
}

export interface AddColor extends ColorMutation {
  color: Color
}

export interface RemoveColor extends ColorMutation {
  index: number
}

export interface SetColors extends ColorMutation {
  colors: Array<Color>
}


export type Mutations<S = State> = {
  [MutationTypes.ADD](state: S, payload: Palette): void;
  [MutationTypes.SET](state: S, payload: Array<Palette>): void;
  [MutationTypes.REMOVE](state: S, payload: string): void;
  [MutationTypes.CLEAR](state: S): void;
  [MutationTypes.ADD_COLOR](state: S, payload: AddColor): void;
  [MutationTypes.SET_COLORS](state: S, payload: SetColors): void;
  [MutationTypes.REMOVE_COLOR](state: S, payload: RemoveColor): void;
  [MutationTypes.CLEAR_COLORS](state: S, payload: ColorMutation): void;
};

export const mutations: MutationTree<State> & Mutations = {
  [MutationTypes.ADD](state, payload) {
    state.list.push({ ...payload })
  },
  [MutationTypes.SET](state, payload) {
    state.list = payload;
  },
  [MutationTypes.REMOVE](state, payload) {
    state.list = state.list.filter(({ filename }) => filename !== payload)
  },
  [MutationTypes.CLEAR](state) {
    state.list = [];
  },
  [MutationTypes.ADD_COLOR](state, payload) {
    const palette = state.list.filter((p) => p.filename === payload.palette)[0]
    palette.colors.push({...payload.color})
  },
  [MutationTypes.SET_COLORS](state, payload) {
    const palette = state.list.filter((p) => p.filename === payload.palette)[0]
    palette.colors = [...payload.colors];
  },
  [MutationTypes.REMOVE_COLOR](state, payload) {
    const palette = state.list.filter((p) => p.filename === payload.palette)[0]
    palette.colors = palette.colors.splice(payload.index, 1);
  },
  [MutationTypes.CLEAR_COLORS](state, payload) {
    const palette = state.list.filter((p) => p.filename === payload.palette)[0]
    palette.colors = []
  },
};
