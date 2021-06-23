import type { MutationTree } from 'vuex';
import type { State, Palette, Color } from './index';

export enum MutationTypes {
  ADD = 'ADD',
  SET = 'SET',
  REMOVE = 'REMOVE',
  CLEAR = 'CLEAR',
  ADD_COLOR = 'ADD_COLOR',
  EXTEND_COLORS = 'EXTEND_COLORS',
  REMOVE_COLOR = 'REMOVE_COLOR',
  SET_COLORS = 'SET_COLORS',
  CLEAR_COLORS = 'CLEAR_COLORS',
  UPDATE_COLOR = 'UPDATE_COLOR',
  UPDATE_NAME = 'UPDATE_NAME'
}

export namespace PaletteMutations {

    export interface ColorMutation {
    paletteId: number;
  }

  export interface AddColor extends ColorMutation {
    color: Color;
    index?: number;
  }

  export interface RemoveColor extends ColorMutation {
    id: number
  }

  export interface SetColors extends ColorMutation {
    colors: Array<Color>
  }

  export interface UpdateColor extends ColorMutation {
    color: Color
  }

  export interface UpdateName {
    id: number
    name: string
  }
}


export type Mutations<S = State> = {
  [MutationTypes.ADD](state: S, payload: Palette): void;
  [MutationTypes.SET](state: S, payload: Array<number>): void;
  [MutationTypes.UPDATE_NAME](state: S, payload: PaletteMutations.UpdateName): void;
  [MutationTypes.REMOVE](state: S, payload: number): void;
  [MutationTypes.CLEAR](state: S): void;
  [MutationTypes.EXTEND_COLORS](state: S, payload: Array<Color>): void;
  [MutationTypes.ADD_COLOR](state: S, payload: PaletteMutations.AddColor): void;
  [MutationTypes.UPDATE_COLOR](state: S, payload: PaletteMutations.UpdateColor): void;
  [MutationTypes.SET_COLORS](state: S, payload: PaletteMutations.SetColors): void;
  [MutationTypes.REMOVE_COLOR](state: S, payload: PaletteMutations.RemoveColor): void;
  [MutationTypes.CLEAR_COLORS](state: S, payload: PaletteMutations.ColorMutation): void;
};

export const mutations: MutationTree<State> & Mutations = {
  [MutationTypes.ADD](state, payload) {
    state.order.push(payload.id);
    state.palettes[payload.id] = { ...payload }
  },
  [MutationTypes.SET](state, payload) {
    state.order = payload;
  },
  [MutationTypes.REMOVE](state, payload) {
    const index = state.order.findIndex(id => id === payload);
    state.order.splice(index, 1);
  },
  [MutationTypes.UPDATE_NAME](state, payload) {
    state.palettes[payload.id].filename = payload.name;
  },
  [MutationTypes.CLEAR](state) {
    state.order = [];
    state.palettes = {};
    state.colors = {};
  },
  [MutationTypes.ADD_COLOR](state, payload) {
    state.colors[payload.color.id] = payload.color;
    const index = typeof payload.index !== 'undefined' ? payload.index : state.palettes[payload.paletteId].colors.length;
    state.palettes[payload.paletteId].colors.splice(index, 0, payload.color.id);
  },
  [MutationTypes.EXTEND_COLORS](state, payload) {
    payload.forEach(color => {
      state.colors[color.id] = color;
    })
  },
  [MutationTypes.SET_COLORS](state, payload) {
    const newColors = payload.colors.filter(color => !(color.id in state.colors));
    newColors.forEach(color => {
      state.colors[color.id] = color;
    });
    state.palettes[payload.paletteId].colors = payload.colors.map(c => c.id);
  },
  [MutationTypes.UPDATE_COLOR](state, payload) {
    state.colors[payload.color.id] = payload.color;
  },
  [MutationTypes.REMOVE_COLOR](state, payload) {
    const colors = state.palettes[payload.paletteId].colors
    const index = colors.findIndex((id => id === payload.id));
    state.palettes[payload.paletteId].colors.splice(index, 1);
  },
  [MutationTypes.CLEAR_COLORS](state, payload) {
    state.palettes[payload.paletteId].colors = [];
  },
};
