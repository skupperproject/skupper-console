import {
    DataServicesResponse,
    DataSiteResponse,
    DeploymentLinksResponse,
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
