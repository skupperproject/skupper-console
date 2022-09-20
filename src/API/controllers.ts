import { DataResponse } from './REST.interfaces';

export function getSites(VANdata: DataResponse) {
    const { sites } = VANdata;

    return sites.map(({ site_id, site_name, version, url, connected, gateway, namespace }) => ({
        siteId: site_id,
        siteName: site_name,
        version,
        url,
        connected,
        namespace,
        numSitesConnected: connected.length,
        gateway,
    }));
}
