import { createServer, Response } from 'miragejs';

const DELAY_RESPONSE = 250;

export function loadMockServer() {
    if (
        !process.env.API_HOST_FLOW_COLLECTOR &&
        (process.env.NODE_ENV === 'development' || !!process.env.ENABLE_MOCK_SERVER)
    ) {
        const path = './data';

        const sites = require(`${path}/SITES.json`);
        const processGroups = require(`${path}/PROCESS_GROUPS.json`);
        const processGroupPairs = require(`${path}/PROCESS_GROUP_PAIRS.json`);
        const processes = require(`${path}/PROCESSES.json`);
        const processPairs = require(`${path}/PROCESS_PAIRS.json`);
        const hosts = require(`${path}/HOSTS.json`);
        const addresses = require(`${path}/ADDRESSES.json`);
        const addressProcesses = require(`${path}/ADDRESS_PROCESSES.json`);
        const addressesFlowPairs = require(`${path}/ADDRESS_FLOW_PAIRS.json`);
        const addressConnector = require(`${path}/ADDRESS_CONNECTOR.json`);
        const addressListener = require(`${path}/ADDRESS_LISTENER.json`);
        const routers = require(`${path}/ROUTERS.json`);
        const links = require(`${path}/LINKS.json`);
        const flows = require(`${path}/FLOWS.json`);
        const flowpairs = require(`${path}/FLOWS.json`);

        const prefix = '/api/v1alpha1';

        createServer({
            routes() {
                this.timing = DELAY_RESPONSE;
                this.pretender.get('*', this.pretender.passthrough);

                this.get(
                    '/error',
                    () => new Response(500, { some: 'header' }, { errors: ['Server Error'] }),
                );

                this.get(`${prefix}/sites`, () => sites);
                this.get(`${prefix}/sites/:id`, (_, { params: { id } }) => sites.find(({identity}) => identity === id));
                this.get(`${prefix}/sites/:id/hosts`, (_, { params: { id } }) => hosts.filter(({parent}) => parent === id));
                this.get(`${prefix}/sites/:id/processes`, (_, { params: { id } }) => processes.filter(({parent}) => parent === id));
                this.get(`${prefix}/sites/:id/routers`, (_, { params: { id } }) => routers.filter(({parent}) => parent === id));
                this.get(`${prefix}/sites/:id/links`, (_, { params: { id } }) => links.filter(({parent}) => parent === id));

                this.get(`${prefix}/processgroups`, () => processGroups);
                this.get(`${prefix}/processgroups/:id`, (_, { params: { id } }) => processGroups.find(({identity}) => identity === id));
                this.get(`${prefix}/processgroups/:id/processes`, (_, { params: { id } }) => processes.filter(({groupIdentity}) => groupIdentity === id));

                this.get(`${prefix}/processgrouppairs`, () => processGroupPairs);

                this.get(`${prefix}/processgrouppairs/:id`, (_, { params: { id } }) => {
                    return processGroupPairs.find(({identity}) => identity === id);
                })

                this.get(`${prefix}/processes`, () => processes);
                this.get(`${prefix}/processes/:id`, (_, { params: { id } }) => processes.find(({identity}) => identity === id));
                this.get(`${prefix}/processes/:id/connector`, (_, { params: { id } }) => addressConnector);

                this.get(`${prefix}/listeners/:id`, (_, { params: { id } }) => addressListener);

                this.get(`${prefix}/processpairs`, (_,{queryParams}) => {
                    if(!Object.keys(queryParams).length) {
                        return processPairs
                    }

                    return processPairs.filter(pair => pair.sourceId === queryParams.sourceId || pair.destinationId === queryParams.destinationId  )

                });

                this.get(`${prefix}/processpairs/:id`, (_, { params: { id } }) => processPairs.find(({identity}) => identity === id))

                this.get(`${prefix}/addresses`, () => addresses);
                this.get(`${prefix}/addresses/:id`, (_, { params: { id } }) => addresses.find(({identity}) => identity === id));
                this.get(`${prefix}/addresses/:id/flowpairs`, (_, { params: { id } }) =>addressesFlowPairs);
                this.get(`${prefix}/addresses/:id/processes`, (_, { params: { id } }) => addressProcesses);

                this.get(`${prefix}/routers`, () => routers);
                this.get(`${prefix}/links`, () => links);
            },
        });
    }
}

