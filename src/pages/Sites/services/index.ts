import { LinkResponse, SiteResponse } from 'API/REST.interfaces';

import { SiteWithLinks } from '../Sites.interfaces';

const SitesController = {
  // The output is an object that assigns to each source site id the ids of the connected
  bindLinksWithSiteIds: (sites: SiteResponse[], links: LinkResponse[]): SiteWithLinks[] => {
    const linksExtendedMap = links.reduce(
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
      linkSiteIds: (linksExtendedMap[site.identity] || [])
        ?.filter((obj, index, self) => index === self.findIndex((o) => o.targetId === obj.targetId))
        .filter(Boolean)
    }));
  }
};

export default SitesController;
