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
    if (process.env.NODE_ENV === 'development' || !!process.env.ENABLE_MOCK_SERVER) {
        const path = './data';
        const VANdata = require(`${path}/DATA.json`);
        const flowsData = require(`${path}/FLOWS.json`);

        createServer({
            routes() {
                this.timing = DELAY_RESPONSE;
                this.pretender.get('*', this.pretender.passthrough);
                // General APIs
                this.get(
                    '/error',
                    () => new Response(500, { some: 'header' }, { errors: ['Server Error'] }),
                );

                this.get('/data', () => getData(VANdata));

                // Sites APIs
                this.get('/sites', () => getSites(VANdata));

                // Services APIs
                this.get('/services', () => getServices(VANdata));

                // Deployments APIs
                this.get('/deployments', () => getDeployments(VANdata));

                // Flows APIs
                this.get('/flows', (_, { queryParams }) =>
                    getFlows(flowsData, queryParams.vanaddr),
                );
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
}
