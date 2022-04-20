import Adapter from '@models/API/adapter';
import { RESTApi } from '@models/API/REST';

import { getServicesExposed } from '../utils';
import { SiteInfo, SiteService, DeploymentLinks, DataVAN } from './services.interfaces';

export const SitesServices = {
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
};

const fetchData = async (): Promise<DataVAN> => {
    const [dataVAN] = await Promise.all([RESTApi.fetchData(), RESTApi.fetchSitesServices()]);
    const data: DataVAN = new Adapter(dataVAN).getData();

    return data;
};
