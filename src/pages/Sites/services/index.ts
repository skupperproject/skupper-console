import { RESTApi } from 'API/REST';
import { ServiceConnections } from 'API/REST.interfaces';

import { DeploymentLink, Site, SiteDetails } from './services.interfaces';

const SitesServices = {
    fetchSites: async (): Promise<Site[]> => RESTApi.fetchSites(),
    fetchSite: async (id: string | undefined): Promise<SiteDetails | null> => {
        const sites = await RESTApi.fetchSites();
        const data = await RESTApi.fetchData();
        const site = sites.find(({ siteId }) => siteId === id) as Site;

        const httpRequestsReceived = getHTTPrequestsInBySite(data.deploymentLinks, site.siteId);
        const httpRequestsSent = getHTTPrequestsOutBySite(data.deploymentLinks, site.siteId);
        const tcpConnectionsIn = getTCPConnectionsInBySite(data.deploymentLinks, site.siteId);
        const tcpConnectionsOut = getTCPConnectionsOutBySite(data.deploymentLinks, site.siteId);

        return id
            ? {
                  ...site,
                  httpRequestsReceived,
                  httpRequestsSent,
                  tcpConnectionsIn,
                  tcpConnectionsOut,
              }
            : null;
    },
};

export default SitesServices;

function getTCPConnectionsInBySite(links: DeploymentLink[], siteId: string) {
    return links.reduce((acc, { source, target, request }) => {
        if (target.site.site_id === siteId && request.id && source.site.site_id !== siteId) {
            const sourceSiteName = source.site.site_name;
            const requestsSetPerSites = acc[sourceSiteName];

            acc[sourceSiteName] = requestsSetPerSites
                ? aggregateAttributes(request, requestsSetPerSites)
                : request;
        }

        return acc;
    }, {} as Record<string, ServiceConnections>);
}

function getTCPConnectionsOutBySite(links: DeploymentLink[], siteId: string) {
    return links.reduce((acc, { source, target, request }) => {
        if (source.site.site_id === siteId && request.id && target.site.site_id !== siteId) {
            const targetSiteName = target.site.site_name;
            const requestsSetPerSites = acc[targetSiteName];

            acc[targetSiteName] = requestsSetPerSites
                ? aggregateAttributes(request, requestsSetPerSites)
                : request;
        }

        return acc;
    }, {} as Record<string, ServiceConnections>);
}

function getHTTPrequestsOutBySite(links: DeploymentLink[], siteId: string) {
    return links.reduce((acc, { source, target, request }) => {
        if (source.site.site_id === siteId && request.details) {
            const targetSiteName = target.site.site_name;
            const requestsSetPerSites = acc[targetSiteName];

            acc[targetSiteName] = requestsSetPerSites
                ? aggregateAttributes(request, requestsSetPerSites)
                : request;
        }

        return acc;
    }, {} as Record<string, ServiceConnections>);
}

function getHTTPrequestsInBySite(links: DeploymentLink[], siteId: string) {
    return links.reduce((acc, { source, target, request }) => {
        if (target.site.site_id === siteId && request.details) {
            const sourceSiteName = source.site.site_name;
            const requestsReceivedPerSites = acc[sourceSiteName];

            acc[sourceSiteName] = requestsReceivedPerSites
                ? aggregateAttributes(request, requestsReceivedPerSites)
                : request;
        }

        return acc;
    }, {} as Record<string, ServiceConnections>);
}

// add the source values to the target values for each attribute in the source.
function aggregateAttributes<ServiceConnections>(
    source: ServiceConnections,
    target: ServiceConnections,
) {
    const data = { ...target };

    Object.keys(source).forEach((attribute) => {
        const sourceValue = source[attribute as keyof typeof source];
        let dataValue = data[attribute as keyof typeof data];

        if (dataValue === undefined || dataValue === null) {
            dataValue = sourceValue;
        } else if (typeof sourceValue === 'object') {
            aggregateAttributes(sourceValue, dataValue);
        } else if (!isNaN(Number(source[attribute as keyof typeof source]))) {
            data[attribute as keyof ServiceConnections] = combineByAttribute(
                source[attribute as keyof typeof source] as any,
                dataValue as any,
                attribute,
            ) as any;
        }
    });

    return data;
}

function combineByAttribute(a: number, b: number, attr: string): number {
    if (attr === 'start_time') {
        return Math.min(a, b);
    }
    if (attr === 'last_in' || attr === 'last_out' || attr === 'latency_max') {
        return Math.max(a, b);
    }

    return a + b;
}
