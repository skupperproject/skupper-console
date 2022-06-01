import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { ServiceConnections } from 'API/REST.interfaces';

export interface RealTimeMetricsProps {
    siteName: string;
    timestamp: number;
    httpRequestsReceived: Record<string, ServiceConnections>;
    httpRequestsSent: Record<string, ServiceConnections>;
    tcpConnectionsIn: Record<string, ServiceConnections>;
    tcpConnectionsOut: Record<string, ServiceConnections>;
}

export interface RealTimeMetricChartProps {
    data: { name: string; value: number }[];
    title: string;
    color?: ChartThemeColors;
    timestamp?: number;
    formatter?: Function;
}
