import {
    FlowAggregatesResponse,
    ProcessGroupResponse,
    ProcessResponse,
    SiteResponse,
} from 'API/REST.interfaces';

export interface SitesMetrics extends SiteResponse {
    tcpConnectionsIn: FlowAggregatesResponse[];
    tcpConnectionsOut: FlowAggregatesResponse[];
}

export interface ProcessGroupMetrics extends ProcessGroupResponse {
    tcpConnectionsIn: ProcessConnectedDetail[];
    tcpConnectionsOut: ProcessConnectedDetail[];
}

export interface ProcessConnectedDetail {
    identity: string;
    processId: string;
    processName: string;
    octetRate: number;
    recordCount: number;
}

export interface ProcessesMetrics extends ProcessResponse {
    tcpConnectionsIn: ProcessConnectedDetail[];
    tcpConnectionsOut: ProcessConnectedDetail[];
}

export interface LinkTopology {
    key: string;
    source: string;
    target: string;
    isActive?: boolean;
}
