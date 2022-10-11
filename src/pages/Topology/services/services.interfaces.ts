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
    tcpConnectionsIn: FlowAggregatesResponse[];
    tcpConnectionsOut: FlowAggregatesResponse[];
}

export interface ProcessesMetrics extends ProcessResponse {
    tcpConnectionsIn: FlowAggregatesResponse[];
    tcpConnectionsOut: FlowAggregatesResponse[];
}
