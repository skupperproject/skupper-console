import { RESTApi } from 'API/REST';

import { Deployments } from './services.interfaces';

export const TopologyServices = {
    fetchDeployments: async (): Promise<Deployments> => {
        const { deployments, deploymentLinks } = await RESTApi.fetchData();

        return { deployments, deploymentLinks };
    },
};
