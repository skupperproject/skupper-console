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
} from './REST.constant';
import {
  DataResponse,
  FlowsResponse,
  LinksResponse,
  MonitoringStatsResponse,
  RoutersStatsResponse,
  ServicesResponse,
  TargetsResponse,
  TokenResponse,
  VansStatsResponse,
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
  fetchLinks: async (): Promise<LinksResponse[]> => {
    const { data } = await fetchWithTimeout(LINKS);

    return data;
  },
  fetchTokens: async (): Promise<TokenResponse[]> => {
    const { data } = await fetchWithTimeout(TOKENS);

    return data;
  },
  fetchTargets: async (): Promise<TargetsResponse[]> => {
    const { data } = await fetchWithTimeout(TARGETS);

    return data;
  },
  fetchServices: async (): Promise<ServicesResponse[]> => {
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
  fetchRoutersStats: async (): Promise<RoutersStatsResponse[]> => {
    const { data } = await fetchWithTimeout(ROUTERS_STAT);

    return data;
  },
  fetchVansStats: async (): Promise<VansStatsResponse[]> => {
    const { data } = await fetchWithTimeout(VANS_STAT);

    return data;
  },
};
