import {
    DataServicesResponse,
    DataSiteResponse,
    DeploymentLinksResponse,
    DeploymentTopologyResponse,
    SiteResponse,
} from 'API/REST.interfaces';

export type DataService = DataServicesResponse;
export type SiteData = DataSiteResponse;
export type Site = SiteResponse;

export type DeploymentNode = DeploymentTopologyResponse;

export type Deployments = {
    deployments: DeploymentNode[];
    deploymentLinks: DeploymentLinksResponse[];
};

export interface SiteService {
    address: string;
    protocol: string;
    siteName: string;
    siteId: string;
}
