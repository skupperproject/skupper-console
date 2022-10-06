import { SiteResponse } from 'API/REST.interfaces';

export interface SitesTableProps {
    sites: SiteResponse[];
}

export interface SiteExtended extends SiteResponse {
    connected: string[];
}
