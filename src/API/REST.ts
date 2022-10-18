import { fetchWithTimeout } from './axiosMiddleware';
import {
    CONNECTORS_PATH,
    LINKS_PATH,
    LISTENERS_PATH,
    SITES_PATH,
    ADDRESSES_PATH,
    FLOWPAIRS_PATH,
    getFlowsPairsByAddressPATH,
    getProcessesBySitePATH,
    getProcessesByAddressPATH,
    getConnectorByProcessPATH,
    getSitePATH,
    getRoutersBySitePATH,
    getLinksBySitePATH,
    getHostsBySitePATH,
    PROCESS_PAIRS_PATH,
    ROUTERS_PATH,
    PROCESSES_PATH,
    SITE_PAIRS_PATH,
    HOSTS_PATH,
    PROCESS_GROUPS_PATH,
    getProcessesByProcessGroupPATH,
    getProcessGroupPATH,
    PROCESS_GROUP_PAIRS_PATH,
    getListenerPATH,
    geProcessPATH,
    getConnectorsByAddressPATH,
    getLinkPATH,
    getConnectorPATH,
} from './REST.constant';
import {
    ProcessGroupResponse,
    AddressResponse,
    DeviceResponse,
    ProcessResponse,
    FlowPairResponse,
    SiteResponse,
    LinkResponse,
    RouterResponse,
    HostResponse,
    FlowAggregatesMapResponse,
    FlowAggregatesResponse,
} from './REST.interfaces';

export const RESTApi = {
    // SITES APIs
    fetchSites: async (): Promise<SiteResponse[]> => {
        const { data } = await fetchWithTimeout(SITES_PATH);

        return data;
    },
    fetchSite: async (id: string): Promise<SiteResponse> => {
        const { data } = await fetchWithTimeout(getSitePATH(id));

        return data;
    },
    fetchProcessesBySite: async (id: string): Promise<ProcessResponse[]> => {
        const { data } = await fetchWithTimeout(getProcessesBySitePATH(id));

        return data;
    },
    fetchRoutersBySite: async (id: string): Promise<RouterResponse[]> => {
        const { data } = await fetchWithTimeout(getRoutersBySitePATH(id));

        return data;
    },
    fetchLinksBySite: async (id: string): Promise<LinkResponse[]> => {
        const { data } = await fetchWithTimeout(getLinksBySitePATH(id));

        return data;
    },
    fetchHostsBySite: async (id: string): Promise<HostResponse[]> => {
        const { data } = await fetchWithTimeout(getHostsBySitePATH(id));

        return data;
    },

    // ROUTER APIs
    fetchRouters: async (): Promise<RouterResponse[]> => {
        const { data } = await fetchWithTimeout(`${ROUTERS_PATH}`);

        return data;
    },
    fetchRouter: async (id: string): Promise<RouterResponse> => {
        const { data } = await fetchWithTimeout(`${ROUTERS_PATH}/${id}`);

        return data;
    },

    // PROCESS APIs
    fetchProcesses: async (): Promise<ProcessResponse[]> => {
        const { data } = await fetchWithTimeout(`${PROCESSES_PATH}`);

        return data;
    },

    fetchProcess: async (id: string): Promise<ProcessResponse> => {
        const { data } = await fetchWithTimeout(geProcessPATH(id));

        return data;
    },

    // HOST APIs
    fetchHost: async (): Promise<HostResponse[]> => {
        const { data } = await fetchWithTimeout(`${HOSTS_PATH}`);

        return data;
    },

    // PROCESS GROUPS APIs
    fetchProcessGroups: async (): Promise<ProcessGroupResponse[]> => {
        const { data } = await fetchWithTimeout(PROCESS_GROUPS_PATH);

        return data;
    },
    fetchProcessGroup: async (id: string): Promise<ProcessGroupResponse> => {
        const { data } = await fetchWithTimeout(getProcessGroupPATH(id));

        return data;
    },
    fetchProcessesByProcessGroup: async (id: string): Promise<ProcessResponse[]> => {
        const { data } = await fetchWithTimeout(getProcessesByProcessGroupPATH(id));

        return data;
    },

    // PROCESSES  APIs
    fetchConnectorByProcess: async (id: string): Promise<DeviceResponse> => {
        const { data } = await fetchWithTimeout(getConnectorByProcessPATH(id));

        return data;
    },

    // LINKS  APIs
    fetchLinks: async (): Promise<LinkResponse[]> => {
        const { data } = await fetchWithTimeout(`${LINKS_PATH}`);

        return data;
    },

    fetchLink: async (id: string): Promise<LinkResponse> => {
        const { data } = await fetchWithTimeout(getLinkPATH(id));

        return data;
    },

    // CONNECTORS  APIs
    fetchConnectors: async (): Promise<DeviceResponse[]> => {
        const { data } = await fetchWithTimeout(`${CONNECTORS_PATH}`);

        return data;
    },

    fetchConnector: async (id: string): Promise<DeviceResponse | null> => {
        const { data } = await fetchWithTimeout(getConnectorPATH(id));

        return data;
    },

    // LISTENERS  APIs
    fetchListeners: async (): Promise<DeviceResponse[]> => {
        const { data } = await fetchWithTimeout(`${LISTENERS_PATH}`);

        return data;
    },

    fetchListener: async (id: string): Promise<DeviceResponse> => {
        const { data } = await fetchWithTimeout(getListenerPATH(id));

        return data;
    },

    // ADDRESSES  APIs
    fetchAddresses: async (): Promise<AddressResponse[]> => {
        const { data } = await fetchWithTimeout(ADDRESSES_PATH);

        return data;
    },

    fetchFlowPairsByAddress: async (id: string): Promise<FlowPairResponse[]> => {
        const { data } = await fetchWithTimeout(getFlowsPairsByAddressPATH(id));

        return data;
    },

    fetchProcessesByAddresses: async (id: string): Promise<ProcessResponse[]> => {
        const { data } = await fetchWithTimeout(getProcessesByAddressPATH(id));

        return data;
    },

    fetchConnectorsByAddresses: async (id: string): Promise<ProcessResponse[]> => {
        const { data } = await fetchWithTimeout(getConnectorsByAddressPATH(id));

        return data;
    },

    // FLOW PAIRS  APIs
    fetchFlowPair: async (id: string): Promise<FlowPairResponse> => {
        const { data } = await fetchWithTimeout(`${FLOWPAIRS_PATH}/${id}`);

        return data;
    },

    // AGGREGRATE  APIs
    fetchSitesPairs: async (): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await fetchWithTimeout(SITE_PAIRS_PATH);

        return data;
    },

    fetchSitePairs: async (id: string): Promise<FlowAggregatesResponse> => {
        const { data } = await fetchWithTimeout(`${SITE_PAIRS_PATH}/${id}`);

        return data;
    },

    fetchProcessgroupsPairs: async (): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await fetchWithTimeout(PROCESS_GROUP_PAIRS_PATH);

        return data;
    },

    fetchProcessGroupPairs: async (id: string): Promise<FlowAggregatesResponse> => {
        const { data } = await fetchWithTimeout(`${PROCESS_GROUP_PAIRS_PATH}/${id}`);

        return data;
    },

    fetchProcessesPairs: async (): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await fetchWithTimeout(PROCESS_PAIRS_PATH);

        return data;
    },

    fetchProcessPairs: async (id: string): Promise<FlowAggregatesResponse> => {
        const { data } = await fetchWithTimeout(`${PROCESS_PAIRS_PATH}/${id}`);

        return data;
    },
};
