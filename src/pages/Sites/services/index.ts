import { LinkResponse, RouterResponse, SiteResponse } from 'API/REST.interfaces';

import { LINK_DIRECTIONS } from '../Sites.constant';
import { SiteWithLinks } from '../Sites.interfaces';

const SitesController = {
  //Binds the links with the site ids, given the links and routers.
  // The output is an object that assigns to each source site id the ids of the connected
  bindLinksWithSiteIds: (sites: SiteResponse[], links: LinkResponse[], routers: RouterResponse[]): SiteWithLinks[] => {
    // Creates a map of router ids to its site identity
    // we use this object as a support to retrieve siteIds from router Ids
    const routersMap = routers.reduce(function (acc, { identity, parent: siteId }) {
      acc[identity] = siteId;

      return acc;
    }, {} as Record<string, string>);

    // This function extends each link by adding source and destination site ids connected
    const linksExtended = links
      .filter(({ name }) => name)
      .map((link) => {
        // TODO : Backend bug.  the name property of a link can sometimes be undefined even if the link itself exists.
        //The solution is to include the optional chaining operator ? until the bug is fixed.
        // To bind router and link we have to use part of the link name
        const routerIdConnected = `${link.name?.split('-').at(-1)}:0`;

        // Retrieves the site ids of the source and destination routers
        const siteId = routersMap[link.parent];
        const siteIdConnected = routersMap[routerIdConnected];

        // Assigns the site ids as source and destination site ids based on the direction of the link
        const sourceSiteId = link.direction === LINK_DIRECTIONS.INCOMING ? siteIdConnected : siteId;
        const destinationSiteId = link.direction === LINK_DIRECTIONS.OUTGOING ? siteIdConnected : siteId;

        return { sourceSiteId, destinationSiteId, ...link };
      });

    // Map <source site Id: destination site Id> to assign to each site the sited Ids connected with him (destinations)
    // Only outgoing links are stored.
    // Instead Incoming links id are used to select the site
    const linksExtendedMap = linksExtended.reduce(function (acc, { sourceSiteId, destinationSiteId }) {
      (acc[sourceSiteId] = acc[sourceSiteId] || []).push(destinationSiteId);

      return acc;
    }, {} as Record<string, string[]>);

    return sites.map((site) => ({
      ...site,
      targetIds: [...new Set(linksExtendedMap[site.identity])] // remove duplicates
    }));
  }
};

export default SitesController;
