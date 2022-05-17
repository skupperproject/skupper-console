import { ServiceConnections } from 'API/REST.interfaces';

export interface SitesMetricsProps {
    siteName: string;
    httpRequestsReceived: Record<string, ServiceConnections>;
    httpRequestsSent: Record<string, ServiceConnections>;
    tcpConnectionsIn: Record<string, ServiceConnections>;
    tcpConnectionsOut: Record<string, ServiceConnections>;
}

export interface SitesConnectionsDonutChartProps {
    legend?: { name: string }[];
    legendOrientation?: 'horizontal' | 'vertical';
    legendPosition?: 'bottom' | 'right';
    data: { x: string; y: number }[];
    color?: 'orange' | 'purple' | 'blue' | 'green';
}
