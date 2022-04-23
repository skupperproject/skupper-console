import { createServer, Response } from 'miragejs';

import {
    getServices,
    getDeployments,
    getFlowsServiceStats,
    getFlowsNetworkStats,
    getFlowsRoutersStats,
    getFlows,
    getFlowsTopology,
    getFlowsConnectionsByService,
    getSites,
    getData,
} from './controllers';

const DELAY_RESPONSE = 250;

export function loadMockServer() {
    const path = './data';
    const VANdata = require(`${path}/DATA.json`);
    const flowsData = require(`${path}/FLOWS.json`);
    const services = require(`${path}/SERVICES.json`);

    return createServer({
        routes() {
            this.timing = DELAY_RESPONSE;

            // General APIs
            this.get(
                '/error',
                () => new Response(500, { some: 'header' }, { errors: ['Server Error'] }),
            );

            // Sites APIs
            this.get('/data', () => getData(VANdata));
            this.get('/sites', () => getSites(VANdata));
            this.get('/sites/services', () => services);

            // Services APIs
            this.get('/services', () => getServices(VANdata));

            // Deployments APIs
            this.get('/deployments', () => getDeployments(VANdata));

            // Flows APIs
            this.get('/flows', (_, { queryParams }) => getFlows(flowsData, queryParams.vanaddr));
            this.get('/flows/network-stats', () => getFlowsNetworkStats(flowsData));
            this.get('/flows/routers-stats', () => getFlowsRoutersStats(flowsData));
            this.get('/flows/services-stats', () => getFlowsServiceStats(flowsData));
            this.get('/flows/connections', (_, { queryParams }) =>
                getFlowsConnectionsByService(flowsData, queryParams.vanaddr),
            );
            this.get('/flows/topology/network', () => getFlowsTopology(flowsData));
        },
    });
}
