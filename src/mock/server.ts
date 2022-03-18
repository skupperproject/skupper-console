import { createServer, Response } from 'miragejs';

import VANdata from './data/DATA.json';
import flowsData from './data/FLOWS.json';
import flowsVANAddresses from './data/FLOWS_VAN_ADDRESSES.json';
import links from './data/LINKS.json';
import services from './data/SERVICES.json';
import site from './data/SITE.json';
import targets from './data/TARGETS.json';

const DELAY_RESPONSE = 2000;

export function loadMockServerInDev() {
  if (process.env.NODE_ENV === 'development') {
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
        this.get('/flows', () => {
          return normalizeFlows(list_to_tree(mapFlowsWithListenersConnectors(flowsData)));
        });
        this.get('/flows/addresses', () => {
          return flowsVANAddresses;
        });
      },
    });
  }
}

const list_to_tree = (dataset: any) => {
  const hashTable = Object.create(null);
  const dataTree: any = [];

  dataset.forEach((data: any) => (hashTable[data.id] = { ...data, childNodes: [] }));
  dataset.forEach((data: any) => {
    data.parent
      ? hashTable[data.parent].childNodes.push(hashTable[data.id])
      : dataTree.push(hashTable[data.id]);
  });

  return dataTree;
};

function normalizeFlows(data: any) {
  return data
    .flatMap(({ childNodes, hostname, name }: any) => {
      if (childNodes.length) {
        return childNodes.flatMap((node: any) => {
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

function mapFlowsWithListenersConnectors(flows: any) {
  return flows.map((data: any) => {
    const listenersBound = flows.reduce((acc: any, item: any) => {
      acc[item.id] = item;

      return acc;
    }, {});

    const connectorsBound = flows.reduce((acc: any, item: any) => {
      if (item.counterflow) {
        acc[item.counterflow] = item;
      }

      return acc;
    }, {});

    if (data.counterflow) {
      return { ...data, connected_to: listenersBound[data.counterflow] };
    } else if (data.rtype === 'FLOW' && !data.counterflow) {
      return { ...data, connected_to: connectorsBound[data.id] };
    }

    return data;
  });
}

// const groupByVanAddress = (data: any) => {
//   const groupedData = data.reduce((acc: any, item: any) => {
//     (acc[item.van_address] = acc[item.van_address] || []).push(item);

//     return acc;
//   }, {});

//   return Object.values(groupedData);
// };
