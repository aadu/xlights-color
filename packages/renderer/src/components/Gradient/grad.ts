import tinycolor from 'tinycolor2';

const COLOR = 0;
const POSITION = 1;

const defaultStops: Array<[string, number]> = [
  ['#0359b5', 0],
  ['#f6ce01', 1],
];

export default class LinearGradient {
  stops: Array<[string, number]>;
  angle: number

  constructor(stops = defaultStops, angle = 0) {
    this.stops = stops;
    this.angle = angle;
  }
  toString(colorFormat = 'hex8') {
    const stops = this.stops
      .slice().sort((a, b) => a[POSITION] - b[POSITION])
      .map(stop => `${tinycolor(stop[COLOR]).toString(colorFormat)} ${(stop[POSITION] * 100).toFixed()}%`)
      .join(', ');
    return `linear-gradient(${this.angle}deg, ${stops})`;
  }
  toRaw(colorFormat = 'hex8') {
    const stops = this.stops
      .slice().sort((a, b) => a[POSITION] - b[POSITION])
      .map(stop => {
        stop[COLOR] = tinycolor(stop[COLOR]).toString(colorFormat);
        return stop;
      });
    return {
      angle: this.angle,
      stops,
    };
  }

}
