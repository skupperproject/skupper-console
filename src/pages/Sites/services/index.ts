import { RESTApi } from 'API/REST';
import { ServiceConnection } from 'API/REST.interfaces';

import { DeploymentLink, Processes, Site, SiteTraffic } from './services.interfaces';

const SitesServices = {
    fetchSites: async (): Promise<Site[]> => RESTApi.fetchSites(),

    fetchSite: async (id: string): Promise<Site> => {
        const sites = await RESTApi.fetchSites();
        const site = sites.find(({ siteId }) => siteId === id) as Site;

        return site;
    },

    fetchProcessesBySiteId: async (id: string): Promise<Processes[]> =>
        RESTApi.fetchFlowsProcessesBySite(id),

    fetchTraffic: async (id: string): Promise<SiteTraffic> => {
        const data = await RESTApi.fetchData();

        const httpRequestsReceived = getHTTPrequestsInBySite(data.deploymentLinks, id);
        const httpRequestsSent = getHTTPrequestsOutBySite(data.deploymentLinks, id);
        const tcpConnectionsIn = getTCPConnectionsInBySite(data.deploymentLinks, id);
        const tcpConnectionsOut = getTCPConnectionsOutBySite(data.deploymentLinks, id);

        const httpRequests = getHTTPtraffic(httpRequestsSent, httpRequestsReceived);
        const tcpRequests = getTCPtraffic(tcpConnectionsOut, tcpConnectionsIn);

        return {
            httpRequestsReceived,
            httpRequestsSent,
            tcpConnectionsIn,
            tcpConnectionsOut,
            httpRequests,
            tcpRequests,
        };
    },
};

export default SitesServices;

function getTCPtraffic(
    tcpRequestsSent: Record<string, ServiceConnection>,
    tcpRequestsReceived: Record<string, ServiceConnection>,
) {
    const httpRequestsIncludedKeys = Object.keys(tcpRequestsSent).filter(
        (key) => !!tcpRequestsReceived[key],
    );
    const httpRequestsExcludedKeys = Object.keys(tcpRequestsSent).filter(
        (key) => !tcpRequestsReceived[key],
    );

    return [...httpRequestsIncludedKeys, ...httpRequestsExcludedKeys].map((key) => {
        const tcpRequestSent = tcpRequestsSent[key];
        const tcpRequestReceived = tcpRequestsReceived[key];
        const [address, id] = (tcpRequestReceived.id || tcpRequestSent.id).split('@');

        const tcpRequest = {
            id,
            name: tcpRequestReceived.client || tcpRequestSent.client,
            ip: address.split(':')[0],
            byteOut: tcpRequestSent?.bytes_out || null,
            byteIn: tcpRequestReceived?.bytes_out || null,
        };

        return tcpRequest;
    });
}

function getHTTPtraffic(
    httpRequestsSent: Record<string, ServiceConnection>,
    httpRequestsReceived: Record<string, ServiceConnection>,
) {
    const httpRequestsIncludedKeys = Object.keys(httpRequestsSent).filter(
        (key) => !!httpRequestsReceived[key],
    );
    const httpRequestsExcludedKeys = Object.keys(httpRequestsSent).filter(
        (key) => !httpRequestsReceived[key],
    );

    return [...httpRequestsIncludedKeys, ...httpRequestsExcludedKeys].map((key) => {
        const httpRequestSent = httpRequestsSent[key];
        const httpRequestReceived = httpRequestsReceived[key];

        const httpRequest = {
            id: httpRequestSent.id || httpRequestReceived.id,
            name: httpRequestSent.client || httpRequestReceived.client,
            requestsCountSent: httpRequestSent?.requests || null,
            requestsCountReceived: httpRequestReceived?.requests || null,
            maxLatencySent: httpRequestSent?.latency_max || null,
            maxLatencyReceived: httpRequestReceived?.latency_max || null,
            byteIn: httpRequestSent?.bytes_out || null,
            byteOut: httpRequestReceived?.bytes_out || null,
        };

        return httpRequest;
    });
}

function getTCPConnectionsInBySite(links: DeploymentLink[], siteId: string) {
    return links.reduce((acc, { source, target, request }) => {
        if (target.site.site_id === siteId && request.id && source.site.site_id !== siteId) {
            const sourceSiteName = source.site.site_name;
            const requestsSetPerSites = acc[sourceSiteName];

            acc[sourceSiteName] = requestsSetPerSites
                ? aggregateAttributes(request, requestsSetPerSites)
                : { ...request, client: sourceSiteName };
        }

        return acc;
    }, {} as Record<string, ServiceConnection>);
}

function getTCPConnectionsOutBySite(links: DeploymentLink[], siteId: string) {
    return links.reduce((acc, { source, target, request }) => {
        if (source.site.site_id === siteId && request.id && target.site.site_id !== siteId) {
            const targetSiteName = target.site.site_name;
            const requestsSetPerSites = acc[targetSiteName];

            acc[targetSiteName] = requestsSetPerSites
                ? aggregateAttributes(request, requestsSetPerSites)
                : { ...request, client: targetSiteName };
        }

        return acc;
    }, {} as Record<string, ServiceConnection>);
}

function getHTTPrequestsOutBySite(links: DeploymentLink[], siteId: string) {
    return links.reduce((acc, { source, target, request }) => {
        if (source.site.site_id === siteId && request.details && target.site.site_id !== siteId) {
            const targetSiteName = target.site.site_name;
            const requestsSetPerSites = acc[targetSiteName];

            acc[targetSiteName] = requestsSetPerSites
                ? aggregateAttributes(request, requestsSetPerSites)
                : { ...request, client: targetSiteName, id: target.site.site_id };
        }

        return acc;
    }, {} as Record<string, ServiceConnection>);
}

function getHTTPrequestsInBySite(links: DeploymentLink[], siteId: string) {
    return links.reduce((acc, { source, target, request }) => {
        if (target.site.site_id === siteId && request.details && source.site.site_id !== siteId) {
            const sourceSiteName = source.site.site_name;
            const requestsReceivedPerSites = acc[sourceSiteName];

            acc[sourceSiteName] = requestsReceivedPerSites
                ? aggregateAttributes(request, requestsReceivedPerSites)
                : { ...request, client: sourceSiteName, id: source.site.site_id };
        }

        return acc;
    }, {} as Record<string, ServiceConnection>);
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
