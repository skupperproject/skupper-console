import {
    DeploymentLinkTopology,
    FlowAggregatesResponse,
    ProcessGroupResponse,
    ProcessResponse,
    SiteResponse,
} from 'API/REST.interfaces';

export type TopologyDeployments = {
    processes?: ProcessResponse[];
    processesLinks?: DeploymentLinkTopology[];
    processGroups?: ProcessGroupResponse[];
    processGroupsLinks?: DeploymentLinkTopology[];
};

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
