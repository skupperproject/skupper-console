import { RESTApi } from '@models/API/REST';
import { groupBy } from '@utils/groupBy';

import { Flow, VansInfo } from './services.interfaces';

export const MonitorServices = {
  fetchFlows: async (): Promise<Flow[]> => RESTApi.fetchFlows(),

  fetchFlowsByVanId: async (id: string | undefined): Promise<Flow[] | null> =>
    id ? RESTApi.fetchFlowsByVanId(id) : null,

  fetchVans: async (): Promise<VansInfo[]> => {
    const flows = await RESTApi.fetchFlows();
    const flowsGroupedByVan = groupBy(flows, (flow) => flow.van_address);

    return Object.entries(flowsGroupedByVan).map(([key, values]) => ({
      id: key,
      name: key,
      numFLows: values.reduce((acc, item) => (acc = acc + item.flows.length), 0),
      nunDevices: values.length,
    }));
  },
};
