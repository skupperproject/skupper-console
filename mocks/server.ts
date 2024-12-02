import { createServer, Response } from 'miragejs';

import { PrometheusMetricsV2 } from '../src/config/prometheus';
import {
  ServiceResponse,
  ProcessPairsResponse,
  RouterLinkResponse,
  ComponentResponse,
  ProcessResponse,
  RouterResponse,
  SiteResponse,
  BiFlowResponse,
  ResponseWrapper,
  PairsResponse,
  ApplicationFlowResponse,
  ConnectorResponse,
  ListenerResponse
} from '../src/types/REST.interfaces';

const DELAY_RESPONSE = Number(process.env.MOCK_DELAY_RESPONSE) || 0; // in ms
const ITEM_COUNT = Number(process.env.MOCK_ITEM_COUNT) || 0;

// api prefix
const prefix = '/api/v1alpha1';

// api data
const path = './data';
const sites: ResponseWrapper<SiteResponse[]> = require(`${path}/SITES.json`);
const components: ResponseWrapper<ComponentResponse[]> = require(`${path}/PROCESS_GROUPS.json`);
const componentPairs: ResponseWrapper<PairsResponse[]> = require(`${path}/PROCESS_GROUP_PAIRS.json`);
const processes: ResponseWrapper<ProcessResponse[]> = require(`${path}/PROCESSES.json`);
const sitePairs: ResponseWrapper<PairsResponse[]> = require(`${path}/SITE_PAIRS.json`);
const processPairs: ResponseWrapper<ProcessPairsResponse[]> = require(`${path}/PROCESS_PAIRS.json`);
const services: ResponseWrapper<ServiceResponse[]> = require(`${path}/SERVICES.json`);
const biFlow: ResponseWrapper<BiFlowResponse[]> = require(`${path}/FLOW_PAIRS.json`);
const links: ResponseWrapper<RouterLinkResponse[]> = require(`${path}/LINKS.json`);
const listeners: ResponseWrapper<ListenerResponse[]> = require(`${path}/LISTENERS.json`);
const connectors: ResponseWrapper<ConnectorResponse[]> = require(`${path}/CONNECTORS.json`);

interface ApiProps {
  params: Record<string, string>;
  queryParams: Record<string, string[] | string | null | number | undefined>;
  url?: string;
}

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

const mockRoutersForPerf: RouterResponse[] = [];
mockSitesForPerf.forEach((site, index) => {
  mockRoutersForPerf.push({
    identity: `router${index}:0`,
    parent: site.identity,
    startTime: 1674048674810887,
    endTime: 0,
    name: `0/${site.name}-skupper-router-${`router${index}`}`,
    namespace: `router-namespace-${`router${index}`}`,
    imageName: 'skupper-router',
    imageVersion: 'latest',
    hostName: `skupper-router-${`router${index}`}`,
    buildVersion: 'UNKNOWN',
    mode: 'interior'
  });
});

