import { createServer, Response } from 'miragejs';

import VANdata from './data/DATA.json';
import flowsData from './data/FLOWS.json';
import links from './data/LINKS.json';
import services from './data/SERVICES.json';
import site from './data/SITE.json';
import targets from './data/TARGETS.json';

const DELAY_RESPONSE = 1000;

export function loadMockServerInDev() {
  if (process.env.NODE_ENV === 'development' || !!process.env.ENABLE_MOCK_SERVER) {
    createServer({
      routes() {
        this.timing = DELAY_RESPONSE;
        this.get('/error', () => {
          return new Response(500, { some: 'header' }, { errors: ['Server Error'] });
        });
        this.get('/data', () => {
          return VANdata;
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
        this.get('/flows', (_, { queryParams }) => {
          let data = flowsData;

          if (queryParams.vanaddr) {
            return normalizeFlows(list_to_tree(mapFlowsWithListenersConnectors(flowsData))).filter(
              (flow) => flow.van_address === queryParams.vanaddr,
            );
          }

          return normalizeFlows(list_to_tree(mapFlowsWithListenersConnectors(flowsData)));
        });
      },
    });
  }
}

const list_to_tree = (dataset) => {
  const hashTable = Object.create(null);
  const dataTree = [];

  dataset.forEach((data) => {
    hashTable[data.id] = { ...data, childNodes: [] };
  });

  dataset.forEach((data) => {
    data.parent
      ? hashTable[data.parent].childNodes.push(hashTable[data.id])
      : dataTree.push(hashTable[data.id]);
  });

  return dataTree;
};

function normalizeFlows(data) {
  return data
    .flatMap(({ childNodes, hostname, name }) => {
      if (childNodes.length) {
        return childNodes.flatMap((node) => {
          const { childNodes: flows, ...rest } = node;

          return {
            ...rest,
            hostname,
            siteName: name,
            flows,
          };
        });
      }

      return undefined;
    })
    .filter(Boolean);
}

function mapFlowsWithListenersConnectors(flows) {
  return flows.map((data) => {
    const listenersBound = flows.reduce((acc, item) => {
      return {
        ...acc,
        [item.id]: item,
      };
    }, {});

    const connectorsBound = flows.reduce((acc, item) => {
      if (item.counterflow) {
        acc[item.counterflow] = item;
      }

      return acc;
    }, {});

    if (data.counterflow) {
      return { ...data, connected_to: listenersBound[data.counterflow] };
    }
    if (data.rtype === 'FLOW' && !data.counterflow) {
      return { ...data, connected_to: connectorsBound[data.id] };
    }

    return data;
  });
}
