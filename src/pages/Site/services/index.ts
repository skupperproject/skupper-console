import { RESTServices } from '@models/services/REST';

import { getServicesDeployed } from '../utils';
import { OverviewData } from './services.interfaces';

export const SitesServices = {
  fetchOverview: async (): Promise<OverviewData> => {
    const { data, siteInfo } = await RESTServices.fetchData();
    const deployments = getServicesDeployed(data.services as any, data.sites);

    return {
      site: { id: siteInfo.siteId, name: siteInfo.siteName },
      sites: data.sites,
      services: deployments.map((deployment) => ({
        address: deployment.service.address,
        protocol: deployment.service.protocol,
        siteName: deployment.site.site_name,
        siteId: deployment.site.site_id,
      })),
    };
  },
};
