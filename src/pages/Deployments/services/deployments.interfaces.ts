import {
    DataServicesResponse,
    DataSiteResponse,
    DeploymentTopologyResponse,
    ServiceConnections,
    ServiceRequestReceivedResponse,
} from 'API/REST.interfaces';

type Service = DataServicesResponse;

type Site = DataSiteResponse;

export type Deployment = DeploymentTopologyResponse;

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
