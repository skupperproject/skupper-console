import { createServer, Response } from 'miragejs';

import {
  AddressResponse,
  ProcessPairsResponse,
  HostResponse,
  LinkResponse,
  ProcessGroupResponse,
  ProcessResponse,
  RouterResponse,
  SiteResponse,
  FlowPairsResponse,
  ResponseWrapper
} from 'API/REST.interfaces';

const DELAY_RESPONSE = 0;

// api prefix
const prefix = '/api/v1alpha1';

// api data
const path = './data';
const collectors = require(`${path}/COLLECTORS.json`);
const sites: ResponseWrapper<SiteResponse[]> = require(`${path}/SITES.json`);
const processGroups = require(`${path}/PROCESS_GROUPS.json`);
const processGroupPairs = require(`${path}/PROCESS_GROUP_PAIRS.json`);
const processes = require(`${path}/PROCESSES.json`);
const processPairs = require(`${path}/PROCESS_PAIRS.json`);
const hosts = require(`${path}/HOSTS.json`);
const services = require(`${path}/SERVICES.json`);
const addressProcesses = require(`${path}/SERVICE_PROCESSES.json`);
const flowPairs = require(`${path}/FLOW_PAIRS.json`);
const addressesFlowPairs = require(`${path}/SERVICE_FLOW_PAIRS.json`);
const routers: ResponseWrapper<RouterResponse[]> = require(`${path}/ROUTERS.json`);
const links: ResponseWrapper<LinkResponse[]> = require(`${path}/LINKS.json`);

const PERF_TEST = false;
const ITEMS_TEST = 190;
interface ApiProps {
  params: Record<string, string>;
  queryParams: Record<string, string>;
}

