import Adapter from '@models/API/adapter';
import { RESTApi } from '@models/API/REST';

import { getServicesExposed } from '../utils';
import { SiteInfo, SiteService, Link, DeploymentLinks, DataVAN } from './services.interfaces';

export const SitesServices = {
  fetchSiteId: async (): Promise<string> => {
    const siteId = await RESTApi.fetchSite();

    return siteId;
  },
  fetchDeploymentLinks: async (): Promise<DeploymentLinks[]> => {
    const { deploymentLinks } = await fetchData();

    return deploymentLinks;
  },
  fetchServices: async (): Promise<SiteService[]> => {
    const { services, sites } = await fetchData();
    const servicesExposed = getServicesExposed(services, sites);

    return servicesExposed.map((deployment) => ({
      address: deployment.service.address,
      protocol: deployment.service.protocol,
      siteName: deployment.site.site_name,
      siteId: deployment.site.site_id,
    }));
  },
  fetchSites: async (): Promise<SiteInfo[]> => {
    const { sites } = await RESTApi.fetchData();

    return sites.map(
      ({ site_id, site_name, edge, version, url, connected, gateway, namespace }) => ({
        siteId: site_id,
        siteName: site_name,
        edge,
        version,
        url,
        connected,
        namespace,
        numSitesConnected: connected.length,
        gateway,
      }),
    );
  },
  fetchSiteInfo: async (): Promise<SiteInfo> => {
    const [data, siteId] = await Promise.all([RESTApi.fetchData(), RESTApi.fetchSite()]);

    const { site_id, site_name, edge, version, url, connected, gateway, namespace } =
      data.sites.find(({ site_id: id }) => id === siteId) || data.sites[0];

    return {
      siteId: site_id,
      siteName: site_name,
      edge,
      version,
      url,
      connected,
      namespace,
      numSitesConnected: connected.length,
      gateway,
    };
  },
  fetchLinks: async (): Promise<Link[]> => {
    const data = await RESTApi.fetchLinks();

    return data;
  },
};

const fetchData = async (): Promise<DataVAN> => {
  const [dataVAN] = await Promise.all([
    RESTApi.fetchData(),
    RESTApi.fetchSite(),
    RESTApi.fetchLinks(),
    RESTApi.fetchTargets(),
    RESTApi.fetchSitesServices(),
  ]);
  const data: DataVAN = new Adapter(dataVAN).getData();

  return data;
};
