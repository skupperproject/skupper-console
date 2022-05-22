import { ServiceConnections } from 'API/REST.interfaces';

export interface SitesConnectionProps {
    rows: [string, ServiceConnections][];
}

export interface SitesMetricsRealTimeProps {
    siteName: string;
    timestamp: number;
    httpRequestsReceived: Record<string, ServiceConnections>;
    httpRequestsSent: Record<string, ServiceConnections>;
    tcpConnectionsIn: Record<string, ServiceConnections>;
    tcpConnectionsOut: Record<string, ServiceConnections>;
}
