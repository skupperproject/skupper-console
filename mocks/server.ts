import { createServer, Response } from 'miragejs';

import { AvailableProtocols, FlowDirection } from '@API/REST.enum';
import {
  ServiceResponse,
  ProcessPairsResponse,
  HostResponse,
  LinkResponse,
  ProcessGroupResponse,
  ProcessResponse,
  RouterResponse,
  SiteResponse,
  FlowPairsResponse,
  ResponseWrapper,
  ProcessGroupPairsResponse,
  SitePairsResponse
} from 'API/REST.interfaces';

const DELAY_RESPONSE = Number(process.env.MOCK_DELAY_RESPONSE) || 0; // in ms
const ITEM_COUNT = Number(process.env.MOCK_ITEM_COUNT) || 0;

// api prefix
const prefix = '/api/v1alpha1';

// api data
const path = './data';
const collectors = require(`${path}/COLLECTORS.json`);
const sites: ResponseWrapper<SiteResponse[]> = require(`${path}/SITES.json`);
const processGroups: ResponseWrapper<ProcessGroupResponse[]> = require(`${path}/PROCESS_GROUPS.json`);
const processGroupPairs: ResponseWrapper<ProcessGroupPairsResponse[]> = require(`${path}/PROCESS_GROUP_PAIRS.json`);
const processes: ResponseWrapper<ProcessResponse[]> = require(`${path}/PROCESSES.json`);
const sitePairs: ResponseWrapper<SitePairsResponse[]> = require(`${path}/SITE_PAIRS.json`);
const processPairs: ResponseWrapper<ProcessPairsResponse[]> = require(`${path}/PROCESS_PAIRS.json`);
const hosts = require(`${path}/HOSTS.json`);
const services = require(`${path}/SERVICES.json`);
const serviceProcesses = require(`${path}/SERVICE_PROCESSES.json`);
const flowPairs = require(`${path}/FLOW_PAIRS.json`);
const serviceFlowPairs = require(`${path}/SERVICE_FLOW_PAIRS.json`);
const links: ResponseWrapper<LinkResponse[]> = require(`${path}/LINKS.json`);

interface ApiProps {
  params: Record<string, string>;
  queryParams: Record<string, string[] | string | null | number | undefined>;
}

const mockSitesForPerf: SiteResponse[] = [];
for (let i = 0; i < ITEM_COUNT; i++) {
  mockSitesForPerf.push({
    recType: 'SITE',
    identity: `sitePerf${i}`,
    platform: 'kubernetes',
    startTime: 1674048705000000,
    endTime: 0,
    name: `site ${i}`,
    nameSpace: `config-grpc-site-${i}-test`,
    siteVersion: 'x.x.x'
  });
}