const mockProcessesForPerf: ProcessResponse[] = [];
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

  getSites: () => {
    const sitesForPerfTests = ITEM_COUNT ? mockSitesForPerf : [];
    const results = [...sites.results, ...sitesForPerfTests];

    return { ...sites, results };
  },

  getSite: (_: unknown, { params: { id } }: ApiProps) => ({
    results: sites.results.find(({ identity }) => identity === id) || []
  }),

  getLinks: (_: unknown, { queryParams }: ApiProps) => {
    const linksForPerfTests = ITEM_COUNT ? mockLinksForPerf : [];
    const results = [...links.results, ...linksForPerfTests];

    if (queryParams && !Object.keys(queryParams).length) {
      return {
        results,
        count: results.length,
        timeRangeCount: results.length
      };
    }

    const filteredResults = results.filter(
      (result) =>
        (queryParams.sourceSiteId && result.sourceSiteId === queryParams.sourceSiteId) ||
        (queryParams.destinationSiteId && result.destinationSiteId === queryParams.destinationSiteId)
    );

    return {
      results: filteredResults,
      count: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getComponents: (_: unknown, { queryParams }: ApiProps) => {
    const results = [...components.results];
    if (queryParams && !Object.keys(queryParams).length) {
      return {
        ...components,
        results,
        count: results.length,
        timeRangeCount: results.length
      };
    }

    const filteredResults = results.filter(
      (result) => queryParams.processGroupRole && result.processGroupRole === queryParams.processGroupRole
    );

    const paginatedResults = filteredResults.slice(
      Number(queryParams.offset || 0),
      Number(queryParams.offset || 0) + Number(queryParams.limit || filteredResults.length)
    );

    return {
      ...components,
      results: paginatedResults,
      count: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getComponent: (_: unknown, { params: { id } }: ApiProps) => {
    const results = components.results.find(({ identity }: ComponentResponse) => identity === id);

    return { results };
  },

  getProcesses: (_: unknown, { queryParams, url }: ApiProps) => {
    const processesForPerfTests = ITEM_COUNT ? mockProcessesForPerf : [];
    const results = [...processes.results, ...processesForPerfTests];
    const filters = getQueryParams(url);

    if (!filters?.processRole?.length) {
      return {
        ...processes,
        results,
        count: results.length,
        timeRangeCount: results.length
      };
    }

    const filteredResults = results.filter(
      (result) =>
        filters.processRole.includes(result.processRole) ||
        result.groupIdentity === queryParams.groupIdentity ||
        result.parent === queryParams.parent
    );

    const paginatedResults = filteredResults.slice(
      Number(queryParams.offset || 0),
      Number(queryParams.offset || 0) + Number(queryParams.limit || filteredResults.length)
    );

    return {
      ...processes,
      results: paginatedResults,
      count: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getProcess: (_: unknown, { params: { id } }: ApiProps) => {
    const results = processes.results.find(({ identity }: ProcessResponse) => identity === id);

    return { results };
  },

  getListeners: (_: unknown, { queryParams }: ApiProps) => {
    let results = listeners.results;
    if (queryParams.addressId) {
      results = results.filter(({ addressId }) => addressId === queryParams.addressId);
    }

    const paginatedResults = results.slice(
      Number(queryParams.offset || 0),
      Number(queryParams.offset || 0) + Number(queryParams.limit || results.length)
    );

    return {
      results: paginatedResults,
      count: results.length,
      timeRangeCount: results.length
    };
  },

  getConnectors: (_: unknown, { queryParams }: ApiProps) => {
    let results = connectors.results;

    if (queryParams.addressId) {
      results = results.filter(({ addressId }) => addressId.startsWith(queryParams.addressId as string));
    }

    const paginatedResults = results.slice(
      Number(queryParams.offset || 0),
      Number(queryParams.offset || 0) + Number(queryParams.limit || results.length)
    );

    return {
      results: paginatedResults,
      count: results.length,
      timeRangeCount: results.length
    };
  },

  getServices: (_: unknown, { queryParams }: ApiProps) => {
    let results = services.results;

    if (queryParams.name || queryParams.protocol) {
      results = results.filter(
        ({ name, protocol }) =>
          name.startsWith(queryParams.name as string) || protocol.startsWith(queryParams.protocol as string)
      );
    }

    const paginatedResults = results.slice(
      Number(queryParams.offset || 0),
      Number(queryParams.offset || 0) + Number(queryParams.limit || results.length)
    );

    return {
      results: paginatedResults,
      count: results.length,
      timeRangeCount: results.length
    };
  },

  getService: (_: unknown, { params: { id } }: ApiProps) => {
    const results = services.results.find(({ identity }) => identity === id);

    return { results };
  },

  getSitePairs: (_: unknown, { queryParams }: ApiProps) => {
    const sitesForPerfTests = ITEM_COUNT ? mockSitePairsForPerf : [];
    const results = [...sitePairs.results, ...sitesForPerfTests];

    if (queryParams && !Object.keys(queryParams).length) {
      return { ...sitePairs, results };
    }

    const resultsFiltered = results.filter(
      ({ sourceId, destinationId }) => sourceId === queryParams.sourceId || destinationId === queryParams.destinationId
    );

    return { ...processPairs, results: resultsFiltered };
  },

  getComponentPairs: (_: unknown, { queryParams }: ApiProps) => {
    const results = componentPairs.results;

    if (queryParams && !Object.keys(queryParams).length) {
      return { ...componentPairs, results };
    }

    const resultsFiltered = results.filter(
      ({ sourceId, destinationId }) => sourceId === queryParams.sourceId || destinationId === queryParams.destinationId
    );

    return { ...componentPairs, results: resultsFiltered };
  },

  getProcessPairs: (_: unknown, { queryParams }: ApiProps) => {
    const processesForPerfTests = ITEM_COUNT ? mockProcessPairsForPerf : [];
    const results = [...processPairs.results, ...processesForPerfTests];

    if (queryParams && !Object.keys(queryParams).length) {
      return { ...processPairs, results };
    }

    const resultsFiltered = results.filter(
      ({ sourceId, destinationId }) => sourceId === queryParams.sourceId || destinationId === queryParams.destinationId
    );

    return { ...processPairs, results: resultsFiltered };
  },

  getProcessPair: (_: unknown, { params: { id } }: ApiProps) => ({
    results: processPairs.results.find(({ identity }) => identity === id) || []
  }),

  getBiflows: (_: unknown, { queryParams }: ApiProps) => {
    const queryProcessSourceId = queryParams.sourceProcessId;
    const queryProcessDestinationId = queryParams.destProcessId;
    const queryProcessSourceName = queryParams.sourceProcessName;
    const queryProcessDestinationName = queryParams.destProcessName;
    const queryProtocol = queryParams.protocol;
    const queryStatus = queryParams.status;
    const queryMethod = queryParams.method;
    const queryRoutingKey = queryParams.routingKey;

    const results = (biFlow.results as ApplicationFlowResponse[]).filter(
      ({
        protocol,
        endTime,
        sourceProcessId,
        destProcessId,
        sourceProcessName,
        destProcessName,
        status,
        method,
        routingKey
      }) =>
        (!queryRoutingKey && queryProcessSourceId ? sourceProcessId === queryProcessSourceId : true) &&
        (!queryRoutingKey && queryProcessDestinationId ? destProcessId === queryProcessDestinationId : true) &&
        (queryProtocol ? protocol === queryProtocol : true) &&
        (queryRoutingKey && queryProcessSourceName
          ? sourceProcessName.startsWith(queryProcessSourceName as string)
          : true) &&
        (queryRoutingKey && queryProcessDestinationId
          ? destProcessName.startsWith(queryProcessDestinationName as string)
          : true) &&
        (queryMethod ? !!method?.startsWith(queryMethod as string) : true) &&
        (queryStatus ? !!status?.toString()?.startsWith(queryStatus as string) : true) &&
        (queryProtocol ? protocol.startsWith(queryProtocol as string) : true) &&
        (queryRoutingKey ? routingKey === queryRoutingKey : true) &&
        (queryParams.state === 'active' ? endTime === 0 : endTime > 0)
    );

    return { ...processPairs, results, timeRangeCount: results.length };
  },

  getBiflow: (_: unknown, { params: { id } }: ApiProps) => ({
    results: biFlow.results.find(({ identity }) => identity === id)
  }),

  getPrometheusQuery: (_: unknown, { queryParams }: ApiProps) => {
    if (
      (queryParams.query as string)?.includes(
        `sum by(destProcess, sourceProcess, direction)(rate(${PrometheusMetricsV2.SentBytes}`
      )
    ) {
      return {
        data: {
          resultType: 'vector',
          result: [
            {
              metric: {
                destProcess: 'process payment 1',
                direction: 'outgoing',
                sourceProcess: 'process cash desk 1'
              },
              value: [1700918014, '1024']
            },
            {
              metric: {
                destProcess: 'process cash desk 2',
                direction: 'outgoing',
                sourceProcess: 'process payment 3'
              },
              value: [1700918024.674, '10000']
            },
            {
              metric: {
                destProcess: 'process cash desk 1',
                direction: 'outgoing',
                sourceProcess: 'process payment 1'
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

// api paths
export const MockApiPaths = {
  User: `${prefix}/user`,
  Logout: `${prefix}/logout`,
  Sites: `${prefix}/sites`,
  Site: `${prefix}/sites/:id`,
  SitePairs: `${prefix}/sitepairs`,
  Components: `${prefix}/processgroups`,
  Component: `${prefix}/processgroups/:id`,
  ComponentPairs: `${prefix}/processgrouppairs`,
  Connectors: `${prefix}/connectors`,
  Listeners: `${prefix}/listeners`,
  Services: `${prefix}/addresses`,
  Service: `${prefix}/addresses/:id`,
  Processes: `${prefix}/processes`,
  Process: `${prefix}/processes/:id`,
  ProcessPairs: `${prefix}/processpairs`,
  ProcessPair: `${prefix}/processpairs/:id`,
  Connections: `${prefix}/connections`,
  Connection: `${prefix}/connections/:id`,
  ApplicationFlows: `${prefix}/applicationflows`,
  ApplicationFlow: `${prefix}/applicationflows/:id`,
  Routers: `${prefix}/routers`,
  Links: `${prefix}/routerlinks`,
  PrometheusQuery: `${prefix}/internal/prom/query/`,
  PrometheusRangeQuery: `${prefix}/internal/prom/rangequery/`
};

export function loadMockServer() {
  // The mock server should be disabled if the current environment is not 'development' AND the ENABLE_MOCK_SERVER environment variable is not defined or is falsy
  const shouldDisableTheMockServer = process.env.NODE_ENV !== 'development' && !process.env.ENABLE_MOCK_SERVER;

  if (process.env.COLLECTOR_URL || shouldDisableTheMockServer) {
    return undefined;
  }

  return createServer({
    routes() {
      this.timing = DELAY_RESPONSE;
      this.pretender.get('*', this.pretender.passthrough);

      this.get('', MockApi.get500Error);
      this.get(MockApiPaths.User, MockApi.getUser);
      this.get(MockApiPaths.Logout, MockApi.logout);
      this.get(MockApiPaths.Sites, MockApi.getSites);
      this.get(MockApiPaths.Site, MockApi.getSite);
      this.get(MockApiPaths.Links, MockApi.getLinks);
      this.get(MockApiPaths.Components, MockApi.getComponents);
      this.get(MockApiPaths.Component, MockApi.getComponent);
      this.get(MockApiPaths.Connectors, MockApi.getConnectors);
      this.get(MockApiPaths.Listeners, MockApi.getListeners);
      this.get(MockApiPaths.Services, MockApi.getServices);
      this.get(MockApiPaths.Service, MockApi.getService);
      this.get(MockApiPaths.Processes, MockApi.getProcesses);
      this.get(MockApiPaths.Process, MockApi.getProcess);
      this.get(MockApiPaths.SitePairs, MockApi.getSitePairs);
      this.get(MockApiPaths.ComponentPairs, MockApi.getComponentPairs);
      this.get(MockApiPaths.ProcessPairs, MockApi.getProcessPairs);
      this.get(MockApiPaths.ProcessPair, MockApi.getProcessPair);
      this.get(MockApiPaths.Connections, MockApi.getBiflows);
      this.get(MockApiPaths.Connection, MockApi.getBiflow);
      this.get(MockApiPaths.ApplicationFlows, MockApi.getBiflows);
      this.get(MockApiPaths.ApplicationFlow, MockApi.getBiflow);
      this.get(MockApiPaths.PrometheusQuery, MockApi.getPrometheusQuery);
      this.get(MockApiPaths.PrometheusRangeQuery, MockApi.getPrometheusRangeQuery);

      this.get(`${prefix}/processgrouppairs/:id`, (_, { params: { id } }) => ({
        results: componentPairs.results.find(({ identity }) => identity === id)
      }));

      this.get(`${prefix}/addresses/:id/processpairs`, () => processPairs);
    }
  });
}

// Function to extract query parameters from the URL
function getQueryParams(url?: string): Record<string, string[]> | null {
  if (!url) {
    return null;
  }
  const params = new URLSearchParams(new URL(url).search);
  const queryParams: Record<string, string[]> = {};

  for (const [key, value] of params.entries()) {
    if (!queryParams[key]) {
      queryParams[key] = [];
    }
    queryParams[key].push(value);
  }

  return queryParams;
}
