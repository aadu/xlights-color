import type { GetterTree } from 'vuex';
import type { State, Palette, Color } from './index';
import type { RootState } from '/@/store';


interface PaletteDetail extends Omit<Palette, "colors"> {
  colors: Array<Color>;
}

export type Getters<S = State> = {
  palettes(state: S): Array<Palette>;
  palette(state: S): (id: number) => PaletteDetail;
};


export const getters: GetterTree<State, RootState> & Getters = {
  palettes: (state) => {
    return state.order.map(id => state.palettes[id]);
  },
  palette: (state) => {
    return (id) => {
      return {...state.palettes[id], colors: state.palettes[id].colors.map(colorId => state.colors[colorId])}
    }
  }
};
