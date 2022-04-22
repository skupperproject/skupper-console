import { RESTApi } from '@models/API/REST';

import { getServicesExposed } from '../utils';
import { Site, SiteService, DeploymentLinks } from './services.interfaces';

export const SitesServices = {
    fetchSites: async (): Promise<Site[]> => RESTApi.fetchSites(),
    fetchServices: async (): Promise<SiteService[]> => {
        const { services, sites } = await RESTApi.fetchData();
        const servicesExposed = getServicesExposed(services, sites);

        return servicesExposed.map((deployment) => ({
            address: deployment.service.address,
            protocol: deployment.service.protocol,
            siteName: deployment.site.site_name,
            siteId: deployment.site.site_id,
        }));
    },
    fetchDeploymentLinks: async (): Promise<DeploymentLinks[]> => {
        const { deploymentLinks } = await RESTApi.fetchData();

        return deploymentLinks;
    },
};
