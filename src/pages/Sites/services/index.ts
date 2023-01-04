import { bindLinksWithSiteIds } from '@core/utils/bindLinksWithSIteIds';
import { LinkResponse, RouterResponse, SiteResponse } from 'API/REST.interfaces';

import { SiteExtended } from '../Sites.interfaces';

const SitesController = {
    getLinkedSites(
        site: SiteResponse,
        links: LinkResponse[],
        routers: RouterResponse[],
    ): SiteExtended {
        const linksExtendedMap = bindLinksWithSiteIds(links, routers);

        return {
            ...site,
            connected: [...new Set(linksExtendedMap[site.identity])], // remove duplicates
        };
    },
};

export default SitesController;
