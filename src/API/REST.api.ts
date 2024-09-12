import {
  ComponentResponse,
  ServiceResponse,
  ProcessResponse,
  FlowPairsResponse,
  SiteResponse,
  LinkResponse,
  HostResponse,
  ProcessPairsResponse,
  RemoteFilterOptions,
  ResponseWrapper,
  SitePairsResponse,
  ComponentPairsResponse,
  UserResponse
} from '@sk-types/REST.interfaces';

import { axiosFetch } from './apiMiddleware';
import {
  getSitePATH,
  getLinksBySitePATH,
  getHostsBySitePATH,
  getProcessGroupPATH,
  geProcessPATH,
  getLinkPATH,
  getFlowPairPATH,
  getSitePairPATH,
  getProcessGroupPairPATH,
  getFlowPairsPATH,
  geProcessesPATH,
  getSitesPATH,
  getLinksPATH,
  getServicesPath,
  getSitePairsPATH,
  getProcessGroupPairsPATH,
  getProcessPairsPATH,
  getProcessPairPairPATH,
  getProcessGroupsPATH,
  getProcessPairsByServicePATH,
  logout,
  getUser
} from './REST.paths';
import { mapOptionsToQueryParams, getApiResults } from './REST.utils';

export const RESTApi = {
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

  // PROCESS GROUPS APIs
  fetchProcessGroups: async (options?: RemoteFilterOptions): Promise<ResponseWrapper<ComponentResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ComponentResponse[]>>(getProcessGroupsPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  },

  fetchProcessGroup: async (id: string, options?: RemoteFilterOptions): Promise<ComponentResponse> => {
    const data = await axiosFetch<ResponseWrapper<ComponentResponse>>(getProcessGroupPATH(id), {
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

  fetchProcessGroupsPairs: async (options?: RemoteFilterOptions): Promise<ComponentPairsResponse[]> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse[]>>(getProcessGroupPairsPATH(), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return getApiResults(data);
  },

  fetchProcessGroupPairs: async (id: string, options?: RemoteFilterOptions): Promise<ComponentPairsResponse> => {
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
  },

  fetchProcessesPair: async (
    id: string,
    options?: RemoteFilterOptions
  ): Promise<ResponseWrapper<ProcessPairsResponse>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse>>(getProcessPairPairPATH(id), {
      params: options ? mapOptionsToQueryParams(options) : null
    });

    return data;
  }
};
