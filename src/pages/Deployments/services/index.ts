import { RESTApi } from '@models/API/REST';

import { Deployment } from './deployments.interfaces';

const DeploymentsServices = {
    fetchDeployments: async (): Promise<Deployment[]> => RESTApi.fetchDeployments(),
};

export default DeploymentsServices;
