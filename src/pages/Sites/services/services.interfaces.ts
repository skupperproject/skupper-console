import {
    DataServicesResponse,
    DataSiteResponse,
    DeploymentLinksResponse,
    SiteResponse,
} from 'API/REST.interfaces';

export type DataServices = DataServicesResponse;
export type SiteData = DataSiteResponse;
export type Site = SiteResponse;
export type DeploymentLinks = DeploymentLinksResponse;

export interface SiteService {
    address: string;
    protocol: string;
    siteName: string;
    siteId: string;
}
