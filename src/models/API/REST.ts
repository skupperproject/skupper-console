import { fetchWithTimeout } from './Middleware';
import { DATA_URL, FLOWS, LINKS, SITE_URL, SERVICES, TARGETS } from './REST.constant';
import {
  DataResponse,
  FlowsResponse,
  LinksResponse,
  ServicesResponse,
  TargetsResponse,
} from './REST.interfaces';

export const RESTApi = {
  fetchData: async (): Promise<DataResponse> => {
    const { data } = await fetchWithTimeout(DATA_URL);

    return data;
  },
  fetchSite: async (): Promise<string> => {
    const { data } = await fetchWithTimeout(SITE_URL);

    return data;
  },
  fetchLinks: async (): Promise<LinksResponse[]> => {
    const { data } = await fetchWithTimeout(LINKS);

    return data;
  },
  fetchTargets: async (): Promise<TargetsResponse[]> => {
    const { data } = await fetchWithTimeout(TARGETS);

    return data;
  },
  fetchServices: async (): Promise<ServicesResponse[]> => {
    const { data } = await fetchWithTimeout(SERVICES);

    return data;
  },
  fetchFlows: async (): Promise<FlowsResponse[]> => {
    const { data } = await fetchWithTimeout(FLOWS);

    return data;
  },
  fetchVANAddresses: async (): Promise<FlowsResponse[]> => {
    const { data } = await fetchWithTimeout(FLOWS);

    return data;
  },
};
