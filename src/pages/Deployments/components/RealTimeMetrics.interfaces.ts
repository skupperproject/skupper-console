import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { ServiceConnection } from 'API/REST.interfaces';

export interface RealTimeMetricsProps {
    deploymentName: string;
    timestamp: number;
    httpRequestsReceived: ServiceConnection[];
    httpRequestsSent: ServiceConnection[];
    tcpConnectionsIn: ServiceConnection[];
    tcpConnectionsOut: ServiceConnection[];
}

export interface RealTimeMetricChartProps {
    data: { name: string; value: number }[];
    title: string;
    color?: ChartThemeColors;
    timestamp?: number;
    formatter?: Function;
}
