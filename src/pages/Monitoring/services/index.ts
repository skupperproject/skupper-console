import { RESTApi } from '@models/API/REST';

import { Flow, MonitoringInfo } from './services.interfaces';

export const MonitorServices = {
  fetchFlows: async (): Promise<Flow[]> => RESTApi.fetchFlows(),

  fetchFlowsByVanId: async (id: string | undefined): Promise<Flow[] | null> =>
    id ? RESTApi.fetchFlowsByVanId(id) : null,

  fetchMonitoringStats: async function (): Promise<MonitoringInfo> {
    const [vansStats, routersStats, monitoringStats] = await Promise.all([
      RESTApi.fetchVansStats(),
      RESTApi.fetchRoutersStats(),
      RESTApi.fetchMonitoringStats(),
    ]);

    return {
      vansStats,
      routersStats,
      monitoringStats,
    };
  },
};
