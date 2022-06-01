import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { ServiceConnections } from 'API/REST.interfaces';

export interface MetricsProps {
    siteName: string;
    httpRequestsReceived: Record<string, ServiceConnections>;
    httpRequestsSent: Record<string, ServiceConnections>;
    tcpConnectionsIn: Record<string, ServiceConnections>;
    tcpConnectionsOut: Record<string, ServiceConnections>;
}

export interface MetricsChartProps {
    legend?: { name: string }[];
    legendOrientation?: 'horizontal' | 'vertical';
    legendPosition?: 'bottom' | 'right';
    data: { x: string; y: number }[];
    color?: ChartThemeColors;
}

export interface MetricChartProps {
    data: { x: string; y: number }[];
    title: string;
    color?: ChartThemeColors;
}
