import { SiteResponse } from '@API/REST.interfaces';

export interface SiteWithLinks extends SiteResponse {
  linkSiteIds: { targetId: string; linkCost: number }[];
}

export interface DetailsProps {
  site: SiteResponse;
}
