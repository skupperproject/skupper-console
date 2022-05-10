import { RESTApi } from 'API/REST';

import { Flow, MonitoringRoutersTopology, VanStats } from './services.interfaces';

export const MonitorServices = {
    fetchFlowsByVanId: async (id: string | undefined): Promise<Flow[] | null> =>
        id ? RESTApi.fetchMonitoringFlowsByVanId(id) : null,

    fetchConnectionsByVanId: async (id: string | undefined): Promise<Flow[] | null> =>
        id ? RESTApi.fetchMonitoringConnectionsByVanId(id) : null,

    fetchMonitoringRoutersTopology: async (): Promise<MonitoringRoutersTopology> =>
        RESTApi.fetchTopologyRoutersLinks(),

    fetchMonitoringStats: async function (): Promise<VanStats[]> {
        return RESTApi.fetchFlowsServicesStats();
    },
};
