import { RESTApi } from '../API/REST';
import Adapter from './adapter';
import { DataVAN } from './REST.interfaces';

export const RESTServices = {
  fetchData: async (): Promise<DataVAN> => {
    const [dataVAN] = await Promise.all([
      RESTApi.fetchData(),
      RESTApi.fetchSite(),
      RESTApi.fetchLinks(),
      RESTApi.fetchTargets(),
      RESTApi.fetchServices(),
    ]);
    const data: DataVAN = new Adapter(dataVAN).getData();

    return data;
  },
};
