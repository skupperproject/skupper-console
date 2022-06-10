import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { ServiceConnection } from 'API/REST.interfaces';

export interface MetricsProps {
    siteName: string;
    httpRequestsReceived: Record<string, ServiceConnection>;
    httpRequestsSent: Record<string, ServiceConnection>;
    tcpConnectionsIn: Record<string, ServiceConnection>;
    tcpConnectionsOut: Record<string, ServiceConnection>;
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
