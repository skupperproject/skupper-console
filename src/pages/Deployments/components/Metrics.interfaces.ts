import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { ServiceConnection } from 'API/REST.interfaces';

export interface DeploymentsMetricsProps {
    deploymentName: string;
    httpRequestsReceived: ServiceConnection[];
    httpRequestsSent: ServiceConnection[];
    tcpConnectionsIn: ServiceConnection[];
    tcpConnectionsOut: ServiceConnection[];
}

export interface SitesConnectionsDonutChartProps {
    legend?: { name: string }[];
    legendOrientation?: 'horizontal' | 'vertical';
    legendPosition?: 'bottom' | 'right';
    data: { x: string; y: number }[];
    color?: 'orange' | 'purple' | 'blue' | 'green';
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
