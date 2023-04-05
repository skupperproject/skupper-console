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
const addresses = require(`${path}/ADDRESSES.json`);
const addressProcesses = require(`${path}/ADDRESS_PROCESSES.json`);
const flowPairs = require(`${path}/FLOW_PAIRS.json`);
const addressesFlowPairs = require(`${path}/ADDRESS_FLOW_PAIRS.json`);
const routers: ResponseWrapper<RouterResponse[]> = require(`${path}/ROUTERS.json`);
const links: ResponseWrapper<LinkResponse[]> = require(`${path}/LINKS.json`);

interface ApiProps {
  params: Record<string, string>;
}

// api functions
export const MockApi = {
  get500Error: () => new Response(500, { some: 'header' }, { errors: ['Server Error'] }),
  get503Error: () => new Response(500, { some: 'header' }, { errors: ['Auth Error'] }),
  get404Error: () => new Response(404, { some: 'header' }, { errors: ['Not Found'] }),
  getConnectionError: () => null,
  getCollectors: () => collectors,
  getSites: () => sites,
  getSite: (_: unknown, { params: { id } }: ApiProps) => ({
    results: sites.results.find(({ identity }) => identity === id)
  })
};

// api paths
export const MockApiPaths = {
  Collectors: `${prefix}/collectors`,
  Sites: `${prefix}/sites`,
  Site: `${prefix}/sites/:id`
};

export function loadMockServer() {
  // The mock server should be disabled if the current environment is not 'development' AND the ENABLE_MOCK_SERVER environment variable is not defined or is falsy
  const shouldDisableTheMockServer = process.env.NODE_ENV !== 'development' && !process.env.ENABLE_MOCK_SERVER;

  if (process.env.API_HOST_FLOW_COLLECTOR || shouldDisableTheMockServer) {
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

      this.get(`${prefix}/sites/:id/hosts`, (_, { params: { id } }) => ({
        results: hosts.results.filter(({ parent }: HostResponse) => parent === id)
      }));

      this.get(`${prefix}/sites/:id/processes`, (_, { params: { id } }) => ({
        results: processes.results.filter(({ parent }: ProcessResponse) => parent === id)
      }));

      this.get(`${prefix}/sites/:id/routers`, (_, { params: { id } }) => ({
        results: routers.results.filter(({ parent }) => parent === id)
      }));

      this.get(`${prefix}/sites/:id/links`, (_, { params: { id } }) => ({
        results: links.results.filter((link) =>
          routers.results.find((router) => router.parent === id && router.identity === link.parent)
        )
      }));

      this.get(`${prefix}/processgroups`, () => processGroups);

      this.get(`${prefix}/processgroups/:id`, (_, { params: { id } }) => {
        const results = processGroups.results.find(({ identity }: ProcessGroupResponse) => identity === id);

        return { results };
      });

      this.get(`${prefix}/processgroups/:id/processes`, (_, { params: { id } }) => ({
        results: processes.results.filter(({ groupIdentity }: ProcessResponse) => groupIdentity === id)
      }));

      this.get(`${prefix}/processgrouppairs`, () => processGroupPairs);

      this.get(`${prefix}/processgrouppairs/:id`, (_, { params: { id } }) => ({
        results: processGroupPairs.results.find(({ identity }: ProcessPairsResponse) => identity === id)
      }));

      this.get(`${prefix}/processes`, () => processes);

      this.get(`${prefix}/processes/:id`, (_, { params: { id } }) => ({
        results: processes.results.find(({ identity }: ProcessResponse) => identity === id)
      }));

      this.get(`${prefix}/processes/:id/addresses`, (_, { params: { id } }) => {
        const process = processes.results.find(({ identity }: ProcessResponse) => identity === id);
        const processNamePrefix = process.name.split('-')[0];

        return {
          results: addresses.results.filter((address: AddressResponse) => address.name.includes(processNamePrefix))
        };
      });

      this.get(`${prefix}/processpairs`, (_, { queryParams }) => {
        if (queryParams && !Object.keys(queryParams).length) {
          return processPairs;
        }
        const filterArray = queryParams.filter.split('.');
        const key = filterArray[0] as keyof ProcessPairsResponse;
        const value = filterArray[1];

        const results = processPairs.results.filter((pair: ProcessPairsResponse) => pair[key] === value);

        return { ...processPairs, results };
      });

      this.get(`${prefix}/addresses`, () => addresses);

      this.get(`${prefix}/flowpairs`, (_, { queryParams }) => {
        const value = queryParams.filter.split('.')[1];
        const results = flowPairs.results.filter((pair: FlowPairsResponse) => pair.processAggregateId === value);

        return { ...processPairs, results };
      });

      this.get(`${prefix}/flowpairs/:id`, (_, { params: { id } }) => ({
        results: flowPairs.results.find(({ identity }: AddressResponse) => identity === id)
      }));

      this.get(`${prefix}/addresses/:id/flowpairs`, () => addressesFlowPairs);

      this.get(`${prefix}/addresses/:id/processes`, () => addressProcesses);

      this.get(`${prefix}/routers`, () => routers);

      this.get(`${prefix}/links`, () => links);
    }
  });
}
