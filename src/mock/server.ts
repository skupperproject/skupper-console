import { createServer } from 'miragejs';

import * as data from './data/DATA.json';
import * as site from './data/SITE.json';

const DELAY_RESPONSE = 1000;

export function loadMockServerInDev() {
  if (process.env.NODE_ENV === 'development') {
    createServer({
      routes() {
        this.timing = DELAY_RESPONSE;
        this.get('/data', () => {
          return data;
        });
        this.get('/siteInfo', () => {
          return site;
        });
      },
    });
  }
}
