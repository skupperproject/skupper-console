import {
    DataServicesResponse,
    DataSiteResponse,
    DeploymentTopologyResponse,
    ServiceConnections,
    ServiceRequestReceivedResponse,
} from 'API/REST.interfaces';

export type Deployment = DeploymentTopologyResponse;
export type Service = DataServicesResponse;
export type Site = DataSiteResponse;

export interface DeploymentDetails {
    service: Service;
    site: Site;
    tcpConnectionsIn: ServiceConnections[];
    tcpConnectionsOut: ServiceConnections[];
    httpConnectionsOut: ServiceConnections[];
    httpConnectionsIn: ServiceConnections[];
}

export interface ServiceRequestReceived extends ServiceRequestReceivedResponse {
    address: string;
}
