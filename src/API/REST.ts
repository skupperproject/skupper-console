import { HttpStatusErrors } from '@pages/shared/Errors/errors.constants';

import { fetchWithTimeout, handleStatusError } from './axiosMiddleware';
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
    getFlowsByProcessPATH,
    getSitePATH,
    getRoutersBySitePATH,
    getLinksBySitePATH,
    getHostsBySitePATH,
    FLOW_AGGREGATES_PROCESS_PAIRS_PATH,
    ROUTERS_PATH,
    PROCESSES_PATH,
    FLOW_AGGREGATES_SITE_PAIRS_PATH,
    HOSTS_PATH,
    PROCESS_GROUPS_PATH,
    getProcessesByProcessGroupPATH,
    getProcessGroupPATH,
    FLOW_AGGREGATES_PROCESS_GROUP_PAIRS_PATH,
    getListenerPATH,
    geProcessPATH,
} from './REST.constant';
import {
    ProcessGroupResponse,
    AddressesResponse,
    DeviceResponse,
    ProcessResponse,
    FlowPairResponse,
    HTTPError,
    FlowResponse,
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

    // SERVICES APIs
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

    // FLOWS APIs
    fetchAddresses: async (): Promise<AddressesResponse[]> => {
        const { data } = await fetchWithTimeout(ADDRESSES_PATH);

        return data;
    },
    fetchFlowsSites: async (): Promise<SiteResponse[]> => {
        const { data } = await fetchWithTimeout(`${SITES_PATH}`);

        return data;
    },
    fetchFlowsSite: async (id: string): Promise<SiteResponse> => {
        const { data } = await fetchWithTimeout(getSitePATH(id));

        return data;
    },
    fetchFlowsByProcessesId: async (id: string): Promise<FlowResponse[]> => {
        const { data } = await fetchWithTimeout(getFlowsByProcessPATH(id));

        return data;
    },

    fetchFlowConnectorByProcessId: async (id: string): Promise<DeviceResponse> => {
        const { data } = await fetchWithTimeout(getConnectorByProcessPATH(id));

        return data;
    },
    fetchLinks: async (): Promise<LinkResponse[]> => {
        const { data } = await fetchWithTimeout(`${LINKS_PATH}`);

        return data;
    },
    fetchLink: async (id: string): Promise<LinkResponse> => {
        const { data } = await fetchWithTimeout(`${LINKS_PATH}/${id}`);

        return data;
    },
    fetchConnectors: async (): Promise<DeviceResponse[]> => {
        const { data } = await fetchWithTimeout(`${CONNECTORS_PATH}`);

        return data;
    },
    fetchConnector: async (id: string): Promise<DeviceResponse | null> => {
        try {
            const { data } = await fetchWithTimeout(`${CONNECTORS_PATH}/${id}`);

            return data;
        } catch (e) {
            const error = e as HTTPError;

            if (error.httpStatus === HttpStatusErrors.NotFound) {
                return null;
            }

            return handleStatusError(error);
        }
    },
    fetchFlowsListeners: async (): Promise<DeviceResponse[]> => {
        const { data } = await fetchWithTimeout(`${LISTENERS_PATH}`);

        return data;
    },
    fetchFlowsListener: async (id: string): Promise<DeviceResponse> => {
        const { data } = await fetchWithTimeout(getListenerPATH(id));

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
    fetchFlowPair: async (id: string): Promise<FlowPairResponse> => {
        const { data } = await fetchWithTimeout(`${FLOWPAIRS_PATH}/${id}`);

        return data;
    },

    // FLOWAGGREGATES APIs
    fetchFlowAggregatesSites: async (): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await fetchWithTimeout(FLOW_AGGREGATES_SITE_PAIRS_PATH);

        return data;
    },

    fetchFlowAggregatesSite: async (id: string): Promise<FlowAggregatesResponse> => {
        const { data } = await fetchWithTimeout(`${FLOW_AGGREGATES_SITE_PAIRS_PATH}/${id}`);

        return data;
    },

    fetchFlowAggregatesProcessgroups: async (): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await fetchWithTimeout(FLOW_AGGREGATES_PROCESS_GROUP_PAIRS_PATH);

        return data;
    },

    fetchFlowAggregatesProcessGroup: async (id: string): Promise<FlowAggregatesResponse> => {
        const { data } = await fetchWithTimeout(
            `${FLOW_AGGREGATES_PROCESS_GROUP_PAIRS_PATH}/${id}`,
        );

        return data;
    },

    fetchFlowAggregatesProcesses: async (): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await fetchWithTimeout(FLOW_AGGREGATES_PROCESS_PAIRS_PATH);

        return data;
    },

    fetchFlowAggregatesProcess: async (id: string): Promise<FlowAggregatesResponse> => {
        const { data } = await fetchWithTimeout(`${FLOW_AGGREGATES_PROCESS_PAIRS_PATH}/${id}`);

        return data;
    },
};
