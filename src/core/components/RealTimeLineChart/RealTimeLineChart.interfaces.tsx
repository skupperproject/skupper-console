interface DataProps {
    name: string;
    value: number;
}

export interface RealTimeLineChartProps {
    data: DataProps[];
    timestamp: number;
    options?: {
        formatter?: Function;
        chartColor?: string;
        showLegend?: boolean;
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
