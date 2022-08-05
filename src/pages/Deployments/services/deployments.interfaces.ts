import {
    DataServicesResponse,
    DataSiteResponse,
    DeploymentTopologyResponse,
    ServiceConnection,
    ServiceRequestReceivedResponse,
} from 'API/REST.interfaces';

type Service = DataServicesResponse;

export interface DeploymentTraffic extends ServiceConnection {
    site: DeploymentSite;
}

export type DeploymentSite = DataSiteResponse;

export type Deployment = DeploymentTopologyResponse;

export interface DeploymentDetails {
    service: Service;
    site: DeploymentSite;
    tcpConnectionsIn: DeploymentTraffic[];
    tcpConnectionsOut: DeploymentTraffic[];
    httpRequestsSent: DeploymentTraffic[];
    httpRequestsReceived: DeploymentTraffic[];
}

export interface ServiceRequestReceived extends ServiceRequestReceivedResponse {
    address: string;
    site: DeploymentSite;
}
