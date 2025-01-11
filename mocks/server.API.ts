import { Response } from 'miragejs';

import { extractQueryParams, filterResults, getMockData, loadData, paginateResults, sortData } from './server.utils';
import { DEFAULT_COMPLEX_STRING_SEPARATOR } from '../src/config/app';
import { PrometheusMetricsV2 } from '../src/config/prometheus';
import {
  ServiceResponse,
  ProcessPairsResponse,
  RouterLinkResponse,
  ComponentResponse,
  ProcessResponse,
  SiteResponse,
  PairsResponse,
  ApplicationFlowResponse,
  ConnectorResponse,
  ListenerResponse
} from '../src/types/REST.interfaces';

interface ApiProps {
  params: Record<string, string>;
  queryParams: Record<string, string[] | string | null | number | undefined>;
  url?: string;
}

export interface extendedProcessResponse extends ProcessResponse {
  addresses: string[]; // TODO: we are changing naming convention from addresses to services. This type is a temporal bridge
}

const ITEM_COUNT = Number(process.env.MOCK_ITEM_COUNT) || 0;

// Mock data setup
const sites = loadData<SiteResponse>('SITES');
const components = loadData<ComponentResponse>('COMPONENTS');
const componentPairs = loadData<PairsResponse>('COMPONENT_PAIRS');
const processes = loadData<extendedProcessResponse>('PROCESSES');
const sitePairs = loadData<PairsResponse>('SITE_PAIRS');
const processPairs = loadData<ProcessPairsResponse>('PROCESS_PAIRS');
const services = loadData<ServiceResponse>('SERVICES');
const tcpConnections = loadData<ConnectorResponse>('TCP_CONNECTIONS');
const httpRequests = loadData<ApplicationFlowResponse>('HTTP_REQUESTS');
const links = loadData<RouterLinkResponse>('LINKS');
const listeners = loadData<ListenerResponse>('LISTENERS');
const connectors = loadData<ConnectorResponse>('CONNECTORS');

