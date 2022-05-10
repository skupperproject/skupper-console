import {
    DataServicesResponse,
    DeploymentTopologyResponse,
    ServiceConnections,
    ServiceRequestReceivedResponse,
} from 'API/REST.interfaces';

export type Deployment = DeploymentTopologyResponse;
export type Service = DataServicesResponse;

export interface DeploymentDetails {
    tcpConnectionsIn: ServiceConnections[];
    tcpConnectionsOut: ServiceConnections[];
    httpConnectionsOut: ServiceConnections[];
    httpConnectionsIn: ServiceConnections[];
}

export interface ServiceRequestReceived extends ServiceRequestReceivedResponse {
    address: string;
}
