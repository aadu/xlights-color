import type { GetterTree } from 'vuex';
import type { State, Palette, Color } from './index';
import type { RootState } from '/@/store';


interface PaletteDetail extends Omit<Palette, 'colors'> {
  colors: Array<Color>;
}

export type Getters<S = State> = {
  palettes(state: S): Array<Palette>;
  palette(state: S): (id: number) => PaletteDetail;
  xPalette(state: S): (id: number) => string;
};


export const getters: GetterTree<State, RootState> & Getters = {
  palettes: (state) => {
    return state.order.map(id => state.palettes[id]);
  },
  palette: (state) => {
    return (id) => {
      return {...state.palettes[id], colors: state.palettes[id].colors.map(colorId => state.colors[colorId])};
    };
  },
  xPalette: (state) => {
    return (id) => {
      const colors = state.colors;
      const palette = state.palettes[id];
      return `${palette.colors.map((colorId: number) => colors[colorId].toXPalette()).join(',')},`;
    };
  },
};
