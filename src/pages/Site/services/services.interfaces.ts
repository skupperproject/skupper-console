import { LinkResponse } from '@models/API/REST.interfaces';

export interface SiteService {
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
  namespace: string;
  numSitesConnected: number;
  gateway: boolean;
}

export type Link = LinkResponse;
