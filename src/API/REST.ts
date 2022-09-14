import { HttpStatusErrors } from '@pages/shared/Errors/errors.constants';

import { fetchWithTimeout, handleStatusError } from './axiosMiddleware';
import { getFlowsTopology, getServices, getSites } from './controllers';
import {
    DATA_URL,
    FLOWS_CONNECTORS,
    FLOWS_LINKS,
    FLOWS_LISTENERS,
    SITES_PATH,
    FLOWS_VAN_ADDRESSES,
    FLOWPAIRS,
    getFlowsPairsByVanAddressIdPATH,
    getProcessesBySitePATH,
    getProcessesByVanAddressIdPATH,
    getConnectorByProcessIdPATH,
    getFlowsByProcessIdPATH,
    getSitePATH,
    getRoutersBySitePATH,
    getLinksBySitePATH,
    getHostsBySitePATH,
    FLOW_AGGREGATES_PROCESSES,
    ROUTERS_PATH,
    PROCESSES_PATH,
    FLOW_AGGREGATES_SITES,
    HOSTS_PATH,
} from './REST.constant';
import {
    ServiceResponse,
    SiteDataResponse,
    FlowsVanAddressesResponse,
    FlowsTopologyResponse,
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
    fetchDATASites: async (): Promise<SiteDataResponse[]> => {
        const { data } = await fetchWithTimeout(DATA_URL);

        return getSites(data);
    },

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
        const { data } = await fetchWithTimeout(`${PROCESSES_PATH}/${id}`);

        return data;
    },

    // HOST APIs
    fetchHost: async (): Promise<HostResponse[]> => {
        const { data } = await fetchWithTimeout(`${HOSTS_PATH}`);

        return data;
    },

    // SERVICES APIs
    fetchServices: async (): Promise<ServiceResponse[]> => {
        const { data } = await fetchWithTimeout(DATA_URL);

        return getServices(data);
    },

    // FLOWS APIs
    fetchVanAddresses: async (): Promise<FlowsVanAddressesResponse[]> => {
        const { data } = await fetchWithTimeout(FLOWS_VAN_ADDRESSES);

        return data;
    },
    fetchFlowsSites: async (): Promise<SiteResponse[]> => {
        const { data } = await fetchWithTimeout(`${SITES_PATH}`);

        return data;
    },
    fetchFlowsSite: async (id: string): Promise<SiteResponse> => {
        const { data } = await fetchWithTimeout(`${SITES_PATH}/${id}`);

        return data;
    },
    fetchFlowsByProcessesId: async (id: string): Promise<FlowResponse[]> => {
        const { data } = await fetchWithTimeout(getFlowsByProcessIdPATH(id));

        return data;
    },

    fetchFlowConnectorByProcessId: async (id: string): Promise<DeviceResponse> => {
        const { data } = await fetchWithTimeout(getConnectorByProcessIdPATH(id));

        return data;
    },
    fetchFlowsLinks: async (): Promise<DeviceResponse[]> => {
        const { data } = await fetchWithTimeout(`${FLOWS_LINKS}`);

        return data;
    },
    fetchFlowsLink: async (id: string): Promise<DeviceResponse> => {
        const { data } = await fetchWithTimeout(`${FLOWS_LINKS}/${id}`);

        return data;
    },
    fetchFlowsConnectors: async (): Promise<DeviceResponse[]> => {
        const { data } = await fetchWithTimeout(`${FLOWS_CONNECTORS}`);

        return data;
    },
    fetchFlowsConnector: async (id: string): Promise<DeviceResponse | null> => {
        try {
            const { data } = await fetchWithTimeout(`${FLOWS_CONNECTORS}/${id}`);

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
        const { data } = await fetchWithTimeout(`${FLOWS_LISTENERS}`);

        return data;
    },
    fetchFlowsListener: async (id: string): Promise<DeviceResponse> => {
        const { data } = await fetchWithTimeout(`${FLOWS_LISTENERS}/${id}`);

        return data;
    },
    fetchFlowsPairsByVanAddr: async (id: string): Promise<FlowPairResponse[]> => {
        const { data } = await fetchWithTimeout(getFlowsPairsByVanAddressIdPATH(id));

        return data;
    },
    fetchProcessesByVanAddr: async (id: string): Promise<ProcessResponse[]> => {
        const { data } = await fetchWithTimeout(getProcessesByVanAddressIdPATH(id));

        return data;
    },
    fetchFlowPair: async (id: string): Promise<FlowPairResponse> => {
        const { data } = await fetchWithTimeout(`${FLOWPAIRS}/${id}`);

        return data;
    },
    fetchFlowsTopology: async (): Promise<FlowsTopologyResponse> => {
        const { data: sites } = await fetchWithTimeout(`${SITES_PATH}`);
        const { data: routers } = await fetchWithTimeout(`${ROUTERS_PATH}`);
        const { data: links } = await fetchWithTimeout(`${FLOWS_LINKS}`);

        const sitesMap = (sites as SiteResponse[]).reduce((acc, site) => {
            acc[site.identity] = site;

            return acc;
        }, {} as Record<string, SiteResponse>);

        const routersExtended = (routers as RouterResponse[]).map((router) => ({
            ...router,
            siteName: sitesMap[router.parent].name,
        }));

        return getFlowsTopology(routersExtended, links);
    },

    // FLOWAGGREGATES APIs
    fetchFlowAggregatesSites: async (): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await fetchWithTimeout(FLOW_AGGREGATES_SITES);

        return data;
    },

    fetchFlowAggregatesSite: async (id: string): Promise<FlowAggregatesResponse> => {
        const { data } = await fetchWithTimeout(`${FLOW_AGGREGATES_SITES}/${id}`);

        return data;
    },

    fetchFlowAggregatesProcesses: async (): Promise<FlowAggregatesMapResponse[]> => {
        const { data } = await fetchWithTimeout(FLOW_AGGREGATES_PROCESSES);

        return data;
    },

    fetchFlowAggregatesProcess: async (id: string): Promise<FlowAggregatesResponse> => {
        const { data } = await fetchWithTimeout(`${FLOW_AGGREGATES_PROCESSES}/${id}`);

        return data;
    },
};
