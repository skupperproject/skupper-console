import { createServer } from 'miragejs';

import data from './data/DATA.json';
import flows from './data/FLOWS.json';
import links from './data/LINKS.json';
import services from './data/SERVICES.json';
import site from './data/SITE.json';
import targets from './data/TARGETS.json';

const DELAY_RESPONSE = 1000;

export function loadMockServerInDev() {
  if (process.env.NODE_ENV === 'development') {
    createServer({
      routes() {
        this.timing = DELAY_RESPONSE;
        this.get('/data', () => {
          return data;
        });
        this.get('/site', () => {
          return site;
        });
        this.get('/services', () => {
          return services;
        });
        this.get('/links', () => {
          return links;
        });
        this.get('/targets', () => {
          return targets;
        });
        this.get('/flows', () => {
          return flows;
        });
      },
    });
  }
}
