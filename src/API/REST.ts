import { fetchWithTimeout } from './axiosMiddleware';
import {
    CONNECTORS_PATH,
    LINKS_PATH,
    LISTENERS_PATH,
    SITES_PATH,
    ADDRESSES_PATH,
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
    getRouterPATH,
    getFlowPairPATH,
    getSitePairPATH,
    getProcessGroupPairPATH,
    getProcessPairPATH,
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
    RequestOptions,
} from './REST.interfaces';

export const RESTApi = {
    // SITES APIs
    fetchSites: async (options?: RequestOptions): Promise<SiteResponse[]> => {
        const { data } = await fetchWithTimeout(SITES_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchSite: async (id: string, options?: RequestOptions): Promise<SiteResponse> => {
        const { data } = await fetchWithTimeout(getSitePATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchProcessesBySite: async (
        id: string,
        options?: RequestOptions,
    ): Promise<ProcessResponse[]> => {
        const { data } = await fetchWithTimeout(getProcessesBySitePATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchRoutersBySite: async (id: string, options?: RequestOptions): Promise<RouterResponse[]> => {
        const { data } = await fetchWithTimeout(getRoutersBySitePATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchLinksBySite: async (id: string, options?: RequestOptions): Promise<LinkResponse[]> => {
        const { data } = await fetchWithTimeout(getLinksBySitePATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchHostsBySite: async (id: string, options?: RequestOptions): Promise<HostResponse[]> => {
        const { data } = await fetchWithTimeout(getHostsBySitePATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // ROUTER APIs
    fetchRouters: async (options?: RequestOptions): Promise<RouterResponse[]> => {
        const { data } = await fetchWithTimeout(ROUTERS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchRouter: async (id: string, options?: RequestOptions): Promise<RouterResponse> => {
        const { data } = await fetchWithTimeout(getRouterPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // PROCESS APIs
    fetchProcesses: async (options?: RequestOptions): Promise<ProcessResponse[]> => {
        const { data } = await fetchWithTimeout(PROCESSES_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data.map((process: ProcessGroupResponse) => ({
            ...process,
            type: process.name.startsWith('skupper-') ? 'skupper' : 'app',
        }));
    },
    fetchProcess: async (id: string, options?: RequestOptions): Promise<ProcessResponse> => {
        const { data } = await fetchWithTimeout(geProcessPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // HOST APIs
    fetchHost: async (options?: RequestOptions): Promise<HostResponse[]> => {
        const { data } = await fetchWithTimeout(HOSTS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // PROCESS GROUPS APIs
    fetchProcessGroups: async (options?: RequestOptions): Promise<ProcessGroupResponse[]> => {
        const { data } = await fetchWithTimeout(PROCESS_GROUPS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data.map((processGroup: ProcessGroupResponse) => ({
            ...processGroup,
            type: processGroup.name.startsWith('skupper-') ? 'skupper' : 'app',
        }));
    },
    fetchProcessGroup: async (
        id: string,
        options?: RequestOptions,
    ): Promise<ProcessGroupResponse> => {
        const { data } = await fetchWithTimeout(getProcessGroupPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchProcessesByProcessGroup: async (
        id: string,
        options?: RequestOptions,
    ): Promise<ProcessResponse[]> => {
        const { data } = await fetchWithTimeout(getProcessesByProcessGroupPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data.map((processGroup: ProcessGroupResponse) => ({
            ...processGroup,
            type: processGroup.name.startsWith('skupper-') ? 'skupper' : 'app',
        }));
    },

    // PROCESSES  APIs
    fetchConnectorByProcess: async (
        id: string,
        options?: RequestOptions,
    ): Promise<DeviceResponse> => {
        const { data } = await fetchWithTimeout(getConnectorByProcessPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // LINKS  APIs
    fetchLinks: async (options?: RequestOptions): Promise<LinkResponse[]> => {
        const { data } = await fetchWithTimeout(`${LINKS_PATH}`, {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchLink: async (id: string, options?: RequestOptions): Promise<LinkResponse> => {
        const { data } = await fetchWithTimeout(getLinkPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // CONNECTORS  APIs
    fetchConnectors: async (options?: RequestOptions): Promise<DeviceResponse[]> => {
        const { data } = await fetchWithTimeout(CONNECTORS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchConnector: async (
        id: string,
        options?: RequestOptions,
    ): Promise<DeviceResponse | null> => {
        const { data } = await fetchWithTimeout(getConnectorPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // LISTENERS  APIs
    fetchListeners: async (options?: RequestOptions): Promise<DeviceResponse[]> => {
        const { data } = await fetchWithTimeout(LISTENERS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchListener: async (id: string, options?: RequestOptions): Promise<DeviceResponse> => {
        const { data } = await fetchWithTimeout(getListenerPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // ADDRESSES  APIs
    fetchAddresses: async (options?: RequestOptions): Promise<AddressResponse[]> => {
        const { data } = await fetchWithTimeout(ADDRESSES_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchFlowPairsByAddress: async (
        id: string,
        options?: RequestOptions,
    ): Promise<FlowPairResponse[]> => {
        const { data } = await fetchWithTimeout(getFlowsPairsByAddressPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchProcessesByAddresses: async (
        id: string,
        options?: RequestOptions,
    ): Promise<ProcessResponse[]> => {
        const { data } = await fetchWithTimeout(getProcessesByAddressPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchConnectorsByAddresses: async (
        id: string,
        options?: RequestOptions,
    ): Promise<ProcessResponse[]> => {
        const { data } = await fetchWithTimeout(getConnectorsByAddressPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // FLOW PAIRS  APIs
    fetchFlowPair: async (id: string, options?: RequestOptions): Promise<FlowPairResponse> => {
        const { data } = await fetchWithTimeout(getFlowPairPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // AGGREGATE  APIs
    fetchSitesPairs: async (options?: RequestOptions): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await fetchWithTimeout(SITE_PAIRS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchSitePairs: async (
        id: string,
        options?: RequestOptions,
    ): Promise<FlowAggregatesResponse> => {
        const { data } = await fetchWithTimeout(getSitePairPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchProcessgroupsPairs: async (
        options?: RequestOptions,
    ): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await fetchWithTimeout(PROCESS_GROUP_PAIRS_PATH, {
            params: options?.filters,
        });

        return data;
    },

    fetchProcessGroupPairs: async (
        id: string,
        options?: RequestOptions,
    ): Promise<FlowAggregatesResponse> => {
        const { data } = await fetchWithTimeout(getProcessGroupPairPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchProcessesPairs: async (options?: RequestOptions): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await fetchWithTimeout(PROCESS_PAIRS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchProcessPairs: async (
        id: string,
        options?: RequestOptions,
    ): Promise<FlowAggregatesResponse> => {
        const { data } = await fetchWithTimeout(getProcessPairPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
};

function addQueryParams({ filters, offset, limit, sortDirection, sortName }: RequestOptions) {
    return {
        ...filters,
        offset,
        limit,
        sortBy: sortName ? `${sortName}.${sortDirection || 'asc'}` : null,
    };
}
