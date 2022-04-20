import { RESTApi } from '@models/API/REST';

import { Flow, MonitoringRoutersTopology, MonitoringInfo } from './services.interfaces';

export const MonitorServices = {
    fetchFlowsByVanId: async (id: string | undefined): Promise<Flow[] | null> =>
        id ? RESTApi.fetchMonitoringFlowsByVanId(id) : null,

    fetchConnectionsByVanId: async (id: string | undefined): Promise<Flow[] | null> =>
        id ? RESTApi.fetchMonitoringConnectionsByVanId(id) : null,

    fetchMonitoringRoutersTopology: async (): Promise<MonitoringRoutersTopology> =>
        RESTApi.fetchTopologyRoutersLinks(),

    fetchMonitoringStats: async function (): Promise<MonitoringInfo> {
        const [vansStats, routersStats, monitoringStats] = await Promise.all([
            RESTApi.fetchFlowsServicesStats(),
            RESTApi.fetchFlowsRoutersStats(),
            RESTApi.fetchFlowsNetworkStats(),
        ]);

        return {
            vansStats,
            routersStats,
            monitoringStats,
        };
    },
};
