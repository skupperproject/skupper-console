import { MonitoringRoutersTopology } from '@pages/Monitoring/services/services.interfaces';

import { fetchWithTimeout } from './Middleware';
import {
    DATA_URL,
    MONITORING_FLOWS,
    SITES_SERVICES,
    MONITORING_ROUTERS_STAT,
    MONITORING_NETWORK_STATS,
    MONITORING_SERVICES_STATS,
    MONITORING_ROUTERS_TOPOLOGY,
    MONITORING_CONNECTIONS,
    SERVICES,
    DEPLOYMENTS,
} from './REST.constant';
import {
    DataResponse,
    FlowsResponse,
    MonitoringStatsResponse,
    RouterStatsResponse,
    ServiceSitesResponse,
    ServiceResponse,
    DeploymentResponse,
    NetworkStatsResponse,
} from './REST.interfaces';

export const RESTApi = {
    fetchData: async (): Promise<DataResponse> => {
        const { data } = await fetchWithTimeout(DATA_URL);

        return data;
    },
    fetchSitesServices: async (): Promise<ServiceSitesResponse[]> => {
        const { data } = await fetchWithTimeout(SITES_SERVICES);

        return data;
    },

    // SERVICES APIs
    fetchServices: async (): Promise<ServiceResponse[]> => {
        const { data } = await fetchWithTimeout(SERVICES);

        return data;
    },

    // DEPLOYMENTS APIs
    fetchDeployments: async (): Promise<DeploymentResponse[]> => {
        const { data } = await fetchWithTimeout(DEPLOYMENTS);

        return data;
    },

    // FLOWS APIs
    fetchFlowsNetworkStats: async (): Promise<MonitoringStatsResponse[]> => {
        const { data } = await fetchWithTimeout(MONITORING_NETWORK_STATS);

        return data;
    },
    fetchFlowsRoutersStats: async (): Promise<RouterStatsResponse[]> => {
        const { data } = await fetchWithTimeout(MONITORING_ROUTERS_STAT);

        return data;
    },
    fetchFlowsServicesStats: async (): Promise<NetworkStatsResponse[]> => {
        const { data } = await fetchWithTimeout(MONITORING_SERVICES_STATS);

        return data;
    },
    fetchTopologyRoutersLinks: async (): Promise<MonitoringRoutersTopology> => {
        const { data } = await fetchWithTimeout(MONITORING_ROUTERS_TOPOLOGY);

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
};
