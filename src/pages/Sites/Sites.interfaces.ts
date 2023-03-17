import { SiteResponse } from 'API/REST.interfaces';

export interface SiteExtended extends SiteResponse {
  connected: string[];
}

export interface SiteNameLinkCellProps {
  data: SiteResponse;
  value: SiteResponse[keyof SiteResponse];
}
