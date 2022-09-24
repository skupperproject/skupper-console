import { ProcessResponse, ServiceResponse } from 'API/REST.interfaces';

export interface ServicesTableProps {
    services: ServiceResponse[];
}

export interface ServicesMetricsProps {
    services: ServiceResponse[];
}

export interface ProcessesTableProps {
    processes: ProcessResponse[];
}

export interface ServicesBytesChartProps {
    bytes: { x: string; y: number }[];
    labels?: { name: string }[];
    themeColor?: string;
}
