import {
    DeploymentLinksResponse,
    FlowsProcessResponse,
    ServiceConnection,
    SiteResponse,
} from 'API/REST.interfaces';

export type Site = SiteResponse;
export type DeploymentLink = DeploymentLinksResponse;
export type Processes = FlowsProcessResponse;

export type SiteTraffic = {
    httpRequestsReceived: Record<string, ServiceConnection>;
    httpRequestsSent: Record<string, ServiceConnection>;
    tcpConnectionsIn: Record<string, ServiceConnection>;
    tcpConnectionsOut: Record<string, ServiceConnection>;
};
