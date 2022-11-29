import { axiosFetch } from './axiosMiddleware';
import {
    LINKS_PATH,
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
    geProcessPATH,
    getConnectorsByAddressPATH,
    getLinkPATH,
    getConnectorPATH,
    getRouterPATH,
    getFlowPairPATH,
    getSitePairPATH,
    getProcessGroupPairPATH,
    getProcessPairPATH,
    getAddressesByProcessPATH,
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
        const { data } = await axiosFetch(SITES_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchSite: async (id: string, options?: RequestOptions): Promise<SiteResponse> => {
        const { data } = await axiosFetch(getSitePATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchProcessesBySite: async (
        id: string,
        options?: RequestOptions,
    ): Promise<ProcessResponse[]> => {
        const { data } = await axiosFetch(getProcessesBySitePATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchRoutersBySite: async (id: string, options?: RequestOptions): Promise<RouterResponse[]> => {
        const { data } = await axiosFetch(getRoutersBySitePATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchLinksBySite: async (id: string, options?: RequestOptions): Promise<LinkResponse[]> => {
        const { data } = await axiosFetch(getLinksBySitePATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchHostsBySite: async (id: string, options?: RequestOptions): Promise<HostResponse[]> => {
        const { data } = await axiosFetch(getHostsBySitePATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // ROUTER APIs
    fetchRouters: async (options?: RequestOptions): Promise<RouterResponse[]> => {
        const { data } = await axiosFetch(ROUTERS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchRouter: async (id: string, options?: RequestOptions): Promise<RouterResponse> => {
        const { data } = await axiosFetch(getRouterPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // PROCESS APIs
    fetchProcesses: async (options?: RequestOptions): Promise<ProcessResponse[]> => {
        const { data } = await axiosFetch(PROCESSES_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data
            .filter(({ name }: ProcessResponse) => !name.startsWith('skupper-'))
            .map((process: ProcessResponse) => ({
                ...process,
                type: process.name.startsWith('skupper-') ? 'skupper' : 'app',
            }));
    },

    fetchProcess: async (id: string, options?: RequestOptions): Promise<ProcessResponse> => {
        const { data } = await axiosFetch(geProcessPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchAddressesByProcess: async (
        id: string,
        options?: RequestOptions,
    ): Promise<AddressResponse[]> => {
        const { data } = await axiosFetch(getAddressesByProcessPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // HOST APIs
    fetchHost: async (options?: RequestOptions): Promise<HostResponse[]> => {
        const { data } = await axiosFetch(HOSTS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // PROCESS GROUPS APIs
    fetchProcessGroups: async (options?: RequestOptions): Promise<ProcessGroupResponse[]> => {
        const { data } = await axiosFetch(PROCESS_GROUPS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        //TODO remove when api provide flag to recognize internal process groups
        return data
            .filter(({ name }: ProcessGroupResponse) => !name.startsWith('skupper-'))
            .map((processGroup: ProcessGroupResponse) => ({
                ...processGroup,
                type: processGroup.name.startsWith('skupper-') ? 'skupper' : 'app',
            }));
    },
    fetchProcessGroup: async (
        id: string,
        options?: RequestOptions,
    ): Promise<ProcessGroupResponse> => {
        const { data } = await axiosFetch(getProcessGroupPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchProcessesByProcessGroup: async (
        id: string,
        options?: RequestOptions,
    ): Promise<ProcessResponse[]> => {
        const { data } = await axiosFetch(getProcessesByProcessGroupPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        //TODO remove when api provide flag to recognize internal processes
        return data
            .filter(({ name }: ProcessResponse) => !name.startsWith('skupper-'))
            .map((processGroup: ProcessResponse) => ({
                ...processGroup,
                type: processGroup.name.startsWith('skupper-') ? 'skupper' : 'app',
            }));
    },

    // PROCESSES  APIs
    fetchConnectorByProcess: async (
        id: string,
        options?: RequestOptions,
    ): Promise<DeviceResponse> => {
        const { data } = await axiosFetch(getConnectorByProcessPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // LINKS  APIs
    fetchLinks: async (options?: RequestOptions): Promise<LinkResponse[]> => {
        const { data } = await axiosFetch(`${LINKS_PATH}`, {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchLink: async (id: string, options?: RequestOptions): Promise<LinkResponse> => {
        const { data } = await axiosFetch(getLinkPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // CONNECTORS  APIs
    fetchConnector: async (
        id: string,
        options?: RequestOptions,
    ): Promise<DeviceResponse | null> => {
        const { data } = await axiosFetch(getConnectorPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // ADDRESSES  APIs
    fetchAddresses: async (options?: RequestOptions): Promise<AddressResponse[]> => {
        const { data } = await axiosFetch(ADDRESSES_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },
    fetchFlowPairsByAddress: async (
        id: string,
        options?: RequestOptions,
    ): Promise<FlowPairResponse[]> => {
        const { data } = await axiosFetch(getFlowsPairsByAddressPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchServersByAddress: async (
        id: string,
        options?: RequestOptions,
    ): Promise<ProcessResponse[]> => {
        const { data } = await axiosFetch(getProcessesByAddressPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchConnectorsByAddresses: async (
        id: string,
        options?: RequestOptions,
    ): Promise<ProcessResponse[]> => {
        const { data } = await axiosFetch(getConnectorsByAddressPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // FLOW PAIRS  APIs
    fetchFlowPair: async (id: string, options?: RequestOptions): Promise<FlowPairResponse> => {
        const { data } = await axiosFetch(getFlowPairPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // AGGREGATE  APIs
    fetchSitesPairs: async (options?: RequestOptions): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await axiosFetch(SITE_PAIRS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchSitePairs: async (
        id: string,
        options?: RequestOptions,
    ): Promise<FlowAggregatesResponse> => {
        const { data } = await axiosFetch(getSitePairPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchProcessgroupsPairs: async (
        options?: RequestOptions,
    ): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await axiosFetch(PROCESS_GROUP_PAIRS_PATH, {
            params: options?.filters,
        });

        return data;
    },

    fetchProcessGroupPairs: async (
        id: string,
        options?: RequestOptions,
    ): Promise<FlowAggregatesResponse> => {
        const { data } = await axiosFetch(getProcessGroupPairPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchProcessesPairs: async (options?: RequestOptions): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await axiosFetch(PROCESS_PAIRS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchProcessPairs: async (
        id: string,
        options?: RequestOptions,
    ): Promise<FlowAggregatesResponse> => {
        const { data } = await axiosFetch(getProcessPairPATH(id), {
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
