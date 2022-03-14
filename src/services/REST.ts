import RESTApi from '../API/REST';
import { Data } from './REST.interfaces';

export const RESTServices = {
  fetchData: async (): Promise<Data> => {
    return RESTApi.fetchData();
  },
};
