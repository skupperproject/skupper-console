import { axiosFetch } from './apiMiddleware';
import {
  getSitePATH,
  getComponentPATH,
  geProcessPATH,
  getLinkPATH,
  getTransportFlow,
  getSitePairPATH,
  getComponentPairPATH,
  getTransportFlowsPATH,
  geProcessesPATH,
  getSitesPATH,
  getLinksPATH,
  getServicesPATH,
  getSitePairsPATH,
  getComponentsPairsPATH,
  getProcessPairsPATH,
  getProcessPairPairPATH,
  getComponentsPATH,
  getProcessPairsByServicePATH,
  logout,
  getUser,
  getServicePATH,
  getApplicationFlowPATH,
  getApplicationFlowsPATH,
  getConnectorsPATH,
  getListenersPATH
} from './REST.paths';
import { aggregateDistinctPairs, mapQueryFiltersToQueryParams } from './REST.utils';
import {
  ComponentResponse,
  ServiceResponse,
  ProcessResponse,
  BiFlowResponse,
  SiteResponse,
  RouterLinkResponse,
  ProcessPairsResponse,
  QueryFilters,
  ResponseWrapper,
  PairsResponse,
  UserResponse,
  ApplicationFlowResponse,
  ListenerResponse,
  ConnectorResponse,
  TransportFlowResponse
} from '../types/REST.interfaces';

export const RESTApi = {
  //for logout with auth basic the response return 401 but using validateStatus: () => true axios will not throw error
  fetchLogout: async (): Promise<string> => axiosFetch<string>(logout(), { validateStatus: () => true }),

  fetchUser: async (): Promise<UserResponse> => axiosFetch<UserResponse>(getUser()),

  // SITES APIs
  fetchSites: async (options?: QueryFilters): Promise<ResponseWrapper<SiteResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<SiteResponse[]>>(getSitesPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchSite: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<SiteResponse>> => {
    const data = await axiosFetch<ResponseWrapper<SiteResponse>>(getSitePATH(id), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  // PROCESS APIs
  fetchProcesses: async (options?: QueryFilters): Promise<ResponseWrapper<ProcessResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessResponse[]>>(geProcessesPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchProcess: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<ProcessResponse>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessResponse>>(geProcessPATH(id), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  // PROCESS GROUPS APIs
  fetchComponents: async (options?: QueryFilters): Promise<ResponseWrapper<ComponentResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ComponentResponse[]>>(getComponentsPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchComponent: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<ComponentResponse>> => {
    const data = await axiosFetch<ResponseWrapper<ComponentResponse>>(getComponentPATH(id), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  // LINKS  APIs
  fetchLinks: async (options?: QueryFilters): Promise<ResponseWrapper<RouterLinkResponse[]>> => {
    //TODO: this is a temporary path
    const removeInvalidAndDuplicatesRouterLinks = (results: RouterLinkResponse[]): RouterLinkResponse[] =>
      // remove links in the smae site: case High Availability (HA)
      results.filter(({ sourceSiteId, destinationSiteId }) => destinationSiteId && sourceSiteId !== destinationSiteId);

    const aggregateLinksBySite = (linksData: RouterLinkResponse[]): RouterLinkResponse[] =>
      linksData.length === 0
        ? []
        : Object.values(
            linksData.reduce(
              (acc, link) => {
                const key = `${link.sourceSiteId}-${link.destinationSiteId}`;
                acc[key] = acc[key] || [];
                acc[key].push(link);

                return acc;
              },
              {} as { [key: string]: RouterLinkResponse[] }
            )
          ).map((links) => {
            const referenceLink = { ...links[0] };
            const allStatuses = links.map(({ status }) => status);
            referenceLink.status = allStatuses.every((s) => s === 'up')
              ? 'up'
              : allStatuses.every((s) => s === 'down')
                ? 'down'
                : 'partially_up';

            return referenceLink;
          });
    const data = await axiosFetch<ResponseWrapper<RouterLinkResponse[]>>(getLinksPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return { ...data, results: removeInvalidAndDuplicatesRouterLinks(aggregateLinksBySite(data.results)) };
  },

  fetchLink: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<RouterLinkResponse>> => {
    const data = await axiosFetch<ResponseWrapper<RouterLinkResponse>>(getLinkPATH(id), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  // LISTENERS AND CONNECTORS
  fetchListeners: async (options?: QueryFilters): Promise<ResponseWrapper<ListenerResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ListenerResponse[]>>(getListenersPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchConnectors: async (options?: QueryFilters): Promise<ResponseWrapper<ConnectorResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ConnectorResponse[]>>(getConnectorsPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  // SERVICES APIs
  fetchServices: async (options?: QueryFilters): Promise<ResponseWrapper<ServiceResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ServiceResponse[]>>(getServicesPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchService: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<ServiceResponse>> => {
    const data = await axiosFetch<ResponseWrapper<ServiceResponse>>(getServicePATH(id), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchProcessPairsByService: async (
    id: string,
    options?: QueryFilters
  ): Promise<ResponseWrapper<ProcessPairsResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse[]>>(getProcessPairsByServicePATH(id), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return { ...data, results: aggregateDistinctPairs(data.results) };
  },

  // BIFLOW APIs
  fetchTransportFlows: async (options?: QueryFilters): Promise<ResponseWrapper<TransportFlowResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<TransportFlowResponse[]>>(getTransportFlowsPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchTransportFlow: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<BiFlowResponse>> => {
    const data = await axiosFetch<ResponseWrapper<BiFlowResponse>>(getTransportFlow(id), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchApplicationFlows: async (options?: QueryFilters): Promise<ResponseWrapper<ApplicationFlowResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ApplicationFlowResponse[]>>(getApplicationFlowsPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchApplicationFlow: async (
    id: string,
    options?: QueryFilters
  ): Promise<ResponseWrapper<ApplicationFlowResponse>> => {
    const data = await axiosFetch<ResponseWrapper<ApplicationFlowResponse>>(getApplicationFlowPATH(id), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  // AGGREGATE  APIs
  fetchSitesPairs: async (options?: QueryFilters): Promise<ResponseWrapper<PairsResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<PairsResponse[]>>(getSitePairsPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return { ...data, results: aggregateDistinctPairs(data.results) };
  },

  fetchSitePairs: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<PairsResponse>> => {
    const data = await axiosFetch<ResponseWrapper<PairsResponse>>(getSitePairPATH(id), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchComponentsPairs: async (options?: QueryFilters): Promise<ResponseWrapper<PairsResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse[]>>(getComponentsPairsPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return { ...data, results: aggregateDistinctPairs(data.results) };
  },

  fetchComponentPairs: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<PairsResponse>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse>>(getComponentPairPATH(id), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchProcessesPairs: async (options?: QueryFilters): Promise<ResponseWrapper<ProcessPairsResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse[]>>(getProcessPairsPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return { ...data, results: aggregateDistinctPairs(data.results) as ProcessPairsResponse[] };
  },

  fetchProcessesPair: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<ProcessPairsResponse>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse>>(getProcessPairPairPATH(id), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  }
};
