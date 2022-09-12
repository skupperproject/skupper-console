import {
    DeploymentLinksResponse,
    HostResponse,
    LinkResponse,
    ProcessResponse,
    ServiceConnection,
    SiteResponse,
} from 'API/REST.interfaces';

export interface Site extends SiteResponse {
    hosts: HostResponse[];
    processes: ProcessResponse[];
    sitesConnected: LinkResponse[];
}

export type DeploymentLink = DeploymentLinksResponse;
export type Processes = ProcessResponse;

export type SiteTraffic = {
    httpRequestsReceived: Record<string, ServiceConnection>;
    httpRequestsSent: Record<string, ServiceConnection>;
    tcpConnectionsIn: Record<string, ServiceConnection>;
    tcpConnectionsOut: Record<string, ServiceConnection>;
};
