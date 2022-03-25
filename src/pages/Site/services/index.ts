import { RESTServices } from '@models/services/REST';
import { DeploymentLinks } from '@models/services/REST.interfaces';

import { getServicesExposed } from '../utils';
import { OverviewData, TotalBytesBySite } from './services.interfaces';

export const SitesServices = {
  fetchOverview: async (): Promise<OverviewData> => {
    const { data, siteInfo, dataNormalized } = await RESTServices.fetchData();
    const deployments = getServicesExposed(data.services, data.sites);

    const totalBytesBySites = getTotalBytesBySite({
      direction: 'in',
      deploymentLinks: dataNormalized.deploymentLinks,
      siteId: siteInfo.siteId,
    });

    return {
      site: { id: siteInfo.siteId, name: siteInfo.siteName, totalBytesBySites },
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

function getTotalBytesBySite({
  direction,
  deploymentLinks,
  siteId,
}: {
  direction: string;
  deploymentLinks: DeploymentLinks[];
  siteId: string;
}) {
  const stat = 'bytes_out';
  const from = direction === 'out' ? 'source' : 'target';
  const to = direction === 'out' ? 'target' : 'source';

  const bytesBySite = deploymentLinks.reduce((acc, deploymentLink) => {
    const idFrom = deploymentLink[from].site.site_id;
    const idTo = deploymentLink[to].site.site_id;
    if (idFrom !== idTo && idFrom === siteId) {
      acc.push({
        siteName: deploymentLink[to].site.site_name,
        totalBytes: deploymentLink.request[stat],
      });
    }

    return acc;
  }, [] as TotalBytesBySite[]);

  return bytesBySite;
}
