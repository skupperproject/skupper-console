import {
  DataResponse,
  LinksResponse,
  ServiceConnections,
  DataServicesResponse,
  TokenResponse,
  DataSiteResponse,
} from '../API/REST.interfaces';

export interface DataServices extends DataServicesResponse {
  derived?: boolean;
  isExternal?: boolean;
}

export interface SiteInfoData {
  siteId: string;
  siteName: string;
  edge: boolean;
  version: string;
  url: string;
  connected: string[];
}

interface Deployments {
  key: string;
  service: any;
  site: any;
}

interface DeploymentLinksStreamPoints {
  site: { site_id: string; site_name: string };
}

export interface DeploymentLinks {
  key: string;
  request: ServiceConnections;
  source: DeploymentLinksStreamPoints;
  target: DeploymentLinksStreamPoints;
}
export interface DataVAN extends DataResponse {
  deployments: Deployments;
  deploymentLinks: DeploymentLinks[];
}

export type SitesData = DataSiteResponse;
export type Tokens = TokenResponse;
export type Links = LinksResponse;
