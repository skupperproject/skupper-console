import { bindLinksWithSiteIds } from '@core/utils/bindLinksWithSIteIds';
import { RESTApi } from 'API/REST';
import {
    HostResponse,
    LinkResponse,
    ProcessResponse,
    RouterResponse,
    SiteResponse,
} from 'API/REST.interfaces';

const SitesController = {
    getSites: async (): Promise<SiteResponse[]> => RESTApi.fetchSites(),

    getSite: async (id: string): Promise<SiteResponse> => RESTApi.fetchSite(id),

    getHostsBySiteId: async (id: string): Promise<HostResponse[]> => RESTApi.fetchHostsBySite(id),

    getActiveProcessesBySiteId: async (id: string): Promise<ProcessResponse[]> =>
        (await RESTApi.fetchProcessesBySite(id)).filter(({ endTime }) => !endTime),

    getLinksBySiteId: async (id: string): Promise<LinkResponse[]> => RESTApi.fetchLinksBySite(id),

    getRouters: async (): Promise<RouterResponse[]> => RESTApi.fetchRouters(),

    getLinkedSites(site: SiteResponse, links: LinkResponse[], routers: RouterResponse[]) {
        const linksExtendedMap = bindLinksWithSiteIds(links, routers);

        return {
            ...site,
            connected: [...new Set(linksExtendedMap[site.identity])], // remove duplicates
        };
    },
};

export default SitesController;
