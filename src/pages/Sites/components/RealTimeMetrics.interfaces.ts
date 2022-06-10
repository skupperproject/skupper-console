import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { ServiceConnection } from 'API/REST.interfaces';

export interface RealTimeMetricsProps {
    siteName: string;
    timestamp: number;
    httpRequestsReceived: Record<string, ServiceConnection>;
    httpRequestsSent: Record<string, ServiceConnection>;
    tcpConnectionsIn: Record<string, ServiceConnection>;
    tcpConnectionsOut: Record<string, ServiceConnection>;
}

export interface RealTimeMetricChartProps {
    data: { name: string; value: number }[];
    title: string;
    color?: ChartThemeColors;
    timestamp?: number;
    formatter?: Function;
}
