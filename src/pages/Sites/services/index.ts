import { RESTApi } from 'API/REST';
import { LINK_DIRECTION } from 'API/REST.constant';
import { ProcessResponse, SiteDataResponse } from 'API/REST.interfaces';

import { Site } from './services.interfaces';

const SitesServices = {
    fetchDataSites: async (): Promise<SiteDataResponse[]> => RESTApi.fetchDATASites(),
    getSites: async (): Promise<Site[]> => {
        const sites = await RESTApi.fetchSites();

        const siteViews = await Promise.all(
            sites.map(async ({ identity }) => SitesServices.getSite(identity)),
        );

        return siteViews;
    },

    getSite: async (id: string): Promise<Site> => {
        const site = await RESTApi.fetchSite(id);
        const hosts = await RESTApi.fetchHostsBySite(id);
        const processes = await RESTApi.fetchProcessesBySite(id);
        const links = await RESTApi.fetchLinksBySite(id);

        const linkedSites = links.filter(
            (link, index, linksArray) =>
                link.direction === LINK_DIRECTION.OUTGOING &&
                linksArray.findIndex(({ name }) => name === link.name) === index,
        );

        return { hosts, processes, linkedSites, ...site };
    },

    getDataSite: async (id: string): Promise<SiteDataResponse> => {
        const sites = await RESTApi.fetchDATASites();
        const site = sites.find(({ siteId }) => siteId === id) as SiteDataResponse;

        return site;
    },

    getProcessesBySiteId: async (id: string): Promise<ProcessResponse[]> =>
        (await RESTApi.fetchProcessesBySite(id)).filter(({ endTime }) => !endTime),
};

export default SitesServices;
