import { RouterLinkResponse, SiteResponse } from '@sk-types/REST.interfaces';

const SitesController = {
  // The output is an object that assigns to each source site id the ids of the connected
  bindLinksWithSiteIds: (sites: SiteResponse[], links: RouterLinkResponse[]) => {
    const linksExtendedMap = links.reduce(
      function (acc, { sourceSiteId, destinationSiteId, cost }) {
        const existingLink = (acc[sourceSiteId] || []).find((link) => link.targetId === destinationSiteId);
        if (!existingLink || (existingLink.cost !== null && cost !== null && cost > existingLink.cost)) {
          acc[sourceSiteId] = acc[sourceSiteId] || [];
          acc[sourceSiteId].push({ targetId: destinationSiteId, cost });
        } else if (existingLink && existingLink.cost !== null) {
          existingLink.cost = cost;
        }

        return acc;
      },
      {} as Record<string, { targetId: string | null; cost: number | null }[]>
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
