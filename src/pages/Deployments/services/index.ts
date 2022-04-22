import { RESTApi } from 'API/REST';

import { Deployment } from './deployments.interfaces';

const DeploymentsServices = {
    fetchDeployments: async (): Promise<Deployment[]> => RESTApi.fetchDeployments(),
};

export default DeploymentsServices;
