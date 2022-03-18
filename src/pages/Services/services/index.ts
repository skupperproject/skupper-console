import { RESTServices } from '../../../models/services/REST';
import { ServicesData } from './services.interfaces';

export const SitesServices = {
  fetchData: async (): Promise<ServicesData> => {
    return RESTServices.fetchData();
  },
};
