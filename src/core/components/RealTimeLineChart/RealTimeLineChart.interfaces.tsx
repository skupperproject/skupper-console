interface DataProps {
    name: string;
    value: number;
}

export interface RealTimeLineChartProps {
    data: DataProps[];
    options?: {
        type?: 'line' | 'area';
        formatter?: Function;
        chartColor?: string;
        height?: number;
        width?: number;
        padding?: {
            bottom: number;
            left: number;
            right: number;
            top: number;
        };
        colorScale?: string[];
        dataLegend?: {
            name: string;
        }[];
    };
}

export interface SampleProps {
    x: string;
    y: number;
    name: string;
    timestamp: number;
}
