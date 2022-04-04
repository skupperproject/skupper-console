import { RESTApi } from '@models/API/REST';

import { Flow, FlowTopologyRoutersLinks, MonitoringInfo } from './services.interfaces';

export const MonitorServices = {
  fetchFlowsByVanId: async (id: string | undefined): Promise<Flow[] | null> =>
    id ? RESTApi.fetchFlowsByVanId(id) : null,

  fetchTopologyRoutersLinks: async (): Promise<FlowTopologyRoutersLinks> =>
    RESTApi.fetchTopologyRoutersLinks(),

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
