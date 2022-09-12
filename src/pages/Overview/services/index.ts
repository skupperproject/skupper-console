import { getServices, getSites } from 'API/controllers';
import { RESTApi } from 'API/REST';
import { RouterResponse } from 'API/REST.interfaces';

import { Overview } from './overview.interfaces';

export const NetworkServices = {
    fetchOverviewStats: async function (): Promise<Overview> {
        const [data, topologyNetwork] = await Promise.all([
            RESTApi.fetchData(),
            RESTApi.fetchFlowsTopology(),
        ]);

        const sites = getSites(data);
        const services = getServices(data);

        const routersMap = topologyNetwork.nodes.reduce((acc, node) => {
            acc[node.identity] = node;

            return acc;
        }, {} as Record<string, RouterResponse>);

        const linksRouters = topologyNetwork.links.map((link) => {
            const sourceNamespace = routersMap[link.target]?.namespace;
            const targetNamespace = routersMap[link.source]?.namespace;

            return { ...link, sourceNamespace, targetNamespace };
        });

        return {
            linksRouters,
            sitesStats: { totalSites: sites.length },
            serviceStats: { totalServices: services.length },
        };
    },
};
