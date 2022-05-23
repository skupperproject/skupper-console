import { RESTApi } from 'API/REST';

import { Flow, MonitoringTopology, VanAddresses } from './services.interfaces';

export const MonitorServices = {
    fetchFlowsByVanId: async (id: string | undefined): Promise<Flow[] | null> =>
        id ? RESTApi.fetchMonitoringFlowsByVanId(id) : null,

    fetchConnectionsByVanId: async (id: string | undefined): Promise<Flow[] | null> =>
        id ? RESTApi.fetchFlowsByVanId(id) : null,

    fetchMonitoringTopology: async (): Promise<MonitoringTopology> => RESTApi.fetchFlowsTopology(),

    fetchVanAddresses: async function (): Promise<VanAddresses[]> {
        return RESTApi.fetchFlowsVanAddresses();
    },
};
