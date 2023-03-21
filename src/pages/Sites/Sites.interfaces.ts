import { SiteResponse } from 'API/REST.interfaces';

export interface SiteExtended extends SiteResponse {
  connected: string[];
}
