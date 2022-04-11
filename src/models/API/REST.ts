import { MonitoringRoutersTopology } from '@pages/Monitoring/services/services.interfaces';

import { fetchWithTimeout } from './Middleware';
import {
  DATA_URL,
  MONITORING_FLOWS,
  LINKS,
  SITE_URL,
  SERVICES,
  TARGETS,
  MONITORING_ROUTERS_STAT,
  MONITORING_STATS,
  MONITORING_SERVICES_STATS,
  TOKENS,
  MONITORING_ROUTERS_TOPOLOGY,
  MONITORING_CONNECTIONS,
} from './REST.constant';
import {
  DataResponse,
  FlowsResponse,
  LinkResponse,
  MonitoringStatsResponse,
  RouterStatsResponse,
  ServiceResponse,
  TargetResponse,
  TokenResponse,
  ServicesStatsResponse,
} from './REST.interfaces';

export const RESTApi = {
  fetchData: async (): Promise<DataResponse> => {
    const { data } = await fetchWithTimeout(DATA_URL);

    return data;
  },
  fetchSite: async (): Promise<string> => {
    const { data } = await fetchWithTimeout(SITE_URL);

    return data;
  },
  fetchLinks: async (): Promise<LinkResponse[]> => {
    const { data } = await fetchWithTimeout(LINKS);

    return data;
  },
  fetchTokens: async (): Promise<TokenResponse[]> => {
    const { data } = await fetchWithTimeout(TOKENS);

    return data;
  },
  fetchTargets: async (): Promise<TargetResponse[]> => {
    const { data } = await fetchWithTimeout(TARGETS);

    return data;
  },
  fetchServices: async (): Promise<ServiceResponse[]> => {
    const { data } = await fetchWithTimeout(SERVICES);

    return data;
  },
  fetchFlows: async (): Promise<FlowsResponse[]> => {
    const { data } = await fetchWithTimeout(MONITORING_FLOWS);

    return data;
  },
  fetchMonitoringConnectionsByVanId: async (vanaddr: string): Promise<FlowsResponse[]> => {
    const { data } = await fetchWithTimeout(MONITORING_CONNECTIONS, { params: { vanaddr } });

    return data;
  },
  fetchMonitoringFlowsByVanId: async (vanaddr: string): Promise<FlowsResponse[]> => {
    const { data } = await fetchWithTimeout(MONITORING_FLOWS, { params: { vanaddr } });

    return data;
  },
  fetchVANAddresses: async (): Promise<FlowsResponse[]> => {
    const { data } = await fetchWithTimeout(MONITORING_FLOWS);

    return data;
  },
  fetchFlowsStats: async (): Promise<MonitoringStatsResponse[]> => {
    const { data } = await fetchWithTimeout(MONITORING_STATS);

    return data;
  },
  fetchFlowsRoutersStats: async (): Promise<RouterStatsResponse[]> => {
    const { data } = await fetchWithTimeout(MONITORING_ROUTERS_STAT);

    return data;
  },
  fetchFlowsServicesStats: async (): Promise<ServicesStatsResponse[]> => {
    const { data } = await fetchWithTimeout(MONITORING_SERVICES_STATS);

    return data;
  },
  fetchTopologyRoutersLinks: async (): Promise<MonitoringRoutersTopology> => {
    const { data } = await fetchWithTimeout(MONITORING_ROUTERS_TOPOLOGY);

    return data;
  },
};
