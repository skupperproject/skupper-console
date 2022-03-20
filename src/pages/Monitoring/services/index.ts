import { RESTApi } from '@models/API/REST';

import { Flow } from './services.interfaces';

export const MonitorServices = {
  fetchFlows: async (): Promise<Flow[]> => RESTApi.fetchFlows(),
};
