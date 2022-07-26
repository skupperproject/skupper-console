import { fetchWithTimeout } from './axiosMiddleware';
import {
    getData,
    getDeployments,
    getFlows,
    getFlowsTopology,
    getServices,
    getSites,
} from './controllers';
import {
    DATA_URL,
    FLOWS_BY_VAN_ADDRESS,
    FLOWS_CONNECTOR,
    FLOWS_CONNECTORS,
    FLOWS_FLOW,
    FLOWS_LINK,
    FLOWS_LINKS,
    FLOWS_LISTENER,
    FLOWS_LISTENERS,
    FLOWS_RECORD_BY_ID,
    FLOWS_ROUTER,
    FLOWS_ROUTERS,
    FLOWS_SITE,
    FLOWS_SITES,
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
    FlowsTopologyResponse,
    FlowsDataResponse,
    FlowResponse,
    FlowsDeviceResponse,
    FlowsRouterResponse,
    FlowsSiteResponse,
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
    fetchVanAddresses: async (): Promise<FlowsVanAddressesResponse[]> => {
        const { data } = await fetchWithTimeout(FLOWS_VAN_ADDRESSES);

        return data;
    },
    fetchFlowsSites: async (): Promise<FlowsSiteResponse[]> => {
        const { data } = await fetchWithTimeout(`${FLOWS_SITES}`);

        return data;
    },
    fetchFlowsSite: async (id: string): Promise<FlowsSiteResponse | null> => {
        const { data } = await fetchWithTimeout(`${FLOWS_SITE}/${id}`);

        return data ? data[0] : null;
    },
    fetchFlowsRouters: async (): Promise<FlowsRouterResponse[]> => {
        const { data } = await fetchWithTimeout(`${FLOWS_ROUTERS}`);

        return data;
    },
    fetchFlowsRouter: async (id: string): Promise<FlowsRouterResponse | null> => {
        const { data } = await fetchWithTimeout(`${FLOWS_ROUTER}/${id}`);

        return data ? data[0] : null;
    },
    fetchFlowsLinks: async (): Promise<FlowsDeviceResponse[]> => {
        const { data } = await fetchWithTimeout(`${FLOWS_LINKS}`);

        return data;
    },
    fetchFlowsLink: async (id: string): Promise<FlowsDeviceResponse | null> => {
        const { data } = await fetchWithTimeout(`${FLOWS_LINK}/${id}`);

        return data ? data[0] : null;
    },
    fetchFlowsConnectors: async (): Promise<FlowsDeviceResponse[]> => {
        const { data } = await fetchWithTimeout(`${FLOWS_CONNECTORS}`);

        return data;
    },
    fetchFlowsConnector: async (id: string): Promise<FlowsDeviceResponse | null> => {
        const { data } = await fetchWithTimeout(`${FLOWS_CONNECTOR}/${id}`);

        return data ? data[0] : null;
    },
    fetchFlowsListeners: async (): Promise<FlowsDeviceResponse[]> => {
        const { data } = await fetchWithTimeout(`${FLOWS_LISTENERS}`);

        return data;
    },
    fetchFlowsListener: async (id: string): Promise<FlowsDeviceResponse | null> => {
        const { data } = await fetchWithTimeout(`${FLOWS_LISTENER}/${id}`);

        return data ? data[0] : null;
    },
    fetchFlowsByVanAddr: async (vanaddr: string): Promise<FlowResponse[]> => {
        const { data } = await fetchWithTimeout(`${FLOWS_BY_VAN_ADDRESS}?vanaddr=${vanaddr}`);

        return data;
    },
    fetchFlow: async (id: string): Promise<FlowResponse | null> => {
        const { data } = await fetchWithTimeout(`${FLOWS_FLOW}/${id}`);

        return data ? data[0] : null;
    },
    fetchFlowsTopology: async (): Promise<FlowsTopologyResponse> => {
        const { data: routers } = await fetchWithTimeout(`${FLOWS_ROUTERS}`);
        const { data: links } = await fetchWithTimeout(`${FLOWS_LINKS}`);

        return getFlowsTopology(routers, links);
    },
    fetchFlowRecord: async (ids: string[]): Promise<FlowsDataResponse[]> => {
        const queryString = ids.map((id) => `id=${id}`).join('&');

        const { data } = await fetchWithTimeout(`${FLOWS_RECORD_BY_ID}?${queryString}`);

        return data;
    },
};
