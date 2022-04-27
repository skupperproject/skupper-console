import { RESTApi } from 'API/REST';

import { Deployments, Site } from './services.interfaces';

export const TopologyServices = {
    fetchSites: async (): Promise<Site[]> => RESTApi.fetchSites(),
    fetchDeployments: async (): Promise<Deployments> => {
        const { deployments, deploymentLinks } = await RESTApi.fetchData();

        return { deployments, deploymentLinks };
    },
};
