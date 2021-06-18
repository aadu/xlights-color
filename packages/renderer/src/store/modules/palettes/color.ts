import chroma from 'chroma-js';

let id = 0;

export class Color {
  value: string;
  id: number;
  isGradient: boolean;
  isValid: boolean;
  stops: Array<[string, number]>;

  constructor(value: string) {
    id++;
    this.id = id;
    this.isValid = false;
    if (chroma.valid(value)) {
      this.value = value;
      this.isGradient = false;
      this.isValid = true;
    } else {
      const result = value.match(/(?<=Values=)([^|]+)/);
      if (result) {
        this.stops = result[0].split(';')
          .map(stop => {
            const re = stop.match(/(?<=x=)(?<location>[^^]+)\^c=(?<color>.*)/);
            if (re && re.groups) {
              return [re.groups.color, parseFloat(re.groups.location)]
            }
            return null
          })
          .filter(_ => _);
        if (this.stops.length == 1) {
          this.value = this.stops[0][0];
          this.isGradient = false;
          this.isValid = true;
        } else if (this.stops.length) {
          this.value = this.stops[0][0];
          this.isGradient = true;
          this.isValid = true;
        }
      }
    }
  }
}

export function parsePalette(contents: string) {
  const colors = contents.trimEnd().split(/,/);
  return colors.filter(c => c).map(c => new Color(c));
}

