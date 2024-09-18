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
  SitePairsResponse,
  ComponentPairsResponse,
  UserResponse
} from '@sk-types/REST.interfaces';

import { axiosFetch } from './apiMiddleware';
import {
  getSitePATH,
  getComponentPATH,
  geProcessPATH,
  getLinkPATH,
  getBiFlowPATH,
  getSitePairPATH,
  getComponentPairPATH,
  getBiFLowsPATH,
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
  getServicePATH
} from './REST.paths';
import { mapQueryFiltersToQueryParams } from './REST.utils';

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
    const data = await axiosFetch<ResponseWrapper<RouterLinkResponse[]>>(getLinksPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchLink: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<RouterLinkResponse>> => {
    const data = await axiosFetch<ResponseWrapper<RouterLinkResponse>>(getLinkPATH(id), {
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

    return data;
  },

  // FLOW PAIRS  APIs
  fetchBiFlows: async (options?: QueryFilters): Promise<ResponseWrapper<BiFlowResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<BiFlowResponse[]>>(getBiFLowsPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchBiFlow: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<BiFlowResponse>> => {
    const data = await axiosFetch<ResponseWrapper<BiFlowResponse>>(getBiFlowPATH(id), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  // AGGREGATE  APIs
  fetchSitesPairs: async (options?: QueryFilters): Promise<ResponseWrapper<SitePairsResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<SitePairsResponse[]>>(getSitePairsPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchSitePairs: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<SitePairsResponse>> => {
    const data = await axiosFetch<ResponseWrapper<SitePairsResponse>>(getSitePairPATH(id), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchComponentsPairs: async (options?: QueryFilters): Promise<ResponseWrapper<ComponentPairsResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse[]>>(getComponentsPairsPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchComponentPairs: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<ComponentPairsResponse>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse>>(getComponentPairPATH(id), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchProcessesPairs: async (options?: QueryFilters): Promise<ResponseWrapper<ProcessPairsResponse[]>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse[]>>(getProcessPairsPATH(), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  },

  fetchProcessesPair: async (id: string, options?: QueryFilters): Promise<ResponseWrapper<ProcessPairsResponse>> => {
    const data = await axiosFetch<ResponseWrapper<ProcessPairsResponse>>(getProcessPairPairPATH(id), {
      params: options ? mapQueryFiltersToQueryParams(options) : null
    });

    return data;
  }
};
