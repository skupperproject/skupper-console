import { RESTApi } from 'API/REST';
import { ProcessResponse, SiteDataResponse } from 'API/REST.interfaces';
import { LINK_DIRECTIONS } from 'config';

import { Site } from './services.interfaces';

const SitesController = {
    fetchDataSites: async (): Promise<SiteDataResponse[]> => RESTApi.fetchDATASites(),
    getSites: async (): Promise<Site[]> => {
        const sites = await RESTApi.fetchSites();

        return Promise.all(sites.map(async ({ identity }) => SitesController.getSite(identity)));
    },

    getSite: async (id: string): Promise<Site> => {
        const site = await RESTApi.fetchSite(id);
        const hosts = await RESTApi.fetchHostsBySite(id);
        const processes = await RESTApi.fetchProcessesBySite(id);
        const links = await RESTApi.fetchLinksBySite(id);

        const linkedSites = links.filter(
            (link, index, linksArray) =>
                link.direction === LINK_DIRECTIONS.OUTGOING &&
                linksArray.findIndex(({ name }) => name === link.name) === index,
        );

        return { hosts: hosts || [], processes, linkedSites, ...site };
    },

    getProcessesBySiteId: async (id: string): Promise<ProcessResponse[]> =>
        (await RESTApi.fetchProcessesBySite(id)).filter(({ endTime }) => !endTime),
};

export default SitesController;
