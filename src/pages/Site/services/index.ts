import { RESTServices } from '../../../models/services/REST';
import { SiteData } from './services.interfaces';

export const SitesServices = {
  fetchData: async (): Promise<SiteData> => {
    const data = await RESTServices.fetchData();

    return data.data.sites[0];
  },
};
