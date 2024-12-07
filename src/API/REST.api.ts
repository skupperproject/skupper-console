import { axiosFetch, fetchWithParams } from './apiMiddleware';
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
import { aggregateDistinctPairs, aggregateLinksBySite } from './REST.utils';
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
  fetchLogout: async (): Promise<string> => axiosFetch(logout(), { validateStatus: () => true }),

  fetchUser: async (): Promise<UserResponse> => axiosFetch(getUser()),

  // SITES APIs
  fetchSites: async (options?: QueryFilters): Promise<ResponseWrapper<SiteResponse[]>> =>
    fetchWithParams<SiteResponse[]>(getSitesPATH(), options),

  fetchSite: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<SiteResponse>> =>
    fetchWithParams<SiteResponse>(getSitePATH(id), options),

  // PROCESS APIs
  fetchProcesses: async (options?: QueryFilters): Promise<ResponseWrapper<ProcessResponse[]>> =>
    fetchWithParams(geProcessesPATH(), options),

  fetchProcess: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<ProcessResponse>> =>
    fetchWithParams(geProcessPATH(id), options),

  // COMPONENTS APIs
  fetchComponents: async (options?: QueryFilters): Promise<ResponseWrapper<ComponentResponse[]>> =>
    fetchWithParams<ComponentResponse[]>(getComponentsPATH(), options),

  fetchComponent: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<ComponentResponse>> =>
    fetchWithParams<ComponentResponse>(getComponentPATH(id), options),

  // LINKS APIs
  fetchLinks: async (options?: QueryFilters): Promise<ResponseWrapper<RouterLinkResponse[]>> => {
    const removeInvalidAndDuplicatesRouterLinks = (results: RouterLinkResponse[]): RouterLinkResponse[] =>
      results.filter(({ sourceSiteId, destinationSiteId }) => destinationSiteId && sourceSiteId !== destinationSiteId);

    const data = await fetchWithParams<RouterLinkResponse[]>(getLinksPATH(), options);

    return { ...data, results: removeInvalidAndDuplicatesRouterLinks(aggregateLinksBySite(data.results)) };
  },

  fetchLink: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<RouterLinkResponse>> =>
    fetchWithParams<RouterLinkResponse>(getLinkPATH(id), options),

  // LISTENERS AND CONNECTORS
  fetchListeners: async (options?: QueryFilters): Promise<ResponseWrapper<ListenerResponse[]>> =>
    fetchWithParams<ListenerResponse[]>(getListenersPATH(), options),

  fetchConnectors: async (options?: QueryFilters): Promise<ResponseWrapper<ConnectorResponse[]>> =>
    fetchWithParams<ConnectorResponse[]>(getConnectorsPATH(), options),

  // SERVICES APIs
  fetchServices: async (options?: QueryFilters): Promise<ResponseWrapper<ServiceResponse[]>> =>
    fetchWithParams<ServiceResponse[]>(getServicesPATH(), options),

  fetchService: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<ServiceResponse>> =>
    fetchWithParams<ServiceResponse>(getServicePATH(id), options),

  fetchProcessPairsByService: async (
    id: string,
    options?: QueryFilters
  ): Promise<ResponseWrapper<ProcessPairsResponse[]>> => {
    const data = await fetchWithParams<ProcessPairsResponse[]>(getProcessPairsByServicePATH(id), options);

    return { ...data, results: aggregateDistinctPairs(data.results) };
  },

  // BIFLOW APIs
  fetchTransportFlows: async (options?: QueryFilters): Promise<ResponseWrapper<TransportFlowResponse[]>> =>
    fetchWithParams<TransportFlowResponse[]>(getTransportFlowsPATH(), options),

  fetchTransportFlow: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<BiFlowResponse>> =>
    fetchWithParams<BiFlowResponse>(getTransportFlow(id), options),

  fetchApplicationFlows: async (options?: QueryFilters): Promise<ResponseWrapper<ApplicationFlowResponse[]>> =>
    fetchWithParams<ApplicationFlowResponse[]>(getApplicationFlowsPATH(), options),

  fetchApplicationFlow: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<ApplicationFlowResponse>> =>
    fetchWithParams<ApplicationFlowResponse>(getApplicationFlowPATH(id), options),

  // AGGREGATE APIs
  fetchSitesPairs: async (options?: QueryFilters): Promise<ResponseWrapper<PairsResponse[]>> => {
    const data = await fetchWithParams<PairsResponse[]>(getSitePairsPATH(), options);

    return { ...data, results: aggregateDistinctPairs(data.results) };
  },

  fetchSitePairs: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<PairsResponse>> =>
    fetchWithParams<PairsResponse>(getSitePairPATH(id), options),

  fetchComponentsPairs: async (options?: QueryFilters): Promise<ResponseWrapper<PairsResponse[]>> => {
    const data = await fetchWithParams<PairsResponse[]>(getComponentsPairsPATH(), options);

    return { ...data, results: aggregateDistinctPairs(data.results) };
  },

  fetchComponentPairs: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<PairsResponse>> =>
    fetchWithParams<ProcessPairsResponse>(getComponentPairPATH(id), options),

  fetchProcessesPairs: async (options?: QueryFilters): Promise<ResponseWrapper<ProcessPairsResponse[]>> => {
    const data = await fetchWithParams<ProcessPairsResponse[]>(getProcessPairsPATH(), options);

    return { ...data, results: aggregateDistinctPairs(data.results) as ProcessPairsResponse[] };
  },

  fetchProcessesPair: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<ProcessPairsResponse>> =>
    fetchWithParams<ProcessPairsResponse>(getProcessPairPairPATH(id), options)
};
