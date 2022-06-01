import { ServiceConnections } from 'API/REST.interfaces';

export interface ConnectionProps {
    rows: [string, ServiceConnections][];
}

export interface ConnectionsProps {
    httpRequestsReceived: Record<string, ServiceConnections>;
    httpRequestsSent: Record<string, ServiceConnections>;
    tcpConnectionsIn: Record<string, ServiceConnections>;
    tcpConnectionsOut: Record<string, ServiceConnections>;
}
