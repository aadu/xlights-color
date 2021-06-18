let id = 0;

export class Color {
  value: string;
  id: number;

  constructor(value: string) {
    id++;
    this.value = value;
    this.id = id;
  }
}


export function parsePalette(contents: string) {
  const colors = contents.trimEnd().split(/,/);
  return colors.filter(c => c).map(c => new Color(c));
}

