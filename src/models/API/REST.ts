import { DATA_URL, FLOWS, LINKS, SERVICES, SITE_URL, TARGETS } from './REST.constant';
import {
  DataResponse,
  FlowsResponse,
  LinksResponse,
  ServicesResponse,
  TargetsResponse,
} from './REST.interfaces';

function handleErrorMessage(status: number, statusText: string) {
  const message = `${status}: ${statusText}`;
  throw { httpStatus: status, message };
}

export const RESTApi = {
  fetchData: async (): Promise<DataResponse> => {
    const response = await fetch(DATA_URL);

    const data = await response.json();

    if (!response.ok) {
      handleErrorMessage(response.status, response.statusText);
    }

    return data;
  },
  fetchSite: async (): Promise<string> => {
    const response = await fetch(SITE_URL);

    const data = await response.text();
    if (!response.ok) {
      handleErrorMessage(response.status, response.statusText);
    }

    return data;
  },
  fetchLinks: async (): Promise<LinksResponse[]> => {
    const response = await fetch(LINKS);
    const data = await response.json();

    if (!response.ok) {
      handleErrorMessage(response.status, response.statusText);
    }

    return data;
  },
  fetchTargets: async (): Promise<TargetsResponse[]> => {
    const response = await fetch(TARGETS);
    const data = await response.json();

    if (!response.ok) {
      handleErrorMessage(response.status, response.statusText);
    }

    return data;
  },
  fetchServices: async (): Promise<ServicesResponse[]> => {
    const response = await fetch(SERVICES);
    const data = await response.json();

    if (!response.ok) {
      handleErrorMessage(response.status, response.statusText);
    }

    return data;
  },
  fetchFlows: async (): Promise<FlowsResponse[]> => {
    const response = await fetch(FLOWS);
    const data = await response.json();

    if (!response.ok) {
      handleErrorMessage(response.status, response.statusText);
    }

    return data;
  },
};
