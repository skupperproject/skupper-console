import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { Traffic } from '@pages/Deployments/services/deployments.interfaces';
import { ServiceConnection } from 'API/REST.interfaces';

export interface RealTimeMetricsProps {
    name: string;
    httpRequestsReceived: Record<string, ServiceConnection> | Traffic[];
    httpRequestsSent: Record<string, ServiceConnection> | Traffic[];
    tcpConnectionsIn: Record<string, ServiceConnection> | Traffic[];
    tcpConnectionsOut: Record<string, ServiceConnection> | Traffic[];
}

export interface RealTimeMetricChartProps {
    data: { name: string; value: number }[];
    title: string;
    color?: ChartThemeColors;
    formatter?: Function;
}
