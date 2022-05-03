import { RESTApi } from 'API/REST';

import { Site } from './services.interfaces';

export const SitesServices = {
    fetchSites: async (): Promise<Site[]> => RESTApi.fetchSites(),
};
