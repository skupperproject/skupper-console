import {
    HostResponse,
    LinkResponse,
    ProcessResponse,
    ServiceConnection,
    SiteResponse,
} from 'API/REST.interfaces';

export interface Site extends SiteResponse {
    hosts: HostResponse[];
    processes: ProcessResponse[];
    linkedSites: LinkResponse[];
}

export type SiteMetrics = {
    tcpConnectionsIn: Record<string, ServiceConnection>;
    tcpConnectionsOut: Record<string, ServiceConnection>;
};
