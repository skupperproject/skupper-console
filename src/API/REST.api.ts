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
  RemoteFilterOptions,
  ResponseWrapper,
  CollectorsResponse,
  SitePairsResponse,
  ProcessGroupPairsResponse,
  UserResponse
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
  getProcessPairsByServicePATH,
  logout,
  getUser
} from './REST.paths';
import { mapOptionsToQueryParams, getApiResults } from './REST.utils';

export const RESTApi = {
  fetchCollectors: async (): Promise<CollectorsResponse> => {
    const data = await axiosFetch<ResponseWrapper<CollectorsResponse[]>>(getCollectors());

    return getApiResults<CollectorsResponse[]>(data)[0];
  },

  //for logout with auth basic the response return 401 but using validateStatus: () => true axios will not throw error
  fetchLogout: async (): Promise<string> => axiosFetch<string>(logout(), { validateStatus: () => true }),

  fetchUser: async (): Promise<UserResponse> => axiosFetch<UserResponse>(getUser()),

  // SITES APIs
  fetchSites: async (options?: RemoteFilterOptions): Promise<SiteResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<SiteResponse[]>>(getSitesPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchSite: async (id: string, options?: RemoteFilterOptions): Promise<SiteResponse> => {
    const data = await axiosFetch<ResponseWrapper<SiteResponse>>(getSitePATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchRoutersBySite: async (id: string, options?: RemoteFilterOptions): Promise<RouterResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<RouterResponse[]>>(getRoutersBySitePATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchLinksBySite: async (id: string, options?: RemoteFilterOptions): Promise<LinkResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<LinkResponse[]>>(getLinksBySitePATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchHostsBySite: async (id: string, options?: RemoteFilterOptions): Promise<HostResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<HostResponse[]>>(getHostsBySitePATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  // ROUTER APIs
  fetchRouters: async (options?: RemoteFilterOptions): Promise<RouterResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<RouterResponse[]>>(getRoutersPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchRouter: async (id: string, options?: RemoteFilterOptions): Promise<RouterResponse> => {
    const data = await axiosFetch<ResponseWrapper<RouterResponse>>(getRouterPATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  // PROCESS APIs
  fetchProcesses: async (options?: RemoteFilterOptions): Promise<ResponseWrapper<ProcessResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessResponse[]>>(geProcessesPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    // TODO: An edge case like the gateway process does not have a parentName
    const patchedResult = getApiResults(data).map((process) => ({
      ...process,
      parentName: process.parentName || process.hostName || process.sourceHost
    }));

    return { ...data, results: patchedResult };
  },

  fetchProcessesResult: async (options?: RemoteFilterOptions): Promise<ProcessResponse[]> => {
    const data = await RESTApi.fetchProcesses(options);

    const patchedResult = getApiResults(data).map((process) => ({
      ...process,
      parentName: process.parentName || process.hostName || process.sourceHost
    }));

    return patchedResult;
  },

  fetchProcess: async (id: string, options?: RemoteFilterOptions): Promise<ProcessResponse> => {
    const data = await axiosFetch<ResponseWrapper<ProcessResponse>>(geProcessPATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    const patchedData = getApiResults(data);

    return {
      ...patchedData,
      parentName: patchedData.parentName || patchedData.hostName || patchedData.sourceHost
    };
  },

  // HOST APIs
  fetchHosts: async (options?: RemoteFilterOptions): Promise<HostResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<HostResponse[]>>(getHostsPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  // PROCESS GROUPS APIs
  fetchProcessGroups: async (options?: RemoteFilterOptions): Promise<ResponseWrapper<ProcessGroupResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessGroupResponse[]>>(getProcessGroupsPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  },

  fetchProcessGroup: async (id: string, options?: RemoteFilterOptions): Promise<ProcessGroupResponse> => {
    const data = await axiosFetch<ResponseWrapper<ProcessGroupResponse>>(getProcessGroupPATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  // LINKS  APIs
  fetchLinks: async (options?: RemoteFilterOptions): Promise<LinkResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<LinkResponse[]>>(getLinksPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchLink: async (id: string, options?: RemoteFilterOptions): Promise<LinkResponse> => {
    const data = await axiosFetch<ResponseWrapper<LinkResponse>>(getLinkPATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  // SERVICES APIs
  fetchServices: async (options?: RemoteFilterOptions): Promise<ResponseWrapper<ServiceResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ServiceResponse[]>>(getServicesPath(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  },

  fetchFlowPairsByService: async (
    id: string,
    options?: RemoteFilterOptions
  ): Promise<ResponseWrapper<FlowPairsResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<FlowPairsResponse[]>>(getFlowsPairsByServicePATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  },

  fetchFlowPairsByServiceResults: async (id: string, options?: RemoteFilterOptions): Promise<FlowPairsResponse[]> => {
    const data = await RESTApi.fetchFlowPairsByService(id, options);

    return getApiResults(data);
  },

  fetchServersByService: async (
    id: string,
    options?: RemoteFilterOptions
  ): Promise<ResponseWrapper<ProcessResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessResponse[]>>(getProcessesByServicePATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  },

  fetchProcessPairsByService: async (
    id: string,
    options?: RemoteFilterOptions
  ): Promise<ResponseWrapper<ProcessPairsResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse[]>>(getProcessPairsByServicePATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  },

  // FLOW PAIRS  APIs
  fetchFlowPairs: async (options?: RemoteFilterOptions): Promise<ResponseWrapper<FlowPairsResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<FlowPairsResponse[]>>(getFlowPairsPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  },

  fetchFlowPair: async (id: string, options?: RemoteFilterOptions): Promise<FlowPairsResponse> => {
    const data = await axiosFetch<ResponseWrapper<FlowPairsResponse>>(getFlowPairPATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  // AGGREGATE  APIs
  fetchSitesPairs: async (options?: RemoteFilterOptions): Promise<SitePairsResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<SitePairsResponse[]>>(getSitePairsPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchSitePairs: async (id: string, options?: RemoteFilterOptions): Promise<SitePairsResponse> => {
    const data = await axiosFetch<ResponseWrapper<SitePairsResponse>>(getSitePairPATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchProcessGroupsPairs: async (options?: RemoteFilterOptions): Promise<ProcessGroupPairsResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse[]>>(getProcessGroupPairsPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchProcessGroupPairs: async (id: string, options?: RemoteFilterOptions): Promise<ProcessGroupPairsResponse> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse>>(getProcessGroupPairPATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchProcessesPairs: async (options?: RemoteFilterOptions): Promise<ResponseWrapper<ProcessPairsResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse[]>>(getProcessPairsPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  },

  fetchProcessesPairsResult: async (options?: RemoteFilterOptions): Promise<ProcessPairsResponse[]> => {
    const data = await RESTApi.fetchProcessesPairs(options);

    return getApiResults(data);
  }
};
