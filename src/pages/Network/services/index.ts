import { RESTApi } from 'API/REST';

import { Network } from './network.interfaces';

export const NetworkServices = {
    fetchNetworkStats: async function (): Promise<Network> {
        const [topologyNetwork, sites, services, deployments] = await Promise.all([
            RESTApi.fetchFlowsTopology(),
            RESTApi.fetchSites(),
            RESTApi.fetchServices(),
            RESTApi.fetchDeployments(),
        ]);

        const routersMap = topologyNetwork.nodes.reduce((acc, router) => {
            acc[router.id] = router;

            return acc;
        }, {} as any);

        const linksRouters = topologyNetwork.links.map((link) => {
            const sourceNamespace = routersMap[link.target].namespace;
            const targetNamespace = routersMap[link.source].namespace;

            return { ...link, sourceNamespace, targetNamespace };
        });

        return {
            linksRouters,
            sitesStats: { totalSites: sites.length },
            serviceStats: { totalServices: services.length },
            deploymentsStats: { totalDeployments: deployments.length },
        };
    },
};
