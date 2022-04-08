import { FlowTopologyRoutersLinks } from '@pages/Monitoring/services/services.interfaces';

import { fetchWithTimeout } from './Middleware';
import {
  DATA_URL,
  FLOWS,
  LINKS,
  SITE_URL,
  SERVICES,
  TARGETS,
  ROUTERS_STAT,
  MONITORING_STATS,
  VANS_STAT,
  TOKENS,
  FLOWS_TOPOLOGY_ROUTERS_LINKS,
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
  VanAddressStatsResponse,
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
    const { data } = await fetchWithTimeout(FLOWS);

    return data;
  },
  fetchFlowsByVanId: async (vanaddr: string): Promise<FlowsResponse[]> => {
    const { data } = await fetchWithTimeout(FLOWS, { params: { vanaddr } });

    return data;
  },
  fetchVANAddresses: async (): Promise<FlowsResponse[]> => {
    const { data } = await fetchWithTimeout(FLOWS);

    return data;
  },
  fetchMonitoringStats: async (): Promise<MonitoringStatsResponse[]> => {
    const { data } = await fetchWithTimeout(MONITORING_STATS);

    return data;
  },
  fetchRoutersStats: async (): Promise<RouterStatsResponse[]> => {
    const { data } = await fetchWithTimeout(ROUTERS_STAT);

    return data;
  },
  fetchVansStats: async (): Promise<VanAddressStatsResponse[]> => {
    const { data } = await fetchWithTimeout(VANS_STAT);

    return data;
  },
  fetchTopologyRoutersLinks: async (): Promise<FlowTopologyRoutersLinks> => {
    const { data } = await fetchWithTimeout(FLOWS_TOPOLOGY_ROUTERS_LINKS);

    return data;
  },
};
