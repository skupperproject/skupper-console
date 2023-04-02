import { LinkResponse, RouterResponse } from '@API/REST.interfaces';
import { LINK_DIRECTIONS } from 'config';

export function bindLinksWithSiteIds(links: LinkResponse[], routers: RouterResponse[]) {
  const routersMap = routers.reduce(function (acc, { identity, parent }) {
    acc[identity] = parent;

    return acc;
  }, {} as Record<string, string>);

  // Extends each link adding the source site id and destination site id info
  const linksExtended = links
    // TODO remove ? when BE fix it
    .filter(({ name }) => name)
    .map((link) => {
      const routerIdConnected = `${link.name?.split('-').at(-1)}:0`;

      const siteId = routersMap[link.parent];
      const siteIdConnected = routersMap[routerIdConnected];

      const sourceSiteId = link.direction === LINK_DIRECTIONS.INCOMING ? siteIdConnected : siteId;
      const destinationSiteId = link.direction === LINK_DIRECTIONS.OUTGOING ? siteIdConnected : siteId;

      return { sourceSiteId, destinationSiteId, ...link };
    });

  // Map <source site Id: destination site Id> to assign to each site the sited Ids connected with him (destinations)
  // Only outgoing links are stored.
  // Instead Incoming links id are used to select the site
  return linksExtended.reduce(function (acc, { sourceSiteId, destinationSiteId }) {
    (acc[sourceSiteId] = acc[sourceSiteId] || []).push(destinationSiteId);

    return acc;
  }, {} as Record<string, string[]>);
}
