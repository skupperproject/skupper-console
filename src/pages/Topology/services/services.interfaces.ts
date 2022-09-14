import {
    DeploymentLinkTopology,
    FlowAggregatesResponse,
    ProcessResponse,
    SiteResponse,
} from 'API/REST.interfaces';

export type Deployments = {
    deployments: ProcessResponse[];
    deploymentLinks: DeploymentLinkTopology[];
};

export interface SitesMetrics extends SiteResponse {
    tcpConnectionsIn: FlowAggregatesResponse[];
    tcpConnectionsOut: FlowAggregatesResponse[];
}

export interface ProcessesMetrics extends ProcessResponse {
    tcpConnectionsIn: FlowAggregatesResponse[];
    tcpConnectionsOut: FlowAggregatesResponse[];
}
