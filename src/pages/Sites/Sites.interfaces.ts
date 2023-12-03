import { SiteResponse } from '@API/REST.interfaces';

export interface SiteWithLinks extends SiteResponse {
  targetIds: { targetId: string; linkCost: number }[];
}
