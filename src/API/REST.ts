import { fetchWithTimeout } from './axiosMiddleware';
import {
    getData,
    getDeployments,
    getFlows,
    getFlowsConnectionsByService,
    getFlowsNetworkStats,
    getFlowsRoutersStats,
    getFlowsServiceStats,
    getFlowsTopology,
    getServices,
    getSites,
} from './controllers';
import { DATA_URL, MONITORING_FLOWS } from './REST.constant';
import {
    DataAdapterResponse,
    FlowsResponse,
    MonitoringStatsResponse,
    RouterStatsResponse,
    ServiceResponse,
    NetworkStatsResponse,
    SiteResponse,
    DeploymentTopologyResponse,
    MonitoringRoutersTopologyResponse,
} from './REST.interfaces';

export const RESTApi = {
    fetchData: async (): Promise<DataAdapterResponse> => {
        const { data } = await fetchWithTimeout(DATA_URL);

        return getData(data);
    },
    fetchSites: async (): Promise<SiteResponse[]> => {
        const { data } = await fetchWithTimeout(DATA_URL);

        return getSites(data);
    },

    // SERVICES APIs
    fetchServices: async (): Promise<ServiceResponse[]> => {
        const { data } = await fetchWithTimeout(DATA_URL);

        return getServices(data);
    },

    // DEPLOYMENTS APIs
    fetchDeployments: async (): Promise<DeploymentTopologyResponse[]> => {
        const { data } = await fetchWithTimeout(DATA_URL);

        return getDeployments(data);
    },

    // FLOWS APIs
    fetchFlows: async (): Promise<FlowsResponse[]> => {
        const { data } = await fetchWithTimeout(MONITORING_FLOWS);

        return getFlows(data);
    },
    fetchMonitoringFlowsByVanId: async (vanaddr: string): Promise<FlowsResponse[]> => {
        const { data } = await fetchWithTimeout(MONITORING_FLOWS);

        return getFlows(data, vanaddr);
    },
    fetchFlowsNetworkStats: async (): Promise<MonitoringStatsResponse[]> => {
        const { data } = await fetchWithTimeout(MONITORING_FLOWS);

        return getFlowsNetworkStats(data);
    },
    fetchFlowsRoutersStats: async (): Promise<RouterStatsResponse[]> => {
        const { data } = await fetchWithTimeout(MONITORING_FLOWS);

        return getFlowsRoutersStats(data);
    },
    fetchFlowsServicesStats: async (): Promise<NetworkStatsResponse[]> => {
        const { data } = await fetchWithTimeout(MONITORING_FLOWS);

        return getFlowsServiceStats(data);
    },
    fetchTopologyRoutersLinks: async (): Promise<MonitoringRoutersTopologyResponse> => {
        const { data } = await fetchWithTimeout(MONITORING_FLOWS);

        return getFlowsTopology(data);
    },
    fetchMonitoringConnectionsByVanId: async (vanaddr: string): Promise<FlowsResponse[]> => {
        const { data } = await fetchWithTimeout(MONITORING_FLOWS);

        return getFlowsConnectionsByService(data, vanaddr);
    },
};
