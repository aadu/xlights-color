import chroma from 'chroma-js';

let id = 0;

export type ColorHex = string;
export type Position = number;
export type Stop = [ColorHex, Position];
export type Stops = Array<Stop>;

export class Color {
  id: number;
  value: string;
  stops: Array<[string, number]>;

  constructor(value: string, stops: Stops = []) {
    id++;
    this.id = id;
    this.value = value;
    if(stops.length) {
      this.stops = stops;
    } else {
      this.stops = this.parseGradient(value);
    }
    if (this.stops.length === 0) {
      this.stops.push([this.value, 0.5])
    } else {
      this.value = this.stops[0][0];
    }
  }

  parseGradient(value: string): Array<[string, number]>{
    const result = value.match(/(?<=Values=)([^|]+)/);
    if (!result) {
      return []
    }
    const stops: Stops = [];
    result[0].split(';').forEach((stop) => {
      const re = stop.match(/(?<=x=)(?<location>[^^]+)\^c=(?<color>.*)/);
      if (re && re.groups) {
        stops.push([re.groups.color, parseFloat(re.groups.location)]);
      }
    });
    return stops.sort((a, b) => a[1] - b[1]);
  }

  isGradient() {
    return this.stops && this.stops.length > 1
  }

  isValid() {
    return chroma.valid(this.value)
  }

  toString(){
    if (this.isGradient()) {
      const stops = this.stops.map(stop => `${stop[0].toString()} ${stop[1] * 100}%`).join(',');
      return `linear-gradient(90deg, ${stops})`;
    }
    return this.value;
  }

  toXPalette() {
    if (this.isGradient()) {
      const stops = this.stops.map(stop => `x=${stop[1].toFixed(3)}^c=${chroma(stop[0].toString()).hex('rgb')}`).join(';');
      return `Active=TRUE|Values=${stops}|`;
    }
    return chroma(this.value).hex('rgb');
  }
}


export function parsePalette(contents: string) {
  const colors = contents.trimEnd().split(/,/);
  return colors.filter(c => c).map(c => new Color(c));
}

