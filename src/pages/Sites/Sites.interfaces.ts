import { SiteResponse } from 'API/REST.interfaces';

export interface SitesTableProps {
    sites: SiteResponse[];
    onGetFilters?: Function;
    rowsCount: number;
}

export interface SiteExtended extends SiteResponse {
    connected: string[];
}

export interface SiteNameLinkCellProps {
    data: SiteResponse;
    value: SiteResponse[keyof SiteResponse];
}
