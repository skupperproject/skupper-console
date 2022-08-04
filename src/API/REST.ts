import { fetchWithTimeout } from './axiosMiddleware';
import { getData, getDeployments, getFlowsTopology, getServices, getSites } from './controllers';
import {
    DATA_URL,
    FLOWS_CONNECTORS,
    FLOWS,
    FLOWS_LINKS,
    FLOWS_LISTENERS,
    FLOWS_ROUTERS,
    FLOWS_SITES,
    FLOWS_VAN_ADDRESSES,
    FLOWS_PROCESSES,
} from './REST.constant';
import {
    DataAdapterResponse,
    ServiceResponse,
    SiteResponse,
    DeploymentTopologyResponse,
    FlowsVanAddressesResponse,
    FlowsTopologyResponse,
    FlowResponse,
    FlowsDeviceResponse,
    FlowsRouterResponse,
    FlowsSiteResponse,
    FlowsProcessResponse,
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
    fetchVanAddresses: async (): Promise<FlowsVanAddressesResponse[]> => {
        const { data } = await fetchWithTimeout(FLOWS_VAN_ADDRESSES);

        return data;
    },
    fetchFlowsSites: async (): Promise<FlowsSiteResponse[]> => {
        const { data } = await fetchWithTimeout(`${FLOWS_SITES}`);

        return data;
    },
    fetchFlowsSite: async (id: string): Promise<FlowsSiteResponse> => {
        const { data } = await fetchWithTimeout(`${FLOWS_SITES}/${id}`);

        return data;
    },
    fetchFlowsProcesses: async (): Promise<FlowsProcessResponse[]> => {
        const { data } = await fetchWithTimeout(`${FLOWS_PROCESSES}`);

        return data;
    },
    fetchFlowProcess: async (id: string): Promise<FlowsProcessResponse> => {
        const { data } = await fetchWithTimeout(`${FLOWS_PROCESSES}/${id}`);

        return data;
    },
    fetchFlowsRouters: async (): Promise<FlowsRouterResponse[]> => {
        const { data } = await fetchWithTimeout(`${FLOWS_ROUTERS}`);

        return data;
    },
    fetchFlowsRouter: async (id: string): Promise<FlowsRouterResponse> => {
        const { data } = await fetchWithTimeout(`${FLOWS_ROUTERS}/${id}`);

        return data ? data : null;
    },
    fetchFlowsLinks: async (): Promise<FlowsDeviceResponse[]> => {
        const { data } = await fetchWithTimeout(`${FLOWS_LINKS}`);

        return data;
    },
    fetchFlowsLink: async (id: string): Promise<FlowsDeviceResponse> => {
        const { data } = await fetchWithTimeout(`${FLOWS_LINKS}/${id}`);

        return data ? data : null;
    },
    fetchFlowsConnectors: async (): Promise<FlowsDeviceResponse[]> => {
        const { data } = await fetchWithTimeout(`${FLOWS_CONNECTORS}`);

        return data;
    },
    fetchFlowsConnector: async (id: string): Promise<FlowsDeviceResponse> => {
        const { data } = await fetchWithTimeout(`${FLOWS_CONNECTORS}/${id}`);

        return data ? data : null;
    },
    fetchFlowsListeners: async (): Promise<FlowsDeviceResponse[]> => {
        const { data } = await fetchWithTimeout(`${FLOWS_LISTENERS}`);

        return data;
    },
    fetchFlowsListener: async (id: string): Promise<FlowsDeviceResponse> => {
        const { data } = await fetchWithTimeout(`${FLOWS_LISTENERS}/${id}`);

        return data;
    },
    fetchFlowsByVanAddr: async (vanaddr: string): Promise<FlowResponse[]> => {
        const { data } = await fetchWithTimeout(`${FLOWS}?vanaddr=${vanaddr}`);

        return data;
    },
    fetchFlow: async (id: string): Promise<FlowResponse> => {
        const { data } = await fetchWithTimeout(`${FLOWS}/${id}`);

        return data;
    },
    fetchFlowsTopology: async (): Promise<FlowsTopologyResponse> => {
        const { data: routers } = await fetchWithTimeout(`${FLOWS_ROUTERS}`);
        const { data: links } = await fetchWithTimeout(`${FLOWS_LINKS}`);

        return getFlowsTopology(routers, links);
    },
};
