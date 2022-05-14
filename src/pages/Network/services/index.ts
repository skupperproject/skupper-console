import { RESTApi } from 'API/REST';

import { Network } from './network.interfaces';

export const NetworkServices = {
    fetchNetworkStats: async function (): Promise<Network> {
        const [routersStats, networkStats, sites, services, deployments] = await Promise.all([
            RESTApi.fetchFlowsRoutersStats(),
            RESTApi.fetchFlowsNetworkStats(),
            RESTApi.fetchSites(),
            RESTApi.fetchServices(),
            RESTApi.fetchDeployments(),
        ]);

        return {
            routersStats,
            networkStats,
            sitesStats: { totalSites: sites.length },
            serviceStats: { totalServices: services.length },
            deploymentsStats: { totalDeployments: deployments.length },
        };
    },
};
