import { axiosFetch } from './axiosMiddleware';
import {
    getFlowsPairsByAddressPATH,
    getProcessesBySitePATH,
    getProcessesByAddressPATH,
    getSitePATH,
    getRoutersBySitePATH,
    getLinksBySitePATH,
    getHostsBySitePATH,
    getProcessesByProcessGroupPATH,
    getProcessGroupPATH,
    geProcessPATH,
    getLinkPATH,
    getRouterPATH,
    getFlowPairPATH,
    getSitePairPATH,
    getProcessGroupPairPATH,
    getProcessPairPATH,
    getAddressesByProcessPATH,
    getFlowPairsPATH,
    getRoutersPATH,
    geProcessesPATH,
    getSitesPATH,
    getLinksPATH,
    getAddressesPath,
    getSitePairsPATH,
    getHostsPATH,
    getProcessGroupPairsPATH,
    getProcessPairsPATH,
    getProcessGroupsPATH,
    getConfigPrometheusPATH,
} from './REST.constant';
import {
    ProcessGroupResponse,
    AddressResponse,
    ProcessResponse,
    FlowPairsResponse,
    SiteResponse,
    LinkResponse,
    RouterResponse,
    HostResponse,
    FlowAggregatesResponse,
    RequestOptions,
    ResponseWrapper,
} from './REST.interfaces';

export const RESTApi = {
    getPrometheusUrl: async (): Promise<string> => {
        const { data } = await axiosFetch(getConfigPrometheusPATH());

        return getResults(data);
    },

    // SITES APIs
    fetchSites: async (options?: RequestOptions): Promise<SiteResponse[]> => {
        const { data } = await axiosFetch(getSitesPATH(), {
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
        const { data } = await axiosFetch(getRoutersPATH(), {
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
    fetchProcesses: async (
        options?: RequestOptions,
    ): Promise<ResponseWrapper<ProcessResponse[]>> => {
        const { data } = await axiosFetch(geProcessesPATH(), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
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
        const { data } = await axiosFetch(getHostsPATH(), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    // PROCESS GROUPS APIs
    fetchProcessGroups: async (options?: RequestOptions): Promise<ProcessGroupResponse[]> => {
        const { data } = await axiosFetch(getProcessGroupsPATH(), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults<ProcessGroupResponse[]>(data);
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

        return getResults<ProcessResponse[]>(data);
    },

    // LINKS  APIs
    fetchLinks: async (options?: RequestOptions): Promise<LinkResponse[]> => {
        const { data } = await axiosFetch(getLinksPATH(), {
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

    // ADDRESSES APIs
    fetchAddresses: async (options?: RequestOptions): Promise<AddressResponse[]> => {
        const { data } = await axiosFetch(getAddressesPath(), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    fetchFlowPairsByAddress: async (
        id: string,
        options?: RequestOptions,
    ): Promise<ResponseWrapper<FlowPairsResponse[]>> => {
        const { data } = await axiosFetch(getFlowsPairsByAddressPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchServersByAddress: async (
        id: string,
        options?: RequestOptions,
    ): Promise<ResponseWrapper<ProcessResponse[]>> => {
        const { data } = await axiosFetch(getProcessesByAddressPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    // FLOW PAIRS  APIs
    fetchFlowPairs: async (
        options?: RequestOptions,
    ): Promise<ResponseWrapper<FlowPairsResponse[]>> => {
        const { data } = await axiosFetch(getFlowPairsPATH(), {
            params: options ? addQueryParams(options) : null,
        });

        return data;
    },

    fetchFlowPair: async (id: string, options?: RequestOptions): Promise<FlowPairsResponse> => {
        const { data } = await axiosFetch(getFlowPairPATH(id), {
            params: options ? addQueryParams(options) : null,
        });

        return getResults(data);
    },

    // AGGREGATE  APIs
    fetchSitesPairs: async (options?: RequestOptions): Promise<FlowAggregatesResponse[]> => {
        const { data } = await axiosFetch(getSitePairsPATH(), {
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
    ): Promise<FlowAggregatesResponse[]> => {
        const { data } = await axiosFetch(getProcessGroupPairsPATH(), {
            params: options ? addQueryParams(options) : null,
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

    fetchProcessesPairs: async (options?: RequestOptions): Promise<FlowAggregatesResponse[]> => {
        const { data } = await axiosFetch(getProcessPairsPATH(), {
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

function addQueryParams({
    filters,
    filter,
    offset,
    limit,
    sortDirection,
    sortName,
    timeRangeEnd,
    timeRangeStart,
}: RequestOptions) {
    return {
        ...filters,
        filter,
        offset,
        limit,
        timeRangeEnd,
        timeRangeStart,
        sortBy: sortName ? `${sortName}.${sortDirection || 'asc'}` : null,
    };
}
