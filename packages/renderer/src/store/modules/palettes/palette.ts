import { Color } from './color';

let id = 0;

export function parsePalette(contents: string) {
  const colors = contents.trimEnd().split(/,/);
  return colors.filter(c => c).map(c => new Color(c));
}

export type ColorId = number;

export class Palette {
  id: number;
  filename: string;
  dirname: string;
  colors: Array<ColorId>;

  constructor(filename: string, dirname: string, colors: number[]) {
    id++;
    this.id = id;
    this.filename = filename;
    this.dirname = dirname;
    this.colors = colors;
  }
}
