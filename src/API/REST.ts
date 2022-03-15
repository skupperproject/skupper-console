import { DATA_URL, SITE_URL } from './REST.constant';
import { DataResponse } from './REST.interfaces';

export const RESTApi = {
  fetchData: async (): Promise<DataResponse> => {
    const response = await fetch(DATA_URL);

    const data = await response.json();

    if (!response.ok) {
      const message = `${response.status}: ${response.statusText}`;
      throw { httpStatus: response.status, message };
    }

    return data;
  },
  getSiteId: async (): Promise<any> => {
    const response = await fetch(SITE_URL);

    const data = await response.json();

    if (!response.ok) {
      const message = `${response.status}: ${response.statusText}`;
      throw { httpStatus: response.status, message };
    }

    return data;
  },
};
