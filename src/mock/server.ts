import { createServer } from 'miragejs';

import * as data from './data/DATA.json';

const DELAY_RESPONSE = 1000;

export function loadMockServerInDev() {
  if (process.env.NODE_ENV === 'development') {
    createServer({
      routes() {
        this.timing = DELAY_RESPONSE;
        this.get('/DATA', () => {
          return data;
        });
      },
    });
  }
}
