import type { MutationTree } from 'vuex';
import type { State, Palette, Color } from './index';

export enum MutationTypes {
  ADD = 'ADD',
  SET = 'SET',
  REMOVE = 'REMOVE',
  CLEAR = 'CLEAR',
  ADD_COLOR = 'ADD_COLOR',
  REMOVE_COLOR = 'REMOVE_COLOR',
  SET_COLORS = 'SET_COLORS',
  CLEAR_COLORS = 'CLEAR_COLORS',
  UPDATE_COLOR = 'UPDATE_COLOR',
  UPDATE_NAME = 'UPDATE_NAME'
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

export interface UpdateColor extends ColorMutation {
  index: number
  color: Color
}

export interface UpdateName {
  index: number
  name: string
}

export type Mutations<S = State> = {
  [MutationTypes.ADD](state: S, payload: Palette): void;
  [MutationTypes.SET](state: S, payload: Array<Palette>): void;
  [MutationTypes.UPDATE_NAME](state: S, payload: UpdateName): void;
  [MutationTypes.REMOVE](state: S, payload: string): void;
  [MutationTypes.CLEAR](state: S): void;
  [MutationTypes.ADD_COLOR](state: S, payload: AddColor): void;
  [MutationTypes.UPDATE_COLOR](state: S, payload: UpdateColor): void;
  [MutationTypes.SET_COLORS](state: S, payload: SetColors): void;
  [MutationTypes.REMOVE_COLOR](state: S, payload: RemoveColor): void;
  [MutationTypes.CLEAR_COLORS](state: S, payload: ColorMutation): void;
};

export const mutations: MutationTree<State> & Mutations = {
  [MutationTypes.ADD](state, payload) {
    state.list.push({ ...payload });
    payload.colors.forEach((color: Color) => {
      state.colors[color.id] = color;
    });
  },
  [MutationTypes.SET](state, payload) {
    state.list = payload;
    payload.forEach(palette => {
      palette.colors.forEach((color: Color) => {
        state.colors[color.id] = color;
      });
    });
  },
  [MutationTypes.REMOVE](state, payload) {
    state.list = state.list.filter(({ filename }) => filename !== payload);
  },
  [MutationTypes.UPDATE_NAME](state, payload) {
    console.log('payload', payload)
    state.list[payload.index].filename = payload.name;
  },
  [MutationTypes.CLEAR](state) {
    state.list = [];
    state.colors = [];
  },
  [MutationTypes.ADD_COLOR](state, payload) {
    const index = state.list.findIndex(_ => _.filename === payload.palette);
    state.list[index].colors.push(payload.color);
    state.colors[payload.color.id] = payload.color;
  },
  [MutationTypes.SET_COLORS](state, payload) {
    const index = state.list.findIndex(_ => _.filename === payload.palette);
    state.list[index].colors = [...payload.colors];
    payload.colors.forEach((color: Color) => {
      state.colors[color.id] = color;
    });
  },
  [MutationTypes.UPDATE_COLOR](state, payload) {
    const index = state.list.findIndex(_ => _.filename === payload.palette);
    state.list[index].colors[payload.index] = payload.color;
    state.colors[payload.color.id] = payload.color;
  },
  [MutationTypes.REMOVE_COLOR](state, payload) {
    const index = state.list.findIndex(_ => _.filename === payload.palette);
    state.list[index].colors = state.list[index].colors.splice(payload.index, 1);
  },
  [MutationTypes.CLEAR_COLORS](state, payload) {
    const index = state.list.findIndex(_ => _.filename === payload.palette);
    state.list[index].colors = [];
  },
};
