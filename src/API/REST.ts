import { fetchWithTimeout } from './axiosMiddleware';
import {
    getData,
    getDeployments,
    getFlows,
    getFlowsConnectionsByService,
    getFlowsTopology,
    getServices,
    getSites,
} from './controllers';
import {
    DATA_URL,
    FLOWS_BY_VAN_ADDRESS,
    FLOWS_LINKS,
    FLOWS_TOPOLOGY,
    FLOWS_VAN_ADDRESSES,
} from './REST.constant';
import {
    DataAdapterResponse,
    FlowsResponse,
    ServiceResponse,
    SiteResponse,
    DeploymentTopologyResponse,
    FlowsVanAddressesResponse,
    LinkStatsResponse,
    FlowsTopologyResponse,
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
    fetchMonitoringFlowsByVanId: async (vanaddr: string): Promise<FlowsResponse[]> => {
        const { data: topology } = await fetchWithTimeout(`${FLOWS_TOPOLOGY}`);
        const { data: flows } = await fetchWithTimeout(
            `${FLOWS_BY_VAN_ADDRESS}?vanaddr=${vanaddr}`,
        );

        const data = [...topology, ...flows];

        return getFlows(data, vanaddr);
    },
    fetchFlowsLinks: async (): Promise<LinkStatsResponse[]> => {
        const { data } = await fetchWithTimeout(`${FLOWS_LINKS}`);

        return data;
    },
    fetchFlowsTopology: async (): Promise<FlowsTopologyResponse> => {
        const { data } = await fetchWithTimeout(`${FLOWS_TOPOLOGY}`);

        return getFlowsTopology(data);
    },
    fetchFlowsByVanId: async (vanaddr: string): Promise<FlowsResponse[]> => {
        const { data: topology } = await fetchWithTimeout(`${FLOWS_TOPOLOGY}`);
        const { data: flows } = await fetchWithTimeout(
            `${FLOWS_BY_VAN_ADDRESS}?vanaddr=${vanaddr}`,
        );

        const data = [...topology, ...flows];

        return getFlowsConnectionsByService(data, vanaddr);
    },
    fetchFlowsVanAddresses: async (): Promise<FlowsVanAddressesResponse[]> => {
        const { data } = await fetchWithTimeout(FLOWS_VAN_ADDRESSES);

        return data;
    },
};
