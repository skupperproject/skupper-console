import { DataServices } from '@models/services/REST.interfaces';

import { ServiceData, SiteData } from '../services/services.interfaces';

const TCP_PROTOCOL = 'tcp';

/**
 * It returns the list of the services exposed in the Skupper network.
 */
export function getServicesExposed(services: DataServices[], allSites: SiteData[]) {
  const deployments: { service: ServiceData; site: SiteData }[] = [];

  services
    .filter((service) => !service.derived)
    .forEach((service) => {
      const sites = getSitesPerService(service, allSites);

      sites.forEach((site: SiteData) => {
        deployments.push({
          service: { ...service, siteId: site.site_id },
          site,
        });
      });
    });

  return deployments;
}

/**
 * It returns every site connected with a service based on the communication protocol.
 */
function getSitesPerService(service: DataServices, allSites: SiteData[]) {
  const sites: SiteData[] = [];

  if (service.protocol === TCP_PROTOCOL) {
    if (service?.connections_egress?.length) {
      service.connections_egress.forEach(({ site_id }) => {
        const site = findSite(site_id, allSites);

        if (site) {
          sites.push(site);
        }
      });

      return sites;
    }

    const targets = findAllTargetsPerService(service);
    if (targets) {
      targets.forEach(({ site_id }) => {
        const site = findSite(site_id, allSites);

        if (site) {
          sites.push(site);
        }
      });
    }

    return sites;
  }
  // for http services
  if (service.requests_handled) {
    // service that only sends requests
    if (service.requests_handled.length === 0) {
      const targets = findAllTargetsPerService(service);
      if (targets) {
        targets.forEach(({ site_id }) => {
          const site = findSite(site_id, allSites);
          if (site) {
            sites.push(site);
          }
        });
      }
    }
    service.requests_handled.forEach(({ site_id }) => {
      const site = findSite(site_id, allSites);

      if (site) {
        sites.push(site);
      }
    });
  } else {
    const targets = findAllTargetsPerService(service);

    if (targets) {
      targets.forEach(({ site_id }) => {
        const site = findSite(site_id, allSites);

        if (site) {
          sites.push(site);
        }
      });
    }
  }

  return sites;
}

/**
 * It returns the site that corresponds to a service.
 */
function findSite(site_id: string, sites: SiteData[]) {
  return sites.find((site) => site.site_id === site_id);
}

/**
 * It returns all the targets that match with the service address name.
 */
function findAllTargetsPerService(service: DataServices) {
  return service.targets?.filter(({ name }) => name.startsWith(service.address));
}
