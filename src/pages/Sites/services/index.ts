import { RESTApi } from 'API/REST';
import {
    HostResponse,
    LinkResponse,
    ProcessResponse,
    SiteDataResponse,
    SiteResponse,
} from 'API/REST.interfaces';
import { LINK_DIRECTIONS } from 'config';

const SitesController = {
    getDataSites: async (): Promise<SiteDataResponse[]> => RESTApi.fetchDATASites(),

    getSites: async (): Promise<SiteResponse[]> => RESTApi.fetchSites(),

    getSite: async (id: string): Promise<SiteResponse> => RESTApi.fetchSite(id),

    getHostsBySiteId: async (id: string): Promise<HostResponse[]> => RESTApi.fetchHostsBySite(id),

    getActiveProcessesBySiteId: async (id: string): Promise<ProcessResponse[]> =>
        (await RESTApi.fetchProcessesBySite(id)).filter(({ endTime }) => !endTime),

    getLinksBySiteId: async (id: string): Promise<LinkResponse[]> => RESTApi.fetchLinksBySite(id),

    getLinkedSites(links: LinkResponse[]) {
        return links.filter(
            (link, index, linksArray) =>
                link.direction === LINK_DIRECTIONS.OUTGOING &&
                linksArray.findIndex(({ name }) => name === link.name) === index,
        );
    },
};

export default SitesController;
