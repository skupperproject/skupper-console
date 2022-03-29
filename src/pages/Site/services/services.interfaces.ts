import { DataServicesResponse } from '@models/API/REST.interfaces';

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
export interface OverviewService {
  address: string;
  protocol: string;
  siteName: string;
  siteId: string;
}

export type OverviewSite = SiteData;

export interface TotalBytesBySite {
  siteName: string;
  totalBytes: number;
}

interface SiteInfo {
  id: string;
  name: string;
  totalBytesBySites: TotalBytesBySite[];
}

export interface OverviewData {
  site: SiteInfo;
  sites: OverviewSite[];
  services: OverviewService[];
}
