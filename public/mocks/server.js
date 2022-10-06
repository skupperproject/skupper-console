import { createServer, Response } from 'miragejs';

const DELAY_RESPONSE = 250;

export function loadMockServer() {
    if (
        !process.env.API_HOST_FLOW_COLLECTOR &&
        (process.env.NODE_ENV === 'development' || !!process.env.ENABLE_MOCK_SERVER)
    ) {
        const path = './data';

        const data = require(`${path}/DATA.json`);

        const addresses = require(`${path}/FLOWS-ADDRESSES.json`);
        const sites = require(`${path}/FLOWS-SITES.json`);
        const routers = require(`${path}/FLOWS-ROUTERS.json`);
        const links = require(`${path}/FLOWS-LINKS.json`);
        const listeners = require(`${path}/FLOWS-LISTENERS.json`);
        const connectors = require(`${path}/FLOWS-CONNECTORS.json`);
        const flows = require(`${path}/FLOWS.json`);
        const processes = require(`${path}/FLOWS-PROCESSES.json`);

        const prefix = '/api/v1alpha1';

        createServer({
            routes() {
                this.timing = DELAY_RESPONSE;
                this.pretender.get('*', this.pretender.passthrough);

                this.get(
                    '/error',
                    () => new Response(500, { some: 'header' }, { errors: ['Server Error'] }),
                );
                this.get('/DATA', () => data);

                this.get(`${prefix}/addresses`, () => addresses);
                this.get(`${prefix}/sites`, () => sites);
                this.get(`${prefix}/routers`, () => routers);
                this.get(`${prefix}/links`, () => links);
                this.get(`${prefix}/listeners`, () => listeners);
                this.get(`${prefix}/connectors`, () => connectors);
                this.get(`${prefix}/flows`, () => flows);
                this.get(`${prefix}/processes`, () => processes);

                this.get(`${prefix}/addresses/:id`, (_, { params: { id } }) =>
                    getEntity(addresses, id),
                );
                this.get(`${prefix}/sites/:id`, (_, { params: { id } }) => getEntity(sites, id));
                this.get(`${prefix}/routers/:id`, (_, { params: { id } }) =>
                    getEntity(routers, id),
                );
                this.get(`${prefix}/links/:id`, (_, { params: { id } }) => getEntity(links, id));
                this.get(`${prefix}/listeners/:id`, (_, { params: { id } }) =>
                    getEntity(listeners, id),
                );
                this.get(`${prefix}/connectors/:id`, (_, { params: { id } }) =>
                    getEntity(connectors, id),
                );
                this.get(`${prefix}/flows/:id`, (_, { params }) =>
                    flows.filter(({ identity }) => identity === params.id),
                );
                this.get(`${prefix}/processes/:id`, (_, { params }) =>
                    processes.filter(({ identity }) => identity === params.id),
                );
            },
        });
    }
}

function getEntity(list, id) {
    return list.filter(({ identity }) => identity === id);
}
