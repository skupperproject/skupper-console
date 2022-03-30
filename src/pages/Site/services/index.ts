import { RESTApi } from '@models/API/REST';
import { RESTServices } from '@models/services/REST';
import { DeploymentLinks } from '@models/services/REST.interfaces';

import { getServicesExposed } from '../utils';
import { SiteData, SiteInfo, SiteServices, Token, Link } from './services.interfaces';

export const SitesServices = {
  fetchSiteId: async (): Promise<string> => {
    const siteId = await RESTApi.fetchSite();

    return siteId;
  },
  fetchDeploymentLinks: async (): Promise<DeploymentLinks[]> => {
    const { deploymentLinks } = await RESTServices.fetchData();

    return deploymentLinks;
  },
  fetchServices: async (): Promise<SiteServices[]> => {
    const { services, sites } = await RESTServices.fetchData();
    const servicesExposed = getServicesExposed(services, sites);

    return servicesExposed.map((deployment) => ({
      address: deployment.service.address,
      protocol: deployment.service.protocol,
      siteName: deployment.site.site_name,
      siteId: deployment.site.site_id,
    }));
  },
  fetchSites: async (): Promise<SiteData[]> => {
    const { sites } = await RESTApi.fetchData();

    return sites;
  },
  fetchSiteInfo: async (): Promise<SiteInfo> => {
    const [data, siteId] = await Promise.all([RESTApi.fetchData(), RESTApi.fetchSite()]);

    const { site_id, site_name, edge, version, url, connected } =
      data.sites.find(({ site_id: id }) => id === siteId) || data.sites[0];

    return {
      siteId: site_id,
      siteName: site_name,
      edge,
      version,
      url,
      connected,
      numSitesConnected: connected.length,
    };
  },
  fetchTokens: async (): Promise<Token[]> => {
    const data = await RESTApi.fetchTokens();

    return data;
  },
  fetchLinks: async (): Promise<Link[]> => {
    const data = await RESTApi.fetchLinks();

    return data;
  },
};
