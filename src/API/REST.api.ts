import { axiosFetch } from './apiMiddleware';
import {
  ProcessGroupResponse,
  ServiceResponse,
  ProcessResponse,
  FlowPairsResponse,
  SiteResponse,
  LinkResponse,
  RouterResponse,
  HostResponse,
  ProcessPairsResponse,
  RequestOptions,
  ResponseWrapper,
  CollectorsResponse,
  SitePairsResponse,
  ProcessGroupPairsResponse
} from './REST.interfaces';
import {
  getFlowsPairsByServicePATH,
  getProcessesByServicePATH,
  getSitePATH,
  getRoutersBySitePATH,
  getLinksBySitePATH,
  getHostsBySitePATH,
  getProcessGroupPATH,
  geProcessPATH,
  getLinkPATH,
  getRouterPATH,
  getFlowPairPATH,
  getSitePairPATH,
  getProcessGroupPairPATH,
  getServicesByProcessPATH,
  getFlowPairsPATH,
  getRoutersPATH,
  geProcessesPATH,
  getSitesPATH,
  getLinksPATH,
  getServicesPath,
  getSitePairsPATH,
  getHostsPATH,
  getProcessGroupPairsPATH,
  getProcessPairsPATH,
  getProcessGroupsPATH,
  getCollectors,
  getProcessPairsByServicePATH
} from './REST.paths';
import { mapOptionsToQueryParams, getApiResults } from './REST.utils';

export const RESTApi = {
  fetchCollectors: async (): Promise<CollectorsResponse> => {
    const data = await axiosFetch<ResponseWrapper<CollectorsResponse[]>>(getCollectors());

    return getApiResults<CollectorsResponse[]>(data)[0];
  },

  // SITES APIs
  fetchSites: async (options?: RequestOptions): Promise<SiteResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<SiteResponse[]>>(getSitesPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchSite: async (id: string, options?: RequestOptions): Promise<SiteResponse> => {
    const data = await axiosFetch<ResponseWrapper<SiteResponse>>(getSitePATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchRoutersBySite: async (id: string, options?: RequestOptions): Promise<RouterResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<RouterResponse[]>>(getRoutersBySitePATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchLinksBySite: async (id: string, options?: RequestOptions): Promise<LinkResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<LinkResponse[]>>(getLinksBySitePATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchHostsBySite: async (id: string, options?: RequestOptions): Promise<HostResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<HostResponse[]>>(getHostsBySitePATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  // ROUTER APIs
  fetchRouters: async (options?: RequestOptions): Promise<RouterResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<RouterResponse[]>>(getRoutersPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchRouter: async (id: string, options?: RequestOptions): Promise<RouterResponse> => {
    const data = await axiosFetch<ResponseWrapper<RouterResponse>>(getRouterPATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  // PROCESS APIs
  fetchProcesses: async (options?: RequestOptions): Promise<ResponseWrapper<ProcessResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessResponse[]>>(geProcessesPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  },

  fetchProcessesResult: async (options?: RequestOptions): Promise<ProcessResponse[]> => {
    const data = await RESTApi.fetchProcesses(options);

    return getApiResults(data);
  },

  fetchProcess: async (id: string, options?: RequestOptions): Promise<ProcessResponse> => {
    const data = await axiosFetch<ResponseWrapper<ProcessResponse>>(geProcessPATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchServicesByProcess: async (id: string, options?: RequestOptions): Promise<ServiceResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<ServiceResponse[]>>(getServicesByProcessPATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  // HOST APIs
  fetchHosts: async (options?: RequestOptions): Promise<HostResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<HostResponse[]>>(getHostsPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  // PROCESS GROUPS APIs
  fetchProcessGroups: async (options?: RequestOptions): Promise<ResponseWrapper<ProcessGroupResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessGroupResponse[]>>(getProcessGroupsPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  },

  fetchProcessGroup: async (id: string, options?: RequestOptions): Promise<ProcessGroupResponse> => {
    const data = await axiosFetch<ResponseWrapper<ProcessGroupResponse>>(getProcessGroupPATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  // LINKS  APIs
  fetchLinks: async (options?: RequestOptions): Promise<LinkResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<LinkResponse[]>>(getLinksPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchLink: async (id: string, options?: RequestOptions): Promise<LinkResponse> => {
    const data = await axiosFetch<ResponseWrapper<LinkResponse>>(getLinkPATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  // SERVICES APIs
  fetchServices: async (options?: RequestOptions): Promise<ResponseWrapper<ServiceResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ServiceResponse[]>>(getServicesPath(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  },

  fetchFlowPairsByService: async (
    id: string,
    options?: RequestOptions
  ): Promise<ResponseWrapper<FlowPairsResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<FlowPairsResponse[]>>(getFlowsPairsByServicePATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  },

  fetchFlowPairsByServiceResults: async (id: string, options?: RequestOptions): Promise<FlowPairsResponse[]> => {
    const data = await RESTApi.fetchFlowPairsByService(id, options);

    return getApiResults(data);
  },

  fetchServersByService: async (id: string, options?: RequestOptions): Promise<ResponseWrapper<ProcessResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessResponse[]>>(getProcessesByServicePATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  },

  fetchProcessPairsByService: async (
    id: string,
    options?: RequestOptions
  ): Promise<ResponseWrapper<ProcessPairsResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse[]>>(getProcessPairsByServicePATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  },

  // FLOW PAIRS  APIs
  fetchFlowPairs: async (options?: RequestOptions): Promise<ResponseWrapper<FlowPairsResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<FlowPairsResponse[]>>(getFlowPairsPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  },

  fetchFlowPair: async (id: string, options?: RequestOptions): Promise<FlowPairsResponse> => {
    const data = await axiosFetch<ResponseWrapper<FlowPairsResponse>>(getFlowPairPATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  // AGGREGATE  APIs
  fetchSitesPairs: async (options?: RequestOptions): Promise<SitePairsResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<SitePairsResponse[]>>(getSitePairsPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchSitePairs: async (id: string, options?: RequestOptions): Promise<SitePairsResponse> => {
    const data = await axiosFetch<ResponseWrapper<SitePairsResponse>>(getSitePairPATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchProcessGroupsPairs: async (options?: RequestOptions): Promise<ProcessGroupPairsResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse[]>>(getProcessGroupPairsPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchProcessGroupPairs: async (id: string, options?: RequestOptions): Promise<ProcessGroupPairsResponse> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse>>(getProcessGroupPairPATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchProcessesPairs: async (options?: RequestOptions): Promise<ResponseWrapper<ProcessPairsResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse[]>>(getProcessPairsPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  },

  fetchProcessesPairsResult: async (options?: RequestOptions): Promise<ProcessPairsResponse[]> => {
    const data = await RESTApi.fetchProcessesPairs(options);

    return getApiResults(data);
  }
};
