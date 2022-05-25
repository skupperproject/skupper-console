import { RESTApi } from 'API/REST';
import { FlowsRouterResponse } from 'API/REST.interfaces';

import { Network } from './network.interfaces';

export const NetworkServices = {
    fetchNetworkStats: async function (): Promise<Network> {
        const [topologyNetwork, sites, services, deployments] = await Promise.all([
            RESTApi.fetchFlowsTopology(),
            RESTApi.fetchSites(),
            RESTApi.fetchServices(),
            RESTApi.fetchDeployments(),
        ]);

        const routersMap = topologyNetwork.nodes.reduce((acc, node) => {
            acc[node.id] = node;

            return acc;
        }, {} as Record<string, FlowsRouterResponse>);

        const linksRouters = topologyNetwork.links.map((link) => {
            const sourceNamespace = routersMap[link.target]?.namespace;
            const targetNamespace = routersMap[link.source]?.namespace;

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
