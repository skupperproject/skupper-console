import { DataServicesResponse } from '@models/API/REST.interfaces';
import { SiteInfoData } from '@models/services/REST.interfaces';

export type SiteData = {
  site_name: string;
  site_id: string;
  version: string;
  connected: string[];
  namespace: string;
  url: string;
  edge: boolean;
};

export interface ServiceData extends DataServicesResponse {
  siteId: string;
}
export interface SiteServices {
  address: string;
  protocol: string;
  siteName: string;
  siteId: string;
}
export interface TotalBytesBySite {
  siteName: string;
  totalBytes: number;
}
export interface SiteInfo extends SiteInfoData {
  numSitesConnected: number;
}
