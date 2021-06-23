import mitt, { Emitter } from 'mitt';

type Events = {
  contextmenu?: string;
};

export const emitter = mitt<Events>();
