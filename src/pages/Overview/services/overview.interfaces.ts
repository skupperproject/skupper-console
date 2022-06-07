import { FlowsTopologyLink } from 'API/REST.interfaces';

interface LinksRouters extends FlowsTopologyLink {
    sourceNamespace: string;
    targetNamespace: string;
}

export interface Overview {
    linksRouters: LinksRouters[];
    sitesStats: {
        totalSites: number;
    };
    serviceStats: {
        totalServices: number;
    };
    deploymentsStats: {
        totalDeployments: number;
    };
}
