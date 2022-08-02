import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { Traffic } from '@pages/Deployments/services/deployments.interfaces';
import { ServiceConnection } from 'API/REST.interfaces';

export interface MetricsProps {
    name: string;
    httpRequestsReceived: Record<string, ServiceConnection> | Traffic[];
    httpRequestsSent: Record<string, ServiceConnection> | Traffic[];
    tcpConnectionsIn: Record<string, ServiceConnection> | Traffic[];
    tcpConnectionsOut: Record<string, ServiceConnection> | Traffic[];
}

export interface CustomDonutChartProps {
    legend?: { name: string }[];
    legendOrientation?: 'horizontal' | 'vertical';
    legendPosition?: 'bottom' | 'right';
    data: { x: string; y: number }[];
    color?: ChartThemeColors;
    options?: {
        formatter?: Function;
        showTitle?: boolean;
    };
}

export interface BytesChartProps {
    data: { x: string; y: number }[];
    title: string;
    color?: ChartThemeColors;
    options?: {
        formatter?: Function;
        showTitle?: boolean;
    };
}
