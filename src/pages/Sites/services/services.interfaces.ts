import {
    DataResponse,
    DataServicesResponse,
    DataSiteResponse,
    ServiceConnections,
} from '@models/API/REST.interfaces';

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

export type DataServices = DataServicesResponse;
export type SiteData = DataSiteResponse;

interface DeploymentLinksStreamPoints {
    site: { site_id: string; site_name: string };
}

export interface DeploymentLinks {
    key: string;
    request: ServiceConnections;
    source: DeploymentLinksStreamPoints;
    target: DeploymentLinksStreamPoints;
}

interface Deployments {
    key: string;
    service: any;
    site: any;
}

export interface DataVAN extends DataResponse {
    deployments: Deployments;
    deploymentLinks: DeploymentLinks[];
}
