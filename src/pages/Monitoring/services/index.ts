import { RESTApi } from '@models/API/REST';
import { FlowsResponse } from '@models/API/REST.interfaces';
import { groupBy } from '@utils/groupBy';

import { Flow, VansInfo } from './services.interfaces';

export const MonitorServices = {
  fetchFlows: async (): Promise<Flow[]> => RESTApi.fetchFlows(),

  fetchFlowsByVanId: async (id: string | undefined): Promise<Flow[] | null> =>
    id ? RESTApi.fetchFlowsByVanId(id) : null,

  fetchVans: async function (): Promise<VansInfo[]> {
    function sumFlows(devices: FlowsResponse[]) {
      return devices.reduce((acc, flowsPerDevice) => (acc = acc + flowsPerDevice.flows.length), 0);
    }

    const flows = await RESTApi.fetchFlows();
    const flowsGroupedByVan = groupBy(flows, (flow) => flow.van_address);

    return Object.entries(flowsGroupedByVan).map(([key, devices]) => ({
      id: key,
      name: key,
      numFLows: sumFlows(devices),
      nunDevices: devices.length,
    }));
  },
};
