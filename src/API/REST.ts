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
    ResponseWrapper,
} from './REST.interfaces';

export const RESTApi = {
    // SITES APIs
    fetchSites: async (options?: RequestOptions): Promise<SiteResponse[]> => {
        const { data } = await axiosFetch(SITES_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },
    fetchSite: async (id: string, options?: RequestOptions): Promise<SiteResponse> => {
        const { data } = await axiosFetch(getSitePATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },
    fetchProcessesBySite: async (
        id: string,
        options?: RequestOptions,
    ): Promise<ProcessResponse[]> => {
        const { data } = await axiosFetch(getProcessesBySitePATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },
    fetchRoutersBySite: async (id: string, options?: RequestOptions): Promise<RouterResponse[]> => {
        const { data } = await axiosFetch(getRoutersBySitePATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },
    fetchLinksBySite: async (id: string, options?: RequestOptions): Promise<LinkResponse[]> => {
        const { data } = await axiosFetch(getLinksBySitePATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },
    fetchHostsBySite: async (id: string, options?: RequestOptions): Promise<HostResponse[]> => {
        const { data } = await axiosFetch(getHostsBySitePATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    // ROUTER APIs
    fetchRouters: async (options?: RequestOptions): Promise<RouterResponse[]> => {
        const { data } = await axiosFetch(ROUTERS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },
    fetchRouter: async (id: string, options?: RequestOptions): Promise<RouterResponse> => {
        const { data } = await axiosFetch(getRouterPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    // PROCESS APIs
    fetchProcesses: async (options?: RequestOptions): Promise<ProcessResponse[]> => {
        const { data } = await axiosFetch(PROCESSES_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        const results = getResults<ProcessResponse[]>(data);

        return results
            .filter(({ name }: ProcessResponse) => !isSkupperEntity(name))
            .map((process: ProcessResponse) => ({
                ...process,
                type: getProcessType(process.name),
            }));
    },

    fetchProcess: async (id: string, options?: RequestOptions): Promise<ProcessResponse> => {
        const { data } = await axiosFetch(geProcessPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    fetchAddressesByProcess: async (
        id: string,
        options?: RequestOptions,
    ): Promise<AddressResponse[]> => {
        const { data } = await axiosFetch(getAddressesByProcessPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    // HOST APIs
    fetchHost: async (options?: RequestOptions): Promise<HostResponse[]> => {
        const { data } = await axiosFetch(HOSTS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    // PROCESS GROUPS APIs
    fetchProcessGroups: async (options?: RequestOptions): Promise<ProcessGroupResponse[]> => {
        const { data } = await axiosFetch(PROCESS_GROUPS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        //TODO remove when api provide flag to recognize internal process groups
        const results = getResults<ProcessGroupResponse[]>(data);

        return results
            .filter(({ name }: ProcessGroupResponse) => !isSkupperEntity(name))
            .map((processGroup: ProcessGroupResponse) => ({
                ...processGroup,
                type: getProcessType(processGroup.name),
            }));
    },
    fetchProcessGroup: async (
        id: string,
        options?: RequestOptions,
    ): Promise<ProcessGroupResponse> => {
        const { data } = await axiosFetch(getProcessGroupPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },
    fetchProcessesByProcessGroup: async (
        id: string,
        options?: RequestOptions,
    ): Promise<ProcessResponse[]> => {
        const { data } = await axiosFetch(getProcessesByProcessGroupPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        //TODO remove when api provide flag to recognize internal processes
        const results = getResults<ProcessResponse[]>(data);

        return results
            .filter(({ name }: ProcessResponse) => !isSkupperEntity(name))
            .map((processGroup: ProcessResponse) => ({
                ...processGroup,
                type: getProcessType(processGroup.name),
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

        return getResults(data);
    },

    // LINKS  APIs
    fetchLinks: async (options?: RequestOptions): Promise<LinkResponse[]> => {
        const { data } = await axiosFetch(`${LINKS_PATH}`, {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    fetchLink: async (id: string, options?: RequestOptions): Promise<LinkResponse> => {
        const { data } = await axiosFetch(getLinkPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    // CONNECTORS APIs
    fetchConnector: async (
        id: string,
        options?: RequestOptions,
    ): Promise<DeviceResponse | null> => {
        const { data } = await axiosFetch(getConnectorPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    // ADDRESSES APIs
    fetchAddresses: async (options?: RequestOptions): Promise<AddressResponse[]> => {
        const { data } = await axiosFetch(ADDRESSES_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    fetchFlowPairsByAddress: async (
        id: string,
        options?: RequestOptions,
    ): Promise<ResponseWrapper<FlowPairResponse[]>> => {
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

        return getResults(data);
    },

    // FLOW PAIRS  APIs
    fetchFlowPair: async (id: string, options?: RequestOptions): Promise<FlowPairResponse> => {
        const { data } = await axiosFetch(getFlowPairPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    // AGGREGATE  APIs
    fetchSitesPairs: async (options?: RequestOptions): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await axiosFetch(SITE_PAIRS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    fetchSitePairs: async (
        id: string,
        options?: RequestOptions,
    ): Promise<FlowAggregatesResponse> => {
        const { data } = await axiosFetch(getSitePairPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    fetchProcessgroupsPairs: async (
        options?: RequestOptions,
    ): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await axiosFetch(PROCESS_GROUP_PAIRS_PATH, {
            params: options?.filters,
        });

        return getResults(data);
    },

    fetchProcessGroupPairs: async (
        id: string,
        options?: RequestOptions,
    ): Promise<FlowAggregatesResponse> => {
        const { data } = await axiosFetch(getProcessGroupPairPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    fetchProcessesPairs: async (options?: RequestOptions): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await axiosFetch(PROCESS_PAIRS_PATH, {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    fetchProcessPairs: async (
        id: string,
        options?: RequestOptions,
    ): Promise<FlowAggregatesResponse> => {
        const { data } = await axiosFetch(getProcessPairPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },
};

export function getResults<T>(data: { results: T }) {
    return data.results;
}

function addQueryParams({ filters, offset, limit, sortDirection, sortName }: RequestOptions) {
    return {
        ...filters,
        offset,
        limit,
        sortBy: sortName ? `${sortName}.${sortDirection || 'asc'}` : null,
    };
}

function isSkupperEntity(name: string) {
    return name.startsWith('skupper') || name.startsWith('vanflow');
}

function getProcessType(name: string) {
    return name.startsWith('skupper-') || name.startsWith('vanflow') ? 'skupper' : 'app';
}
