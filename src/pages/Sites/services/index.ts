import { FlowDirection } from '@API/REST.enum';
import { LinkResponse, RouterResponse, SiteResponse } from 'API/REST.interfaces';

import { SiteWithLinks } from '../Sites.interfaces';

const SitesController = {
  //Binds the links with the site ids, given the links and routers.
  // The output is an object that assigns to each source site id the ids of the connected
  bindLinksWithSiteIds: (sites: SiteResponse[], links: LinkResponse[], routers: RouterResponse[]): SiteWithLinks[] => {
    //source routers map
    const routerIdSiteIdMap = routers.reduce(
      function (acc, { identity, parent: siteId }) {
        acc[identity] = siteId;

        return acc;
      },
      {} as Record<string, string>
    );

    // destination routers map
    const routerNameSiteIdMap = routers.reduce(
      function (acc, { name, parent: siteId }) {
        // by default the name of the router is in the format "0/routerName"
        const normalizedName = name?.split('/')[1];

        if (normalizedName) {
          acc[normalizedName] = siteId;
        }

        return acc;
      },
      {} as Record<string, string>
    );

    // This function extends each link by adding source and destination site ids connected
    const linksExtended = links
      .filter(({ name }) => name)
      .map((link) => {
        const siteId = routerIdSiteIdMap[link.parent];
        // the name of the link contains the destiantion router name
        const siteIdConnected = link.name ? routerNameSiteIdMap[link.name] : '';

        // Assigns the site ids as source and destination site ids based on the direction of the link
        const sourceSiteId = link.direction === FlowDirection.Incoming ? siteIdConnected : siteId;
        const destinationSiteId = link.direction === FlowDirection.Outgoing ? siteIdConnected : siteId;

        return { sourceSiteId, destinationSiteId, ...link };
      });

    // Map <source site Id: destination site Id> to assign to each site the sited Ids linked with him (destinations)
    // the source is the site who created the link
    // we track and keep only the link with the cost != undefined
    const linksExtendedMap = linksExtended.reduce(
      function (acc, { sourceSiteId, destinationSiteId, linkCost }) {
        const existingLink = (acc[sourceSiteId] || []).find((link) => link.targetId === destinationSiteId);

        if (
          !existingLink ||
          (existingLink.linkCost !== undefined && linkCost !== undefined && linkCost > existingLink.linkCost)
        ) {
          acc[sourceSiteId] = acc[sourceSiteId] || [];
          acc[sourceSiteId].push({ targetId: destinationSiteId, linkCost });
        } else if (existingLink && existingLink.linkCost === undefined) {
          existingLink.linkCost = linkCost;
        }

        return acc;
      },
      {} as Record<string, { targetId: string; linkCost: number }[]>
    );

    return sites.map((site) => ({
      ...site,
      // Filters the target ids to remove duplicates
      targetIds: (linksExtendedMap[site.identity] || [])
        ?.filter((obj, index, self) => index === self.findIndex((o) => o.targetId === obj.targetId))
        .filter(Boolean)
    }));
  },
  getSitePairs: (sites: SiteResponse[], links: LinkResponse[], routers: RouterResponse[]): SiteResponse[] => {
    const routersMap = routers.reduce(
      function (acc, { identity, parent: siteId }) {
        acc[identity] = siteId;

        return acc;
      },
      {} as Record<string, string>
    );

    const siteIdConnected = links
      .filter(({ name }) => name)
      .map((link) => {
        const routerIdConnected = `${link.name?.split('-').at(-1)}:0`;

        return routersMap[routerIdConnected];
      });

    return sites.filter(({ identity }) => siteIdConnected.includes(identity));
  }
};

export default SitesController;