const mockSitesForPerf: SiteResponse[] = [];
for (let i = 0; i < ITEMS_TEST; i++) {
  mockSitesForPerf.push({
    recType: 'SITE',
    identity: `sitePerf${i}`,
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

const mockLinksForPerf: LinkResponse[] = [];
mockRoutersForPerf.forEach((_, index) => {
  const idx1 = Math.floor(Math.random() * ITEMS_TEST);
  const idx2 = Math.floor(Math.random() * ITEMS_TEST);

  const router1 = mockRoutersForPerf[idx1];
  const router2 = mockRoutersForPerf[idx2];

  mockLinksForPerf.push(
    {
      recType: 'LINK',
      identity: `link-out-${index}`,
      parent: router1.identity,
      startTime: 1674048706622878,
      endTime: 0,
      mode: 'interior',
      name: router2.name?.split('/')[1],
      linkCost: 1,
      direction: 'outgoing'
    },
    {
      recType: 'LINK',
      identity: `link-in-${index}`,
      parent: router2.identity,
      startTime: 1674151543561656,
      endTime: 0,
      mode: 'interior',
      name: router1.name?.split('/')[1],
      linkCost: 1,
      direction: 'incoming'
    }
  );
});

const mockProcessesForPerf: ProcessResponse[] = [];
for (let i = 0; i < ITEMS_TEST; i++) {
  const parent = Math.floor(Math.random() * (4 - 1 + 1) + 1);

  mockProcessesForPerf.push({
    ...processes[0],
    identity: `processPerf${i}`,
    parent: `site-${parent}`,
    name: `process ${i}`,
    parentName: `site ${parent}`
  });
}

// api functions
export const MockApi = {
  get500Error: () => new Response(500),
  get503Error: () => new Response(503),
  get404Error: () => new Response(404),
  getConnectionError: () => null,
  getCollectors: () => collectors,
  getSites: () => {
    const sitesForPerfTests = PERF_TEST ? mockSitesForPerf : [];
    const results = [...sites.results, ...sitesForPerfTests];

    return { ...sites, results };
  },
  getSite: (_: unknown, { params: { id } }: ApiProps) => ({
    results: sites.results.find(({ identity }) => identity === id)
  }),
  getRouters: () => {
    const routersForPerfTests = PERF_TEST ? mockRoutersForPerf : [];
    const results = [...routers.results, ...routersForPerfTests];

    return { ...routers, results };
  },
  getLinks: () => {
    const linksForPerfTests = PERF_TEST ? mockLinksForPerf : [];
    const results = [...links.results, ...linksForPerfTests];

    return { ...links, results };
  },
  getComponents: () => processGroups,
  getComponent: (_: unknown, { params: { id } }: ApiProps) => {
    const results = processGroups.results.find(({ identity }: ProcessGroupResponse) => identity === id);

    return { results };
  },
  getProcesses: (_: unknown, { queryParams }: ApiProps) => {
    const processesForPerfTests = PERF_TEST ? mockProcessesForPerf : [];
    const results = [...processes.results, ...processesForPerfTests];

    if (queryParams && !Object.keys(queryParams).length) {
      return { ...processes, results };
    }

    const resultFIltered = results.filter(
      (result) =>
        result.processRole === queryParams.processRole ||
        result.groupIdentity === queryParams.groupIdentity ||
        result.parent === queryParams.parent
    );

    return { ...processes, results: resultFIltered };
  }
};

// api paths
export const MockApiPaths = {
  Collectors: `${prefix}/collectors`,
  Sites: `${prefix}/sites`,
  Site: `${prefix}/sites/:id`,
  Components: `${prefix}/processgroups`,
  Component: `${prefix}/processgroups/:id`,
  Processes: `${prefix}/processes`,
  Routers: `${prefix}/routers`,
  Links: `${prefix}/links`
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
      this.get('', MockApi.getConnectionError);
      this.get(MockApiPaths.Collectors, MockApi.getCollectors);
      this.get(MockApiPaths.Sites, MockApi.getSites);
      this.get(MockApiPaths.Site, MockApi.getSite);
      this.get(MockApiPaths.Routers, MockApi.getRouters);
      this.get(MockApiPaths.Links, MockApi.getLinks);
      this.get(MockApiPaths.Components, MockApi.getComponents);
      this.get(MockApiPaths.Component, MockApi.getComponent);
      this.get(MockApiPaths.Processes, MockApi.getProcesses);

      this.get(`${prefix}/sites/:id/hosts`, (_, { params: { id } }) => ({
        results: hosts.results.filter(({ parent }: HostResponse) => parent === id)
      }));

      this.get(`${prefix}/sites/:id/routers`, (_, { params: { id } }) => ({
        results: routers.results.filter(({ parent }) => parent === id)
      }));

      this.get(`${prefix}/sites/:id/links`, (_, { params: { id } }) => ({
        results: links.results.filter((link) =>
          routers.results.find((router) => router.parent === id && router.identity === link.parent)
        )
      }));

      this.get(`${prefix}/processgrouppairs`, () => processGroupPairs);

      this.get(`${prefix}/processgrouppairs/:id`, (_, { params: { id } }) => ({
        results: processGroupPairs.results.find(({ identity }: ProcessPairsResponse) => identity === id)
      }));

      this.get(`${prefix}/processes/:id`, (_, { params: { id } }) => ({
        results: processes.results.find(({ identity }: ProcessResponse) => identity === id)
      }));

      this.get(`${prefix}/processes/:id/addresses`, (_, { params: { id } }) => {
        const process = processes.results.find(({ identity }: ProcessResponse) => identity === id);
        const processNamePrefix = process.name.split('-')[0];

        return {
          results: services.results.filter(({ name }: AddressResponse) => name.includes(processNamePrefix))
        };
      });

      this.get(`${prefix}/processpairs`, (_, { queryParams }) => {
        if (queryParams && !Object.keys(queryParams).length) {
          return processPairs;
        }

        const results = processPairs.results.filter(
          ({ sourceId, destinationId }: ProcessPairsResponse) =>
            sourceId === queryParams.sourceId || destinationId === queryParams.destinationId
        );

        return { ...processPairs, results };
      });

      this.get(`${prefix}/flowpairs`, (_, { queryParams }) => {
        const results = flowPairs.results.filter(
          ({ processAggregateId }: FlowPairsResponse) => processAggregateId === queryParams.processAggregateId
        );

        return { ...processPairs, results };
      });

      this.get(`${prefix}/flowpairs/:id`, (_, { params: { id } }) => ({
        results: flowPairs.results.find(({ identity }: AddressResponse) => identity === id)
      }));

      this.get(`${prefix}/addresses`, () => services);
      this.get(`${prefix}/addresses/:id/flowpairs`, () => addressesFlowPairs);
      this.get(`${prefix}/addresses/:id/processes`, () => addressProcesses);
    }
  });
}
