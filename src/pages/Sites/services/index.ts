import { RESTApi } from 'API/REST';
import { LinkResponse, ProcessResponse, SiteDataResponse, SiteResponse } from 'API/REST.interfaces';
import { LINK_DIRECTIONS } from 'config';

import { Site } from './services.interfaces';

const SitesController = {
    getDataSites: async (): Promise<SiteDataResponse[]> => RESTApi.fetchDATASites(),

    getSites: async (): Promise<SiteResponse[]> => RESTApi.fetchSites(),

    getSite: async (id: string): Promise<Site> => {
        const site = await RESTApi.fetchSite(id);
        const hosts = await RESTApi.fetchHostsBySite(id);
        const processes = await RESTApi.fetchProcessesBySite(id);
        const links = await RESTApi.fetchLinksBySite(id);

        return { hosts, processes, linkedSites: getLinkedSites(links), ...site };
    },

    getProcessesBySiteId: async (id: string): Promise<ProcessResponse[]> =>
        (await RESTApi.fetchProcessesBySite(id)).filter(({ endTime }) => !endTime),
};

export default SitesController;

function getLinkedSites(links: LinkResponse[]) {
    return links.filter(
        (link, index, linksArray) =>
            link.direction === LINK_DIRECTIONS.OUTGOING &&
            linksArray.findIndex(({ name }) => name === link.name) === index,
    );
}
