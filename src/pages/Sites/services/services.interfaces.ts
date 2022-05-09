import {
    DataServicesResponse,
    DataSiteResponse,
    DeploymentLinksResponse,
    DeploymentTopologyResponse,
    ServiceConnections,
    SiteResponse,
} from 'API/REST.interfaces';

export type DataService = DataServicesResponse;
export type SiteData = DataSiteResponse;
export type Site = SiteResponse;
export type DeploymentLink = DeploymentLinksResponse;

export type SiteDetails = SiteResponse & {
    httpRequestsReceived: Record<string, ServiceConnections>;
    httpRequestsSent: Record<string, ServiceConnections>;
    tcpConnectionsIn: Record<string, ServiceConnections>;
    tcpConnectionsOut: Record<string, ServiceConnections>;
};

export type DeploymentNode = DeploymentTopologyResponse;

export type Deployments = {
    deployments: DeploymentNode[];
    deploymentLinks: DeploymentLink[];
};

export interface SiteService {
    address: string;
    protocol: string;
    siteName: string;
    siteId: string;
}