// api functions
export const MockApi = {
  get500Error: () => new Response(500),
  get503Error: () => new Response(503),
  get404Error: () => new Response(404),

  getUser: () => ({
    username: 'IAM#Mock-User@user.mock',
    authType: 'openshift'
  }),

  logout: () => ({}),

  getSites: (_: unknown, { url }: ApiProps) => {
    const sitesForPerfTests = ITEM_COUNT ? mockSitesForPerf : [];
    const results = getMockData(sites.results, ITEM_COUNT > 0, sitesForPerfTests);

    const { limit, offset, sortBy, ...filters } = extractQueryParams(url) || {};

    const filteredResults = filterResults(results, filters);
    const sortedData = sortData(filteredResults, sortBy);
    const paginatedResults = paginateResults(sortedData, { offset, limit });

    return {
      results: paginatedResults,
      count: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getSite: (_: unknown, { params: { id } }: ApiProps) => ({
    results: sites.results.find(({ identity }) => identity === id) || []
  }),

  getLinks: (_: unknown, { queryParams }: ApiProps) => {
    const linksForPerfTests = ITEM_COUNT ? mockLinksForPerf : [];
    const results = getMockData(links.results, ITEM_COUNT > 0, linksForPerfTests);

    const filteredResults = filterResults(results, queryParams);

    return {
      results: filteredResults,
      count: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getComponents: (_: unknown, { url }: ApiProps) => {
    const results = getMockData(components.results, ITEM_COUNT > 0);
    const { limit, offset, sortBy, ...filters } = extractQueryParams(url) || {};

    const filteredResults = filterResults(results, filters);
    const sortedData = sortData(filteredResults, sortBy);
    const paginatedResults = paginateResults(sortedData, { offset, limit });

    return {
      results: paginatedResults,
      count: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getComponent: (_: unknown, { params: { id } }: ApiProps) => ({
    results: components.results.find(({ identity }) => identity === id)
  }),

  getProcesses: (_: unknown, { url }: ApiProps) => {
    const processesForPerfTests = ITEM_COUNT ? mockProcessesForPerf : [];
    const results = getMockData(processes.results, ITEM_COUNT > 0, processesForPerfTests);
    const { limit, offset, sortBy, ...filters } = extractQueryParams(url) || {};

    const filteredResults = filterResults(results, filters);
    const sortedData = sortData(filteredResults, sortBy);
    const paginatedResults = paginateResults(sortedData, { offset, limit });

    return {
      results: paginatedResults,
      count: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getProcess: (_: unknown, { params: { id } }: ApiProps) => ({
    results: processes.results.find(({ identity }) => identity === id)
  }),

  getListeners: (_: unknown, { queryParams }: ApiProps) => {
    const results = getMockData(listeners.results, ITEM_COUNT > 0);
    const filteredResults = filterResults(results, queryParams);
    const paginatedResults = paginateResults(filteredResults, queryParams);

    return {
      results: paginatedResults,
      count: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getConnectors: (_: unknown, { queryParams }: ApiProps) => {
    const results = getMockData(connectors.results, ITEM_COUNT > 0);
    const filteredResults = filterResults(results, queryParams);
    const paginatedResults = paginateResults(filteredResults, queryParams);

    return {
      results: paginatedResults,
      count: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getServices: (_: unknown, { url }: ApiProps) => {
    const results = getMockData(services.results, ITEM_COUNT > 0);
    const { limit, offset, sortBy, ...filters } = extractQueryParams(url) || {};

    const filteredResults = filterResults(results, filters);
    const sortedData = sortData(filteredResults, sortBy);
    const paginatedResults = paginateResults(sortedData, { offset, limit });

    return {
      results: paginatedResults,
      count: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getService: (_: unknown, { params: { id } }: ApiProps) => ({
    results: services.results.find(({ identity }) => identity === id)
  }),

  getServiceProcessPairs: (_: unknown, { params: { id } }: ApiProps) => {
    const processesByServiceIds = processes.results
      .filter(
        ({ addresses }) =>
          addresses && addresses.some((service) => service.split(DEFAULT_COMPLEX_STRING_SEPARATOR)[1] === id)
      )
      .map(({ identity }) => identity);

    const processPairsFiltered = processPairs.results.filter((item) =>
      processesByServiceIds.includes(item.destinationId)
    );

    return {
      results: processPairsFiltered,
      count: processPairsFiltered.length,
      timeRangeCount: processPairsFiltered.length
    };
  },

  getSitePairs: (_: unknown, { queryParams }: ApiProps) => {
    const results = getMockData(sitePairs.results, ITEM_COUNT > 0);
    const filteredResults = filterResults(results, queryParams);

    return {
      results: filteredResults,
      count: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getComponentPairs: (_: unknown, { queryParams }: ApiProps) => {
    const results = getMockData(componentPairs.results, ITEM_COUNT > 0);
    const filteredResults = filterResults(results, queryParams);

    return {
      results: filteredResults,
      count: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getProcessPairs: (_: unknown, { queryParams }: ApiProps) => {
    const results = getMockData(processPairs.results, ITEM_COUNT > 0);
    const filteredResults = filterResults(results, queryParams);

    return {
      results: filteredResults,
      count: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getProcessPair: (_: unknown, { params: { id } }: ApiProps) => {
    const processPair = processPairs.results.find(({ identity }) => identity === id);

    return {
      results: processPair ? processPair : {}
    };
  },

  getTcpConnections: (_: unknown, { url }: ApiProps) => {
    const results = tcpConnections.results;
    const { limit, offset, sortBy, state, ...filters } = extractQueryParams(url) || {};

    let filteredResults = filterResults(results, { ...filters });

    if (state) {
      filteredResults = filteredResults.filter((res) =>
        state?.length && state[0] === 'terminated' ? res.endTime > 0 : res.endTime === 0
      );
    }

    const sortedData = sortData(filteredResults, sortBy);
    const paginatedResults = paginateResults(sortedData, { offset, limit });

    return {
      results: paginatedResults,
      count: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getHttpRequests: (_: unknown, { url }: ApiProps) => {
    const results = httpRequests.results;
    const { limit, offset, sortBy, ...filters } = extractQueryParams(url) || {};
    const filteredResults = filterResults(results, { ...filters });

    const sortedData = sortData(filteredResults, sortBy);
    const paginatedResults = paginateResults(sortedData, { offset, limit });

    return {
      results: paginatedResults,
      count: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getTcpConnection: (_: unknown, { params: { id } }: ApiProps) => ({
    results: tcpConnections.results.find(({ identity }) => identity === id)
  }),

  getHttpRequest: (_: unknown, { params: { id } }: ApiProps) => ({
    results: httpRequests.results.find(({ identity }) => identity === id)
  }),

  getPrometheusQuery: (_: unknown, { queryParams }: ApiProps) => {
    if (
      (queryParams.query as string)?.includes(
        `sum by(source_process_name,dest_process_name)(rate(${PrometheusMetricsV2.SentBytes}`
      )
    ) {
      return {
        data: {
          resultType: 'vector',
          result: [
            {
              metric: {
                dest_process_name: 'paymentservice-69f99b8c87-kztsn',
                source_process_name: 'checkoutservice-684ff774fd-4bttd'
              },
              value: [1700918014, '1024']
            },
            {
              metric: {
                dest_process_name: 'paymentservice-131f99g8c15-replica-1',
                source_process_name: 'checkoutservice-684ff774fd-4bttd'
              },
              value: [1700918024.674, '10000']
            },
            {
              metric: {
                dest_process_name: 'process cash desk 1',
                source_process_name: 'checkoutservice-684ff774fd-4bttd'
              },
              value: [1700918904.674, '20000']
            }
          ]
        }
      };
    }

    return {
      data: {
        result: [
          {
            metric: {},
            value: [1, 1]
          }
        ]
      }
    };
  },

  getPrometheusRangeQuery: () => ({
    data: {
      result: [
        {
          metric: {},
          values: [
            [1192026035, 0],
            [1592026935, 1]
          ]
        }
      ]
    }
  })
};

const mockSitesForPerf: SiteResponse[] = [];
for (let i = 0; i < ITEM_COUNT; i++) {
  mockSitesForPerf.push({
    identity: `sitePerf${i}`,
    platform: 'kubernetes',
    startTime: 1674048705000000,
    endTime: 0,
    name: `site ${i}`,
    nameSpace: `config-grpc-site-${i}-test`,
    siteVersion: 'x.x.x',
    routerCount: 1
  });
}

const mockProcessesForPerf: extendedProcessResponse[] = [];
for (let i = 0; i < ITEM_COUNT; i++) {
  const process = processes.results[i % processes.results.length];

  mockProcessesForPerf.push({
    ...processes.results[0],
    identity: `${process.identity}-${i}`,
    name: `${process.name} ${i}`,
    groupIdentity: process.groupIdentity,
    groupName: process.groupName,
    parent: process.parent,
    parentName: process.parentName,
    addresses: process.addresses
  });
}

const mockSitePairsForPerf: PairsResponse[] = [];
for (let i = 0; i < ITEM_COUNT; i++) {
  const sourceIndex = Math.floor(Math.random() * mockProcessesForPerf.length);
  const destinationIndex = Math.floor(Math.random() * mockProcessesForPerf.length);

  mockSitePairsForPerf.push({
    ...sitePairs.results[0],
    identity: `${mockSitesForPerf[sourceIndex].identity}-to-${mockSitesForPerf[destinationIndex].identity}`,
    sourceId: mockSitesForPerf[sourceIndex].identity,
    sourceName: mockSitesForPerf[sourceIndex].name,
    destinationId: mockSitesForPerf[destinationIndex].identity,
    destinationName: mockSitesForPerf[destinationIndex].name
  });
}

const mockLinksForPerf: RouterLinkResponse[] = [];
mockSitePairsForPerf.forEach((_, index) => {
  const idx1 = Math.floor(Math.random() * ITEM_COUNT);
  const idx2 = Math.floor(Math.random() * ITEM_COUNT);

  const site1 = mockSitePairsForPerf[idx1];
  const site2 = mockSitePairsForPerf[idx2];

  mockLinksForPerf.push(
    {
      identity: `link-out-${index}`,
      startTime: 1674048706622878,
      endTime: 0,
      role: 'inter-router',
      name: 'out link',
      cost: 1,
      octets: 10,
      octetsReverse: 100,
      routerAccessId: '',
      routerId: '',
      sourceSiteId: site1.identity,
      destinationSiteId: site2.identity,
      sourceSiteName: site1.sourceName,
      destinationSiteName: site2.destinationName,
      destinationRouterId: '',
      destinationRouterName: '',
      status: 'up',
      routerName: 'skupper'
    },
    {
      identity: `link-in-${index}`,
      startTime: 1674151543561656,
      endTime: 0,
      role: 'edge-router',
      name: 'in link',
      octets: 205,
      octetsReverse: 1100,
      cost: 1,
      routerAccessId: '',
      routerId: '',
      sourceSiteId: site2.identity,
      destinationSiteId: site1.identity,
      sourceSiteName: site2.sourceName,
      destinationSiteName: site1.destinationName,
      destinationRouterId: '',
      destinationRouterName: '',
      status: 'up',
      routerName: 'skupper'
    }
  );
});

const mockProcessPairsForPerf: ProcessPairsResponse[] = [];
for (let i = 0; i < ITEM_COUNT; i++) {
  const sourceIndex = Math.floor(Math.random() * mockProcessesForPerf.length);
  const destinationIndex = Math.floor(Math.random() * mockProcessesForPerf.length);

  mockProcessPairsForPerf.push({
    ...processPairs.results[0],
    identity: `${mockProcessesForPerf[sourceIndex].identity}-to-${mockProcessesForPerf[destinationIndex].identity}`,
    sourceId: mockProcessesForPerf[sourceIndex].identity,
    sourceName: mockProcessesForPerf[sourceIndex].name,
    destinationId: mockProcessesForPerf[destinationIndex].identity,
    destinationName: mockProcessesForPerf[destinationIndex].name
  });
}
