import {
  DataServicesResponse,
  DataSiteResponse,
  TokenResponse,
  LinkResponse,
} from '@models/API/REST.interfaces';

export type SiteData = DataSiteResponse;

export interface ServiceData extends DataServicesResponse {
  siteId: string;
}
export interface SiteServices {
  address: string;
  protocol: string;
  siteName: string;
  siteId: string;
}

export interface SiteInfo {
  siteId: string;
  siteName: string;
  edge: boolean;
  version: string;
  url: string;
  connected: string[];
  numSitesConnected: number;
}

export type Token = TokenResponse;
export type Link = LinkResponse;
