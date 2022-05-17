import { ServiceConnections } from 'API/REST.interfaces';

export interface DeploymentsMetricsProps {
    deploymentName: string;
    httpRequestsReceived: ServiceConnections[];
    httpRequestsSent: ServiceConnections[];
    tcpConnectionsIn: ServiceConnections[];
    tcpConnectionsOut: ServiceConnections[];
}

export interface SitesConnectionsDonutChartProps {
    legend?: { name: string }[];
    legendOrientation?: 'horizontal' | 'vertical';
    legendPosition?: 'bottom' | 'right';
    data: { x: string; y: number }[];
    color?: 'orange' | 'purple' | 'blue' | 'green';
}