const mockRoutersForPerf: RouterResponse[] = [];
mockSitesForPerf.forEach((site, index) => {
  mockRoutersForPerf.push({
    recType: 'ROUTER',
    identity: `router${index}:0`,
    parent: site.identity,
    startTime: 1674048674810887,
    endTime: 0,
    name: `0/${site.name}-skupper-router-${`router${index}`}`,
    namespace: `router-namespace-${`router${index}`}`,
    imageName: 'skupper-router',
    imageVersion: 'latest',
    hostname: `skupper-router-${`router${index}`}`,
    buildVersion: 'UNKNOWN'
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

const mockSitePairsForPerf: SitePairsResponse[] = [];
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

const mockLinksForPerf: LinkResponse[] = [];
mockSitePairsForPerf.forEach((_, index) => {
  const idx1 = Math.floor(Math.random() * ITEM_COUNT);
  const idx2 = Math.floor(Math.random() * ITEM_COUNT);

  const site1 = mockSitePairsForPerf[idx1];
  const site2 = mockSitePairsForPerf[idx2];

  mockLinksForPerf.push(
    {
      recType: 'LINK',
      identity: `link-out-${index}`,
      parent: '',
      startTime: 1674048706622878,
      endTime: 0,
      mode: 'interior',
      name: '',
      linkCost: 1,
      direction: FlowDirection.Outgoing,
      sourceSiteId: site1.identity,
      destinationSiteId: site2.identity
    },
    {
      recType: 'LINK',
      identity: `link-in-${index}`,
      parent: '',
      startTime: 1674151543561656,
      endTime: 0,
      mode: 'interior',
      name: '',
      linkCost: 1,
      direction: FlowDirection.Incoming,
      sourceSiteId: site2.identity,
      destinationSiteId: site1.identity
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
  getCollectors: () => collectors,

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

  getLinks: () => {
    const linksForPerfTests = ITEM_COUNT ? mockLinksForPerf : [];
    const results = [...links.results, ...linksForPerfTests];

    return { ...links, results };
  },
  getComponents: (_: unknown, { queryParams }: ApiProps) => {
    const results = [...processGroups.results];
    if (queryParams && !Object.keys(queryParams).length) {
      return {
        ...processGroups,
        results,
        count: results.length,
        totalCount: results.length,
        timeRangeCount: results.length
      };
    }

    const filteredResults = results.filter(
      (result) => (queryParams.processGroupRole && result.processGroupRole === queryParams.processGroupRole) || true
    );

    const paginatedResults = filteredResults.slice(
      Number(queryParams.offset || 0),
      Number(queryParams.offset || 0) + Number(queryParams.limit || filteredResults.length)
    );

    return {
      ...processGroups,
      results: paginatedResults,
      count: filteredResults.length,
      totalCount: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getComponent: (_: unknown, { params: { id } }: ApiProps) => {
    const results = processGroups.results.find(({ identity }: ProcessGroupResponse) => identity === id);

    return { results };
  },
  getProcesses: (_: unknown, { queryParams }: ApiProps) => {
    const processesForPerfTests = ITEM_COUNT ? mockProcessesForPerf : [];
    const results = [...processes.results, ...processesForPerfTests];

    if (queryParams && !Object.keys(queryParams).length) {
      return {
        ...processes,
        results,
        count: results.length,
        totalCount: results.length,
        timeRangeCount: results.length
      };
    }

    const filteredResults = results.filter(
      (result) =>
        result.processRole === queryParams.processRole ||
        result.groupIdentity === queryParams.groupIdentity ||
        result.parent === queryParams.parent
    );

    const paginatedResults = filteredResults.slice(
      Number(queryParams.offset || 0),
      Number(queryParams.offset || 0) + Number(queryParams.limit || filteredResults.length - 1)
    );

    return {
      ...processes,
      results: paginatedResults,
      count: filteredResults.length,
      totalCount: filteredResults.length,
      timeRangeCount: filteredResults.length
    };
  },

  getSitePairs: (_: unknown, { queryParams }: ApiProps) => {
    const sitesForPerfTests = ITEM_COUNT ? mockSitePairsForPerf : [];
    const results = [...sitePairs.results, ...sitesForPerfTests];

    if (queryParams && !Object.keys(queryParams).length) {
      return { ...sitePairs, results };
    }

    const resultsFiltered = results.filter(
      ({ sourceId, destinationId }: SitePairsResponse) =>
        sourceId === queryParams.sourceId || destinationId === queryParams.destinationId
    );

    return { ...processPairs, results: resultsFiltered };
  },

  getProcessPairs: (_: unknown, { queryParams }: ApiProps) => {
    const processesForPerfTests = ITEM_COUNT ? mockProcessPairsForPerf : [];
    const results = [...processPairs.results, ...processesForPerfTests];

    if (queryParams && !Object.keys(queryParams).length) {
      return { ...processPairs, results };
    }

    const resultsFiltered = results.filter(
      ({ sourceId, destinationId }: ProcessPairsResponse) =>
        sourceId === queryParams.sourceId || destinationId === queryParams.destinationId
    );

    return { ...processPairs, results: resultsFiltered };
  },

  getPrometheusQuery: (_: unknown, { queryParams }: ApiProps) => {
    if ((queryParams.query as string)?.includes('sum by(destProcess, sourceProcess, direction)(rate(octets_total')) {
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
  Collectors: `${prefix}/collectors`,
  User: `${prefix}/user`,
  Logout: `${prefix}/logout`,
  Sites: `${prefix}/sites`,
  Site: `${prefix}/sites/:id`,
  SitePairs: `${prefix}/sitepairs`,
  Components: `${prefix}/processgroups`,
  Component: `${prefix}/processgroups/:id`,
  Processes: `${prefix}/processes`,
  ProcessPairs: `${prefix}/processpairs`,
  Routers: `${prefix}/routers`,
  Links: `${prefix}/links`,
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
      this.get(MockApiPaths.Collectors, MockApi.getCollectors);
      this.get(MockApiPaths.Sites, MockApi.getSites);
      this.get(MockApiPaths.Site, MockApi.getSite);
      this.get(MockApiPaths.Links, MockApi.getLinks);
      this.get(MockApiPaths.Components, MockApi.getComponents);
      this.get(MockApiPaths.Component, MockApi.getComponent);
      this.get(MockApiPaths.Processes, MockApi.getProcesses);
      this.get(MockApiPaths.SitePairs, MockApi.getSitePairs);
      this.get(MockApiPaths.ProcessPairs, MockApi.getProcessPairs);
      this.get(MockApiPaths.PrometheusQuery, MockApi.getPrometheusQuery);
      this.get(MockApiPaths.PrometheusRangeQuery, MockApi.getPrometheusRangeQuery);

      this.get(`${prefix}/sites/:id/hosts`, (_, { params: { id } }) => ({
        results: hosts.results.filter(({ parent }: HostResponse) => parent === id)
      }));

      this.get(`${prefix}/sites/:id/links`, (_, { params: { id } }) => ({
        results: links.results.filter(() => sites.results.find((site) => site.identity === id))
      }));

      this.get(`${prefix}/processgrouppairs`, () => processGroupPairs);

      this.get(`${prefix}/processgrouppairs/:id`, (_, { params: { id } }) => ({
        results: processGroupPairs.results.find(({ identity }: ProcessPairsResponse) => identity === id)
      }));

      this.get(`${prefix}/processes/:id`, (_, { params: { id } }) => ({
        results: MockApi.getProcesses(null, { params: {}, queryParams: {} }).results.find(
          ({ identity }: ProcessResponse) => identity === id
        )
      }));

      this.get(`${prefix}/processes/:id/addresses`, (_, { params: { id } }): { results: ProcessResponse[] } => {
        const process = processes.results.find(({ identity }: ProcessResponse) => identity === id);

        if (!process) {
          return { results: [] };
        }

        const processNamePrefix = process.name.split('-')[0];

        return {
          results: services.results.filter(({ name }: ServiceResponse) => name.includes(processNamePrefix))
        };
      });

      this.get(`${prefix}/flowpairs`, (_, { queryParams }) => {
        let results = [];

        if (queryParams.protocol === AvailableProtocols.Tcp) {
          results = flowPairs.results.filter(
            ({ processAggregateId, protocol, endTime }: FlowPairsResponse) =>
              processAggregateId === queryParams.processAggregateId &&
              protocol === queryParams.protocol &&
              (queryParams.state === 'active' ? endTime === 0 : endTime > 0)
          );
        } else {
          results = flowPairs.results.filter(
            ({ processAggregateId, protocol }: FlowPairsResponse) =>
              processAggregateId === queryParams.processAggregateId && protocol === queryParams.protocol
          );
        }

        return { ...processPairs, results, timeRangeCount: results.length };
      });

      this.get(`${prefix}/flowpairs/:id`, (_, { params: { id } }) => ({
        results: flowPairs.results.find(({ identity }: ServiceResponse) => identity === id)
      }));

      this.get(`${prefix}/addresses`, () => services);
      this.get(`${prefix}/addresses/:id/flowpairs`, () => serviceFlowPairs);
      this.get(`${prefix}/addresses/:id/processes`, () => serviceProcesses);
      this.get(`${prefix}/addresses/:id/processpairs`, () => processPairs);
    }
  });
}
