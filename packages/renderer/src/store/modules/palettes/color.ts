export class Color {
  value: string;

  constructor(value: string) {
    this.value = value;
  }
}


export function parsePalette(contents: string) {
  const colors = contents.trimEnd().split(/,/)
  return colors.filter(c => c).map(c => new Color(c))
}

