import { RESTServices } from '../../../models/services/REST';
import { SitesData } from './services.interfaces';

export const SitesServices = {
  fetchData: async (): Promise<SitesData> => {
    return RESTServices.fetchData();
  },
};
