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
  FlowPairsResponse
} from 'API/REST.interfaces';

const DELAY_RESPONSE = 250;

export function loadMockServer() {
  if (
    !process.env.API_HOST_FLOW_COLLECTOR &&
    (process.env.NODE_ENV === 'development' || !!process.env.ENABLE_MOCK_SERVER)
  ) {
    const path = './data';
    const collectors = require(`${path}/COLLECTORS.json`);
    const sites = require(`${path}/SITES.json`);
    const processGroups = require(`${path}/PROCESS_GROUPS.json`);
    const processGroupPairs = require(`${path}/PROCESS_GROUP_PAIRS.json`);
    const processes = require(`${path}/PROCESSES.json`);
    const processPairs = require(`${path}/PROCESS_PAIRS.json`);
    const hosts = require(`${path}/HOSTS.json`);
    const addresses = require(`${path}/ADDRESSES.json`);
    const addressProcesses = require(`${path}/ADDRESS_PROCESSES.json`);
    const flowPairs = require(`${path}/FLOW_PAIRS.json`);
    const addressesFlowPairs = require(`${path}/ADDRESS_FLOW_PAIRS.json`);
    const routers = require(`${path}/ROUTERS.json`);
    const links = require(`${path}/LINKS.json`);

    const prefix = '/api/v1alpha1';

    createServer({
      routes() {
        this.timing = DELAY_RESPONSE;
        this.pretender.get('*', this.pretender.passthrough);

        this.get('/error', () => new Response(500, { some: 'header' }, { errors: ['Server Error'] }));
        this.get(`${prefix}/collectors`, () => collectors);
        this.get(`${prefix}/sites`, () => sites);
        this.get(`${prefix}/sites/:id`, (_, { params: { id } }) => ({
          results: sites.results.find(({ identity }: SiteResponse) => identity === id)
        }));

        this.get(`${prefix}/sites/:id/hosts`, (_, { params: { id } }) => ({
          results: hosts.results.filter(({ parent }: HostResponse) => parent === id)
        }));

        this.get(`${prefix}/sites/:id/processes`, (_, { params: { id } }) => ({
          results: processes.results.filter(({ parent }: ProcessResponse) => parent === id)
        }));

        this.get(`${prefix}/sites/:id/routers`, (_, { params: { id } }) => ({
          results: routers.results.filter(({ parent }: RouterResponse) => parent === id)
        }));

        this.get(`${prefix}/sites/:id/links`, (_, { params: { id } }) => ({
          results: links.results.filter(({ parent }: LinkResponse) => parent === id)
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
}
