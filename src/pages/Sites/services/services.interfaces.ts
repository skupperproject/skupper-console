import {
    DataServicesResponse,
    DataSiteResponse,
    DeploymentLinksResponse,
    FlowsProcessResponse,
    ServiceConnection,
    SiteResponse,
} from 'API/REST.interfaces';

export type DataService = DataServicesResponse;
export type SiteData = DataSiteResponse;
export type Site = SiteResponse;
export type DeploymentLink = DeploymentLinksResponse;
export type Processes = FlowsProcessResponse;
export interface HttpRequest {
    id: string;
    name: string;
    requestsCountSent: number | null;
    requestsCountReceived: number | null;
    maxLatencySent: number | null;
    maxLatencyReceived: number | null;
    byteOut: number | null;
    byteIn: number | null;
}

export interface TCPRequest {
    id: string;
    name: string;
    ip: string;
    byteOut: number | null;
    byteIn: number | null;
}

export type SiteTraffic = {
    httpRequestsReceived: Record<string, ServiceConnection>;
    httpRequestsSent: Record<string, ServiceConnection>;
    tcpConnectionsIn: Record<string, ServiceConnection>;
    tcpConnectionsOut: Record<string, ServiceConnection>;
    httpRequests: HttpRequest[];
    tcpRequests: TCPRequest[];
};
